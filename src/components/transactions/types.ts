export type TransactionsState = {
  loading: boolean;
  exists: boolean;
  hasNextPage: boolean;
  isNextPageLoading: boolean;
  items: Transactions[];
  oldestHeight: number | null;
}

export interface OverviewType {
  hash: string;
  height: number;
  timestamp: string;
  fee: TokenUnit;
  gasUsed: number;
  gasWanted: number;
  success: boolean;
  memo: string;
  error: string;
}

export interface TransactionState {
  loading: boolean;
  exists: boolean;
  overview: OverviewType;
  logs: null | [];
  messages: {
    filterBy: string;
    viewRaw: boolean;
    items: unknown[];
  };
}
