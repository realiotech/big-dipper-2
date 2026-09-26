import type { TxLabel } from '@/utils/tx_label';

export interface OverviewType {
  address: string;
  evmAddress: string | undefined;
  balances: Balance[];
  completed: boolean;
}

export interface BalanceType {
  available: TokenUnit;
  delegate: TokenUnit;
  unbonding: TokenUnit;
  reward: TokenUnit;
  commission?: TokenUnit;
  total: TokenUnit;
}

export interface OtherTokenType {
  denom: string;
  available: TokenUnit;
  reward: TokenUnit;
  commission: TokenUnit;
}

export interface RewardsType {
  [value: string]: TokenUnit;
}

export interface AccountBalanceState {
  loading: boolean;
  exists: boolean;
  balance: BalanceType;
  otherTokens: {
    data: OtherTokenType[];
    count: number;
  };
  rewards: RewardsType;
}

export interface AccountDesmosProfileState {
  exists: boolean;
  loading: boolean;
  desmosProfile: DesmosProfile | null;
}

export interface AccountWithdrawalAddressState {
  loading: boolean;
  overview: OverviewType;
}

export interface AccountRewardsState {
  loading: boolean;
  rewards: RewardsType;
}

export type Balance = {
  amount: string;
  denom: string;
}

export type AssetBalance = {
  spendable: number,
  delegated: number,
  unbonding: number,
}

export type AssetBalanceDetail = {
  denom: string,
  spendable: number,
  delegated: number,
  unbonding: number,
}

export type AssetBalanceMap = {
  [key: string]: AssetBalance
}

export type AssetBalanceMergedMap = {
  [key: string]: AssetBalanceDetail
}
export type AccountTransaction = {
  hash: string;
  height: number;
  success: boolean;
  timestamp: string;
  fee: number;
  label: TxLabel;
}

export type AccountInfo = {
  loading: boolean;
  accountType: string;
  publicKey: string;
  rewards: number;
}
