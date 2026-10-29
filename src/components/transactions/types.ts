import type { TxLabel } from '@/utils/tx_label';

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
  rawMessages: Array<Record<string, any>>;
  label?: TxLabel;
}
