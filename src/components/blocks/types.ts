export interface BlockType {
  height: number;
  txs: number;
  timestamp: string;
  proposer: string;
  hash: string;
}

export interface BlocksState {
  loading: boolean;
  exists: boolean;
  hasNextPage: boolean;
  isNextPageLoading: boolean;
  items: BlockType[];
  oldestHeight: number | null;
}

export type ItemType = BlockType;

export interface OverviewType {
  height: number;
  hash: string;
  txs: number;
  timestamp: string;
  proposer: string;
  // votingPower: number;
}

export interface BlockDetailState {
  loading: boolean;
  exists: boolean;
  overview: OverviewType;
  signatures: string[];
  transactions: Transactions[];
}
