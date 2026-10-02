import fs from 'node:fs';
import { ethToRealionetwork } from '@realiotech/address-generator';
import { WATCHLIST_FILE } from '@/server/monitor/config';

// The chain blocks the wallets compromised in the August 2026 incident. The
// explorer reads the same list the wallet monitor watches, once per server
// process, and answers lookups so the list never reaches the browser.
let blacklist: Set<string> | null = null;

const load = () => {
  const parsed = JSON.parse(fs.readFileSync(WATCHLIST_FILE, 'utf8')) as unknown;
  if (!Array.isArray(parsed)) throw new Error('blacklist must be a JSON array');
  return new Set(parsed.filter((value): value is string => typeof value === 'string'));
};

const addresses = () => {
  if (!blacklist) blacklist = load();
  return blacklist;
};

export const isBlacklisted = (address: string) => addresses().has(address);

export type BlacklistedHolder = { address: string; amount: string };

const CHUNK = 5000;
const FRESH_MS = 5 * 60 * 1000;
const MAX_TOKENS = 10;

// Same indexer as the explorer's pages, read with the server-only admin secret.
const indexer = async <T>(query: string, variables: Record<string, unknown>): Promise<T> => {
  const url = process.env.NEXT_PUBLIC_GRAPHQL_URL;
  if (!url) throw new Error('NEXT_PUBLIC_GRAPHQL_URL is not configured');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(process.env.HASURA_ADMIN_SECRET ? { 'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET } : {}),
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`indexer HTTP ${response.status}`);
  const body = (await response.json()) as { data?: T; errors?: { message: string }[] };
  if (body.errors?.length || !body.data) throw new Error(body.errors?.map((e) => e.message).join('; ') ?? 'indexer returned no data');
  return body.data;
};

const BALANCES = `query BlacklistBalances($addresses: [String!]!, $denom: String!) {
  balance(where: {address: {_in: $addresses}, denom: {_eq: $denom}, amount: {_neq: "0"}}) { address amount }
}`;

// Amounts are base-unit integers, too large for a float to order exactly.
const byAmountDesc = (a: BlacklistedHolder, b: BlacklistedHolder) => {
  const x = BigInt(a.amount);
  const y = BigInt(b.amount);
  return x === y ? a.address.localeCompare(b.address) : x > y ? -1 : 1;
};

// ERC-20 balances (DSTRX) are EVM state the indexer does not hold. The
// token's subgraph lists every account that ever held it, but its balances
// miss staking (tokens move to the erc20 module without a Transfer event), so
// the blacklisted accounts' balances are read on chain with balanceOf.
const ERC20_ACCOUNTS = `query BlacklistErc20Accounts($first: Int!) {
  erc20Balances(first: $first, where: {account_not: null}) { account { id } }
}`;

const fetchErc20Holders = async (denom: string) => {
  const contract = denom.slice('erc20:'.length).toLowerCase();
  const subgraph = process.env.NEXT_PUBLIC_SUBGRAPHQL_URL;
  const rpc = process.env.NEXT_PUBLIC_JSON_RPC_URL;
  if (!subgraph || !rpc) throw new Error('NEXT_PUBLIC_SUBGRAPHQL_URL and NEXT_PUBLIC_JSON_RPC_URL must be configured');
  const response = await fetch(subgraph, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: ERC20_ACCOUNTS, variables: { first: 1000 } }),
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`subgraph HTTP ${response.status}`);
  const body = (await response.json()) as { data?: { erc20Balances: { account: { id: string } }[] }; errors?: { message: string }[] };
  if (body.errors?.length || !body.data) throw new Error(body.errors?.map((e) => e.message).join('; ') ?? 'subgraph returned no data');

  const accounts = body.data.erc20Balances
    .map((b) => ({ evm: b.account.id.toLowerCase(), address: ethToRealionetwork(b.account.id) }))
    .filter((account) => isBlacklisted(account.address));
  if (!accounts.length) return [];
  // balanceOf(address): selector 0x70a08231 and the address padded to 32 bytes.
  const balances = await fetch(rpc, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(accounts.map((account, id) => ({ jsonrpc: '2.0', id, method: 'eth_call', params: [{ to: contract, data: `0x70a08231${account.evm.slice(2).padStart(64, '0')}` }, 'latest'] }))),
    signal: AbortSignal.timeout(30000),
  });
  if (!balances.ok) throw new Error(`JSON-RPC HTTP ${balances.status}`);
  const results = (await balances.json()) as Array<{ id: number; result?: string }>;
  return results
    .map((r) => ({ address: accounts[r.id].address, amount: BigInt(r.result && r.result !== '0x' ? r.result : '0x0').toString() }))
    .filter((holder) => holder.amount !== '0')
    .sort(byAmountDesc);
};

const fetchHolders = async (denom: string) => {
  if (denom.startsWith('erc20:')) return fetchErc20Holders(denom);
  const list = [...addresses()];
  const chunks = Array.from({ length: Math.ceil(list.length / CHUNK) }, (_, i) => list.slice(i * CHUNK, (i + 1) * CHUNK));
  const results = await Promise.all(chunks.map((chunk) => indexer<{ balance: BlacklistedHolder[] }>(BALANCES, { addresses: chunk, denom })));
  return results.flatMap((result) => result.balance).sort(byAmountDesc);
};

type Entry = { holders: BlacklistedHolder[]; at: number; refresh: Promise<BlacklistedHolder[]> | null };
const cache = new Map<string, Entry>();

/**
 * Blacklisted accounts holding `denom`, largest first. Kept per token and
 * refreshed in the background after five minutes; only the very first
 * request for a token waits for the indexer.
 */
export const blacklistedHolders = async (denom: string): Promise<BlacklistedHolder[]> => {
  const entry = cache.get(denom);
  const refresh = () => {
    const current = cache.get(denom);
    if (current?.refresh) return current.refresh;
    const pending = fetchHolders(denom)
      .then((holders) => {
        cache.set(denom, { holders, at: Date.now(), refresh: null });
        return holders;
      })
      .catch((error) => {
        const stale = cache.get(denom);
        if (stale?.holders.length) {
          cache.set(denom, { ...stale, refresh: null });
          return stale.holders;
        }
        cache.delete(denom);
        throw error;
      });
    // Only a handful of tokens exist; the cap keeps odd requests from growing the cache.
    if (!current && cache.size >= MAX_TOKENS) cache.delete(cache.keys().next().value as string);
    cache.set(denom, { holders: current?.holders ?? [], at: current?.at ?? 0, refresh: pending });
    return pending;
  };

  if (!entry || (!entry.at && entry.refresh)) return entry?.refresh ?? refresh();
  if (Date.now() - entry.at > FRESH_MS) refresh().catch(() => undefined);
  return entry.holders;
};
