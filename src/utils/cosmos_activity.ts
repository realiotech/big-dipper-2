import Big from 'big.js';

/**
 * What an EVM transaction did on the Cosmos side. Precompile calls (staking,
 * distribution, multistaking) move coins through Cosmos modules, which EVM
 * tooling such as Blockscout never sees: their `value` is 0 and the
 * distribution precompile even logs a claimed amount of 0. The Cosmos events
 * of the same transaction hold the real amounts.
 */

export type Coin = { denom: string; amount: string };

export type CosmosActivity =
  | { kind: 'rewards' | 'commission'; coins: Coin[]; validators: string[] }
  | { kind: 'delegate'; validator: string; coins: Coin[] }
  | { kind: 'undelegate'; validator: string; completion?: string }
  | { kind: 'redelegate'; from: string; to: string; completion?: string };

type Event = { type: string; attributes: Array<{ key: string; value: string }> };

// Multistaking's internal unit; the coins actually locked appear as transfers.
const STAKE_DENOM = 'stake';

/** Events from a transaction's `logs` column, in either SDK layout. */
const eventsOf = (logs: unknown): Event[] => {
  if (Array.isArray(logs)) return logs.flatMap((log) => (log?.events ?? []) as Event[]);
  return ((logs as { events?: Event[] } | null)?.events ?? []) as Event[];
};

const attr = (event: Event, key: string) => event.attributes.find((a) => a.key === key)?.value ?? '';

/** "12ario,3erc20:0xab…" -> coins. */
export const parseCoins = (value: string): Coin[] =>
  value
    .split(',')
    .map((part) => /^(\d+)(.+)$/.exec(part.trim()))
    .filter((match): match is RegExpExecArray => Boolean(match))
    .map(([, amount, denom]) => ({ denom, amount }));

const addCoins = (into: Map<string, Big>, coins: Coin[]) =>
  coins.forEach((coin) => into.set(coin.denom, (into.get(coin.denom) ?? Big(0)).plus(coin.amount)));

const toCoins = (sums: Map<string, Big>): Coin[] =>
  Array.from(sums, ([denom, amount]) => ({ denom, amount: amount.toFixed(0) })).filter((coin) => coin.amount !== '0');

const claimed = (events: Event[], type: string, kind: 'rewards' | 'commission'): CosmosActivity[] => {
  const matching = events.filter((event) => event.type === type);
  const sums = new Map<string, Big>();
  const validators: string[] = [];
  matching.forEach((event) => {
    const coins = parseCoins(attr(event, 'amount')).filter((coin) => coin.amount !== '0');
    addCoins(sums, coins);
    if (coins.length) validators.push(attr(event, 'validator'));
  });
  const coins = toCoins(sums);
  return coins.length ? [{ kind, coins, validators }] : [];
};

export const cosmosActivity = (logs: unknown): CosmosActivity[] => {
  const events = eventsOf(logs);
  const activity = [...claimed(events, 'withdraw_rewards', 'rewards'), ...claimed(events, 'withdraw_commission', 'commission')];

  // A delegation locks coins with the module that mints `stake` for them.
  const delegations = events.filter((event) => event.type === 'delegate');
  const stakeMinters = new Set(
    events
      .filter((event) => event.type === 'coinbase' && parseCoins(attr(event, 'amount')).some((coin) => coin.denom === STAKE_DENOM))
      .map((event) => attr(event, 'minter'))
  );
  delegations.forEach((event) => {
    const delegator = attr(event, 'delegator');
    const sums = new Map<string, Big>();
    // Only attributable when the transaction holds a single delegation.
    if (delegations.length === 1) {
      events
        .filter((t) => t.type === 'transfer' && attr(t, 'sender') === delegator && stakeMinters.has(attr(t, 'recipient')))
        .forEach((t) => addCoins(sums, parseCoins(attr(t, 'amount')).filter((coin) => coin.denom !== STAKE_DENOM)));
    }
    activity.push({ kind: 'delegate', validator: attr(event, 'validator'), coins: toCoins(sums) });
  });

  events
    .filter((event) => event.type === 'unbond')
    .forEach((event) => activity.push({ kind: 'undelegate', validator: attr(event, 'validator'), completion: attr(event, 'completion_time') || undefined }));
  events
    .filter((event) => event.type === 'redelegate')
    .forEach((event) =>
      activity.push({
        kind: 'redelegate',
        from: attr(event, 'source_validator'),
        to: attr(event, 'destination_validator'),
        completion: attr(event, 'completion_time') || undefined,
      })
    );

  return activity;
};
