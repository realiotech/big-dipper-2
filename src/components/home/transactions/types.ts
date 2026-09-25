import type { TxLabel } from "@/utils/tx_label";

export type TransactionType = {
  height: number;
  hash: string;
  success: boolean;
  timestamp: string;
  fee: number;
  label: TxLabel;
}

export type TransactionsState = {
  loading: boolean;
  items: TransactionType[]
}
