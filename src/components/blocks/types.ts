import type { TxLabel } from '@/utils/tx_label';

export interface BlockType {
  height: number;
  txs: number;
  timestamp: string;
  proposer: string;
  hash: string;
  gasUsed: number;
}

export interface OverviewType {
  height: number;
  hash: string;
  txs: number;
  timestamp: string;
  proposer: string;
  gasUsed: number;
}

export interface BlockTransaction {
  hash: string;
  success: boolean;
  label: TxLabel;
  fee: number;
  gasUsed: number;
  gasWanted: number;
}

export interface BlockDetailState {
  loading: boolean;
  exists: boolean;
  overview: OverviewType;
  signatures: string[];
  transactions: BlockTransaction[];
}
