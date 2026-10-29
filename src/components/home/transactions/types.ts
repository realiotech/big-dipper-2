import type { TxRow } from "@/utils/tx_label";

export type TransactionType = TxRow;

export type TransactionsState = {
  loading: boolean;
  items: TransactionType[]
}
