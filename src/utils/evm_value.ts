import type { CosmosActivity } from './cosmos_activity';

/**
 * Lines for an EVM transaction's "Value" row. The EVM value itself is only
 * the native RIO attached to the call; most transactions move funds another
 * way (token transfers, staking and distribution through Cosmos modules), so
 * the row lists each movement with a tag saying what it is.
 */

export type ValueTag =
  | 'Transfer'
  | 'Payment'
  | 'Claim reward'
  | 'Claim commission'
  | 'Auto-claimed'
  | 'Delegate'
  | 'Undelegate'
  | 'Redelegate'
  | 'Minted'
  | 'Burnt'
  | 'Approval';

export type ValueLine =
  | { type: 'native'; tag: 'Transfer' | 'Payment'; wei: string }
  | { type: 'cosmos'; tag: ValueTag; activity: CosmosActivity }
  | { type: 'token'; tag: 'Minted' | 'Burnt' | 'Transfer'; index: number }
  | { type: 'approval'; tag: 'Approval'; spender: string; amount: string };

/** Each token transfer's kind, as `transferKind` labels it, and raw amount. */
export type TransferSummary = { kind: 'Mint' | 'Burn' | 'Transfer'; amount?: string };

const APPROVE = '095ea7b3';
const STAKING = new Set(['delegate', 'undelegate', 'redelegate']);

const COSMOS_TAG: Record<CosmosActivity['kind'], ValueTag> = {
  rewards: 'Claim reward',
  commission: 'Claim commission',
  delegate: 'Delegate',
  undelegate: 'Undelegate',
  redelegate: 'Redelegate',
};

/** approve(address spender, uint256 amount) arguments, from call data. */
export const decodeApprove = (input?: string | null): { spender: string; amount: string } | null => {
  const hex = (input ?? '').replace(/^0x/, '').toLowerCase();
  if (!hex.startsWith(APPROVE) || hex.length < 8 + 128) return null;
  return {
    spender: `0x${hex.slice(8 + 24, 8 + 64)}`,
    amount: BigInt(`0x${hex.slice(8 + 64, 8 + 128)}`).toString(),
  };
};

export const valueLines = ({
  value,
  input,
  activity,
  transfers,
}: {
  value?: string | null;
  input?: string | null;
  activity: CosmosActivity[];
  transfers: TransferSummary[];
}): ValueLine[] => {
  const lines: ValueLine[] = [];

  if (value && value !== '0') {
    const call = (input ?? '').replace(/^0x/, '').length > 0;
    lines.push({ type: 'native', tag: call ? 'Payment' : 'Transfer', wei: value });
  }

  // Changing a delegation pays out pending rewards on its own: those are a
  // side effect, listed last, not a claim the sender made.
  const staking = activity.some((item) => STAKING.has(item.kind));
  const sideEffect = (item: CosmosActivity) => staking && item.kind === 'rewards';
  activity
    .filter((item) => !sideEffect(item))
    .sort((a, b) => Number(!STAKING.has(a.kind)) - Number(!STAKING.has(b.kind)))
    .forEach((item) => lines.push({ type: 'cosmos', tag: COSMOS_TAG[item.kind], activity: item }));

  // A delegation's coins also leave as a token transfer into staking; the
  // Delegate line already says so.
  const delegated = new Set(activity.flatMap((item) => (item.kind === 'delegate' ? item.coins.map((coin) => coin.amount) : [])));
  transfers.forEach(({ kind, amount }, index) => {
    if (kind === 'Transfer' && amount && delegated.has(amount)) return;
    let tag: 'Minted' | 'Burnt' | 'Transfer' = 'Transfer';
    if (kind === 'Mint') tag = 'Minted';
    else if (kind === 'Burn') tag = 'Burnt';
    lines.push({ type: 'token', tag, index });
  });

  const approval = transfers.length === 0 ? decodeApprove(input) : null;
  if (approval) lines.push({ type: 'approval', tag: 'Approval', ...approval });

  activity.filter(sideEffect).forEach((item) => lines.push({ type: 'cosmos', tag: 'Auto-claimed', activity: item }));

  return lines;
};
