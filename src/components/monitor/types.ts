export type DenomAmount = { denom: string; amount: string };
export type MonitorOverview = {
  snapshotAt: string | null; snapshotHead: number | null; watchlistSize: number;
  stakers: number; previousStakers: number | null; lockRows: number; validators: number;
  unbondingAddresses: number; balanceAddresses: number;
  stakeByDenom: DenomAmount[]; balanceByDenom: DenomAmount[];
  activity: { total: number; sinceRestart: number; last24h: number; distinctAddresses: number; lastHeight: number | null; lastAt: string | null };
  job: { status: string; ranAt: string | null; capturedHead: number | null; verifiedThrough: number | null; lag: number | null; stale: boolean; error: string | null };
  evm: { supportedTypes: string[]; observedTypes: { type: string; count: number }[]; actualType: string; covered: boolean };
  classifications: { address: string; tag: string; label: string | null }[];
};
export type MonitorAddress = {
  address: string; tags: string[]; validators: number; stake: DenomAmount[]; balances: DenomAmount[];
  unbonding: number; lastActivityHeight: number | null; lastActivityAt: string | null; activityCount: number; primaryAmount: string; primaryBalance: string;
};
export type MonitorActivity = {
  height: number; txHash: string; msgIndex: number; address: string; type: string;
  direction: 'incoming'|'outgoing'|'self'|'involved'; counterparties: string[];
  success: boolean | null; blockTime: string | null;
};
export type PageResult<T> = { rows: T[]; total: number; page: number; pageSize: number; pages: number };
