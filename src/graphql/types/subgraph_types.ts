import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigDecimal: any;
  BigInt: any;
  Bytes: any;
  Int8: any;
  Timestamp: any;
};

export type Account = {
  __typename?: 'Account';
  ERC20balances: Array<Erc20Balance>;
  ERC20transferFromEvent: Array<Erc20Transfer>;
  ERC20transferToEvent: Array<Erc20Transfer>;
  asERC20?: Maybe<Erc20Contract>;
  events: Array<Event>;
  id: Scalars['Bytes'];
};


export type AccountErc20balancesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Erc20Balance_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Erc20Balance_Filter>;
};


export type AccountErc20transferFromEventArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Erc20Transfer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Erc20Transfer_Filter>;
};


export type AccountErc20transferToEventArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Erc20Transfer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Erc20Transfer_Filter>;
};


export type AccountEventsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Event_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Event_Filter>;
};

export type Account_Filter = {
  ERC20balances_?: InputMaybe<Erc20Balance_Filter>;
  ERC20transferFromEvent_?: InputMaybe<Erc20Transfer_Filter>;
  ERC20transferToEvent_?: InputMaybe<Erc20Transfer_Filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Account_Filter>>>;
  asERC20?: InputMaybe<Scalars['String']>;
  asERC20_?: InputMaybe<Erc20Contract_Filter>;
  asERC20_contains?: InputMaybe<Scalars['String']>;
  asERC20_contains_nocase?: InputMaybe<Scalars['String']>;
  asERC20_ends_with?: InputMaybe<Scalars['String']>;
  asERC20_ends_with_nocase?: InputMaybe<Scalars['String']>;
  asERC20_gt?: InputMaybe<Scalars['String']>;
  asERC20_gte?: InputMaybe<Scalars['String']>;
  asERC20_in?: InputMaybe<Array<Scalars['String']>>;
  asERC20_lt?: InputMaybe<Scalars['String']>;
  asERC20_lte?: InputMaybe<Scalars['String']>;
  asERC20_not?: InputMaybe<Scalars['String']>;
  asERC20_not_contains?: InputMaybe<Scalars['String']>;
  asERC20_not_contains_nocase?: InputMaybe<Scalars['String']>;
  asERC20_not_ends_with?: InputMaybe<Scalars['String']>;
  asERC20_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  asERC20_not_in?: InputMaybe<Array<Scalars['String']>>;
  asERC20_not_starts_with?: InputMaybe<Scalars['String']>;
  asERC20_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  asERC20_starts_with?: InputMaybe<Scalars['String']>;
  asERC20_starts_with_nocase?: InputMaybe<Scalars['String']>;
  events_?: InputMaybe<Event_Filter>;
  id?: InputMaybe<Scalars['Bytes']>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  or?: InputMaybe<Array<InputMaybe<Account_Filter>>>;
};

export enum Account_OrderBy {
  Erc20balances = 'ERC20balances',
  Erc20transferFromEvent = 'ERC20transferFromEvent',
  Erc20transferToEvent = 'ERC20transferToEvent',
  AsErc20 = 'asERC20',
  AsErc20BurnCount = 'asERC20__burnCount',
  AsErc20Decimals = 'asERC20__decimals',
  AsErc20Holders = 'asERC20__holders',
  AsErc20Id = 'asERC20__id',
  AsErc20MintCount = 'asERC20__mintCount',
  AsErc20Name = 'asERC20__name',
  AsErc20Symbol = 'asERC20__symbol',
  AsErc20TransfersCount = 'asERC20__transfersCount',
  Events = 'events',
  Id = 'id'
}

export enum Aggregation_Interval {
  Day = 'day',
  Hour = 'hour'
}

export type BlockChangedFilter = {
  number_gte: Scalars['Int'];
};

export type Block_Height = {
  hash?: InputMaybe<Scalars['Bytes']>;
  number?: InputMaybe<Scalars['Int']>;
  number_gte?: InputMaybe<Scalars['Int']>;
};

export type Erc20Balance = {
  __typename?: 'ERC20Balance';
  account?: Maybe<Account>;
  contract: Erc20Contract;
  id: Scalars['ID'];
  transferFromEvent: Array<Erc20Transfer>;
  transferToEvent: Array<Erc20Transfer>;
  value: Scalars['BigDecimal'];
  valueExact: Scalars['BigInt'];
};


export type Erc20BalanceTransferFromEventArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Erc20Transfer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Erc20Transfer_Filter>;
};


export type Erc20BalanceTransferToEventArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Erc20Transfer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Erc20Transfer_Filter>;
};

export type Erc20Balance_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  account?: InputMaybe<Scalars['String']>;
  account_?: InputMaybe<Account_Filter>;
  account_contains?: InputMaybe<Scalars['String']>;
  account_contains_nocase?: InputMaybe<Scalars['String']>;
  account_ends_with?: InputMaybe<Scalars['String']>;
  account_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_gt?: InputMaybe<Scalars['String']>;
  account_gte?: InputMaybe<Scalars['String']>;
  account_in?: InputMaybe<Array<Scalars['String']>>;
  account_lt?: InputMaybe<Scalars['String']>;
  account_lte?: InputMaybe<Scalars['String']>;
  account_not?: InputMaybe<Scalars['String']>;
  account_not_contains?: InputMaybe<Scalars['String']>;
  account_not_contains_nocase?: InputMaybe<Scalars['String']>;
  account_not_ends_with?: InputMaybe<Scalars['String']>;
  account_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_not_in?: InputMaybe<Array<Scalars['String']>>;
  account_not_starts_with?: InputMaybe<Scalars['String']>;
  account_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  account_starts_with?: InputMaybe<Scalars['String']>;
  account_starts_with_nocase?: InputMaybe<Scalars['String']>;
  and?: InputMaybe<Array<InputMaybe<Erc20Balance_Filter>>>;
  contract?: InputMaybe<Scalars['String']>;
  contract_?: InputMaybe<Erc20Contract_Filter>;
  contract_contains?: InputMaybe<Scalars['String']>;
  contract_contains_nocase?: InputMaybe<Scalars['String']>;
  contract_ends_with?: InputMaybe<Scalars['String']>;
  contract_ends_with_nocase?: InputMaybe<Scalars['String']>;
  contract_gt?: InputMaybe<Scalars['String']>;
  contract_gte?: InputMaybe<Scalars['String']>;
  contract_in?: InputMaybe<Array<Scalars['String']>>;
  contract_lt?: InputMaybe<Scalars['String']>;
  contract_lte?: InputMaybe<Scalars['String']>;
  contract_not?: InputMaybe<Scalars['String']>;
  contract_not_contains?: InputMaybe<Scalars['String']>;
  contract_not_contains_nocase?: InputMaybe<Scalars['String']>;
  contract_not_ends_with?: InputMaybe<Scalars['String']>;
  contract_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  contract_not_in?: InputMaybe<Array<Scalars['String']>>;
  contract_not_starts_with?: InputMaybe<Scalars['String']>;
  contract_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  contract_starts_with?: InputMaybe<Scalars['String']>;
  contract_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  or?: InputMaybe<Array<InputMaybe<Erc20Balance_Filter>>>;
  transferFromEvent_?: InputMaybe<Erc20Transfer_Filter>;
  transferToEvent_?: InputMaybe<Erc20Transfer_Filter>;
  value?: InputMaybe<Scalars['BigDecimal']>;
  valueExact?: InputMaybe<Scalars['BigInt']>;
  valueExact_gt?: InputMaybe<Scalars['BigInt']>;
  valueExact_gte?: InputMaybe<Scalars['BigInt']>;
  valueExact_in?: InputMaybe<Array<Scalars['BigInt']>>;
  valueExact_lt?: InputMaybe<Scalars['BigInt']>;
  valueExact_lte?: InputMaybe<Scalars['BigInt']>;
  valueExact_not?: InputMaybe<Scalars['BigInt']>;
  valueExact_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  value_gt?: InputMaybe<Scalars['BigDecimal']>;
  value_gte?: InputMaybe<Scalars['BigDecimal']>;
  value_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  value_lt?: InputMaybe<Scalars['BigDecimal']>;
  value_lte?: InputMaybe<Scalars['BigDecimal']>;
  value_not?: InputMaybe<Scalars['BigDecimal']>;
  value_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
};

export enum Erc20Balance_OrderBy {
  Account = 'account',
  AccountId = 'account__id',
  Contract = 'contract',
  ContractBurnCount = 'contract__burnCount',
  ContractDecimals = 'contract__decimals',
  ContractHolders = 'contract__holders',
  ContractId = 'contract__id',
  ContractMintCount = 'contract__mintCount',
  ContractName = 'contract__name',
  ContractSymbol = 'contract__symbol',
  ContractTransfersCount = 'contract__transfersCount',
  Id = 'id',
  TransferFromEvent = 'transferFromEvent',
  TransferToEvent = 'transferToEvent',
  Value = 'value',
  ValueExact = 'valueExact'
}

export type Erc20Burn = Event & {
  __typename?: 'ERC20Burn';
  contract: Erc20Contract;
  emitter: Account;
  from?: Maybe<Account>;
  fromBalance?: Maybe<Erc20Balance>;
  id: Scalars['ID'];
  timestamp: Scalars['BigInt'];
  transaction: Transaction;
  value: Scalars['BigDecimal'];
  valueExact: Scalars['BigInt'];
};

export type Erc20Burn_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Erc20Burn_Filter>>>;
  contract?: InputMaybe<Scalars['String']>;
  contract_?: InputMaybe<Erc20Contract_Filter>;
  contract_contains?: InputMaybe<Scalars['String']>;
  contract_contains_nocase?: InputMaybe<Scalars['String']>;
  contract_ends_with?: InputMaybe<Scalars['String']>;
  contract_ends_with_nocase?: InputMaybe<Scalars['String']>;
  contract_gt?: InputMaybe<Scalars['String']>;
  contract_gte?: InputMaybe<Scalars['String']>;
  contract_in?: InputMaybe<Array<Scalars['String']>>;
  contract_lt?: InputMaybe<Scalars['String']>;
  contract_lte?: InputMaybe<Scalars['String']>;
  contract_not?: InputMaybe<Scalars['String']>;
  contract_not_contains?: InputMaybe<Scalars['String']>;
  contract_not_contains_nocase?: InputMaybe<Scalars['String']>;
  contract_not_ends_with?: InputMaybe<Scalars['String']>;
  contract_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  contract_not_in?: InputMaybe<Array<Scalars['String']>>;
  contract_not_starts_with?: InputMaybe<Scalars['String']>;
  contract_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  contract_starts_with?: InputMaybe<Scalars['String']>;
  contract_starts_with_nocase?: InputMaybe<Scalars['String']>;
  emitter?: InputMaybe<Scalars['String']>;
  emitter_?: InputMaybe<Account_Filter>;
  emitter_contains?: InputMaybe<Scalars['String']>;
  emitter_contains_nocase?: InputMaybe<Scalars['String']>;
  emitter_ends_with?: InputMaybe<Scalars['String']>;
  emitter_ends_with_nocase?: InputMaybe<Scalars['String']>;
  emitter_gt?: InputMaybe<Scalars['String']>;
  emitter_gte?: InputMaybe<Scalars['String']>;
  emitter_in?: InputMaybe<Array<Scalars['String']>>;
  emitter_lt?: InputMaybe<Scalars['String']>;
  emitter_lte?: InputMaybe<Scalars['String']>;
  emitter_not?: InputMaybe<Scalars['String']>;
  emitter_not_contains?: InputMaybe<Scalars['String']>;
  emitter_not_contains_nocase?: InputMaybe<Scalars['String']>;
  emitter_not_ends_with?: InputMaybe<Scalars['String']>;
  emitter_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  emitter_not_in?: InputMaybe<Array<Scalars['String']>>;
  emitter_not_starts_with?: InputMaybe<Scalars['String']>;
  emitter_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  emitter_starts_with?: InputMaybe<Scalars['String']>;
  emitter_starts_with_nocase?: InputMaybe<Scalars['String']>;
  from?: InputMaybe<Scalars['String']>;
  fromBalance?: InputMaybe<Scalars['String']>;
  fromBalance_?: InputMaybe<Erc20Balance_Filter>;
  fromBalance_contains?: InputMaybe<Scalars['String']>;
  fromBalance_contains_nocase?: InputMaybe<Scalars['String']>;
  fromBalance_ends_with?: InputMaybe<Scalars['String']>;
  fromBalance_ends_with_nocase?: InputMaybe<Scalars['String']>;
  fromBalance_gt?: InputMaybe<Scalars['String']>;
  fromBalance_gte?: InputMaybe<Scalars['String']>;
  fromBalance_in?: InputMaybe<Array<Scalars['String']>>;
  fromBalance_lt?: InputMaybe<Scalars['String']>;
  fromBalance_lte?: InputMaybe<Scalars['String']>;
  fromBalance_not?: InputMaybe<Scalars['String']>;
  fromBalance_not_contains?: InputMaybe<Scalars['String']>;
  fromBalance_not_contains_nocase?: InputMaybe<Scalars['String']>;
  fromBalance_not_ends_with?: InputMaybe<Scalars['String']>;
  fromBalance_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  fromBalance_not_in?: InputMaybe<Array<Scalars['String']>>;
  fromBalance_not_starts_with?: InputMaybe<Scalars['String']>;
  fromBalance_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  fromBalance_starts_with?: InputMaybe<Scalars['String']>;
  fromBalance_starts_with_nocase?: InputMaybe<Scalars['String']>;
  from_?: InputMaybe<Account_Filter>;
  from_contains?: InputMaybe<Scalars['String']>;
  from_contains_nocase?: InputMaybe<Scalars['String']>;
  from_ends_with?: InputMaybe<Scalars['String']>;
  from_ends_with_nocase?: InputMaybe<Scalars['String']>;
  from_gt?: InputMaybe<Scalars['String']>;
  from_gte?: InputMaybe<Scalars['String']>;
  from_in?: InputMaybe<Array<Scalars['String']>>;
  from_lt?: InputMaybe<Scalars['String']>;
  from_lte?: InputMaybe<Scalars['String']>;
  from_not?: InputMaybe<Scalars['String']>;
  from_not_contains?: InputMaybe<Scalars['String']>;
  from_not_contains_nocase?: InputMaybe<Scalars['String']>;
  from_not_ends_with?: InputMaybe<Scalars['String']>;
  from_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  from_not_in?: InputMaybe<Array<Scalars['String']>>;
  from_not_starts_with?: InputMaybe<Scalars['String']>;
  from_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  from_starts_with?: InputMaybe<Scalars['String']>;
  from_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  or?: InputMaybe<Array<InputMaybe<Erc20Burn_Filter>>>;
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transaction?: InputMaybe<Scalars['String']>;
  transaction_?: InputMaybe<Transaction_Filter>;
  transaction_contains?: InputMaybe<Scalars['String']>;
  transaction_contains_nocase?: InputMaybe<Scalars['String']>;
  transaction_ends_with?: InputMaybe<Scalars['String']>;
  transaction_ends_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_gt?: InputMaybe<Scalars['String']>;
  transaction_gte?: InputMaybe<Scalars['String']>;
  transaction_in?: InputMaybe<Array<Scalars['String']>>;
  transaction_lt?: InputMaybe<Scalars['String']>;
  transaction_lte?: InputMaybe<Scalars['String']>;
  transaction_not?: InputMaybe<Scalars['String']>;
  transaction_not_contains?: InputMaybe<Scalars['String']>;
  transaction_not_contains_nocase?: InputMaybe<Scalars['String']>;
  transaction_not_ends_with?: InputMaybe<Scalars['String']>;
  transaction_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_not_in?: InputMaybe<Array<Scalars['String']>>;
  transaction_not_starts_with?: InputMaybe<Scalars['String']>;
  transaction_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_starts_with?: InputMaybe<Scalars['String']>;
  transaction_starts_with_nocase?: InputMaybe<Scalars['String']>;
  value?: InputMaybe<Scalars['BigDecimal']>;
  valueExact?: InputMaybe<Scalars['BigInt']>;
  valueExact_gt?: InputMaybe<Scalars['BigInt']>;
  valueExact_gte?: InputMaybe<Scalars['BigInt']>;
  valueExact_in?: InputMaybe<Array<Scalars['BigInt']>>;
  valueExact_lt?: InputMaybe<Scalars['BigInt']>;
  valueExact_lte?: InputMaybe<Scalars['BigInt']>;
  valueExact_not?: InputMaybe<Scalars['BigInt']>;
  valueExact_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  value_gt?: InputMaybe<Scalars['BigDecimal']>;
  value_gte?: InputMaybe<Scalars['BigDecimal']>;
  value_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  value_lt?: InputMaybe<Scalars['BigDecimal']>;
  value_lte?: InputMaybe<Scalars['BigDecimal']>;
  value_not?: InputMaybe<Scalars['BigDecimal']>;
  value_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
};

export enum Erc20Burn_OrderBy {
  Contract = 'contract',
  ContractBurnCount = 'contract__burnCount',
  ContractDecimals = 'contract__decimals',
  ContractHolders = 'contract__holders',
  ContractId = 'contract__id',
  ContractMintCount = 'contract__mintCount',
  ContractName = 'contract__name',
  ContractSymbol = 'contract__symbol',
  ContractTransfersCount = 'contract__transfersCount',
  Emitter = 'emitter',
  EmitterId = 'emitter__id',
  From = 'from',
  FromBalance = 'fromBalance',
  FromBalanceId = 'fromBalance__id',
  FromBalanceValue = 'fromBalance__value',
  FromBalanceValueExact = 'fromBalance__valueExact',
  FromId = 'from__id',
  Id = 'id',
  Timestamp = 'timestamp',
  Transaction = 'transaction',
  TransactionBlockNumber = 'transaction__blockNumber',
  TransactionId = 'transaction__id',
  TransactionTimestamp = 'transaction__timestamp',
  Value = 'value',
  ValueExact = 'valueExact'
}

export type Erc20Contract = {
  __typename?: 'ERC20Contract';
  asAccount: Account;
  balances: Array<Erc20Balance>;
  burnCount: Scalars['Int'];
  decimals: Scalars['Int'];
  holders: Scalars['Int'];
  id: Scalars['Bytes'];
  mintCount: Scalars['Int'];
  name?: Maybe<Scalars['String']>;
  symbol?: Maybe<Scalars['String']>;
  totalSupply: Erc20Balance;
  transfers: Array<Erc20Transfer>;
  transfersCount: Scalars['Int'];
};


export type Erc20ContractBalancesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Erc20Balance_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Erc20Balance_Filter>;
};


export type Erc20ContractTransfersArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Erc20Transfer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Erc20Transfer_Filter>;
};

export type Erc20Contract_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Erc20Contract_Filter>>>;
  asAccount?: InputMaybe<Scalars['String']>;
  asAccount_?: InputMaybe<Account_Filter>;
  asAccount_contains?: InputMaybe<Scalars['String']>;
  asAccount_contains_nocase?: InputMaybe<Scalars['String']>;
  asAccount_ends_with?: InputMaybe<Scalars['String']>;
  asAccount_ends_with_nocase?: InputMaybe<Scalars['String']>;
  asAccount_gt?: InputMaybe<Scalars['String']>;
  asAccount_gte?: InputMaybe<Scalars['String']>;
  asAccount_in?: InputMaybe<Array<Scalars['String']>>;
  asAccount_lt?: InputMaybe<Scalars['String']>;
  asAccount_lte?: InputMaybe<Scalars['String']>;
  asAccount_not?: InputMaybe<Scalars['String']>;
  asAccount_not_contains?: InputMaybe<Scalars['String']>;
  asAccount_not_contains_nocase?: InputMaybe<Scalars['String']>;
  asAccount_not_ends_with?: InputMaybe<Scalars['String']>;
  asAccount_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  asAccount_not_in?: InputMaybe<Array<Scalars['String']>>;
  asAccount_not_starts_with?: InputMaybe<Scalars['String']>;
  asAccount_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  asAccount_starts_with?: InputMaybe<Scalars['String']>;
  asAccount_starts_with_nocase?: InputMaybe<Scalars['String']>;
  balances_?: InputMaybe<Erc20Balance_Filter>;
  burnCount?: InputMaybe<Scalars['Int']>;
  burnCount_gt?: InputMaybe<Scalars['Int']>;
  burnCount_gte?: InputMaybe<Scalars['Int']>;
  burnCount_in?: InputMaybe<Array<Scalars['Int']>>;
  burnCount_lt?: InputMaybe<Scalars['Int']>;
  burnCount_lte?: InputMaybe<Scalars['Int']>;
  burnCount_not?: InputMaybe<Scalars['Int']>;
  burnCount_not_in?: InputMaybe<Array<Scalars['Int']>>;
  decimals?: InputMaybe<Scalars['Int']>;
  decimals_gt?: InputMaybe<Scalars['Int']>;
  decimals_gte?: InputMaybe<Scalars['Int']>;
  decimals_in?: InputMaybe<Array<Scalars['Int']>>;
  decimals_lt?: InputMaybe<Scalars['Int']>;
  decimals_lte?: InputMaybe<Scalars['Int']>;
  decimals_not?: InputMaybe<Scalars['Int']>;
  decimals_not_in?: InputMaybe<Array<Scalars['Int']>>;
  holders?: InputMaybe<Scalars['Int']>;
  holders_gt?: InputMaybe<Scalars['Int']>;
  holders_gte?: InputMaybe<Scalars['Int']>;
  holders_in?: InputMaybe<Array<Scalars['Int']>>;
  holders_lt?: InputMaybe<Scalars['Int']>;
  holders_lte?: InputMaybe<Scalars['Int']>;
  holders_not?: InputMaybe<Scalars['Int']>;
  holders_not_in?: InputMaybe<Array<Scalars['Int']>>;
  id?: InputMaybe<Scalars['Bytes']>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  mintCount?: InputMaybe<Scalars['Int']>;
  mintCount_gt?: InputMaybe<Scalars['Int']>;
  mintCount_gte?: InputMaybe<Scalars['Int']>;
  mintCount_in?: InputMaybe<Array<Scalars['Int']>>;
  mintCount_lt?: InputMaybe<Scalars['Int']>;
  mintCount_lte?: InputMaybe<Scalars['Int']>;
  mintCount_not?: InputMaybe<Scalars['Int']>;
  mintCount_not_in?: InputMaybe<Array<Scalars['Int']>>;
  name?: InputMaybe<Scalars['String']>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
  or?: InputMaybe<Array<InputMaybe<Erc20Contract_Filter>>>;
  symbol?: InputMaybe<Scalars['String']>;
  symbol_contains?: InputMaybe<Scalars['String']>;
  symbol_contains_nocase?: InputMaybe<Scalars['String']>;
  symbol_ends_with?: InputMaybe<Scalars['String']>;
  symbol_ends_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_gt?: InputMaybe<Scalars['String']>;
  symbol_gte?: InputMaybe<Scalars['String']>;
  symbol_in?: InputMaybe<Array<Scalars['String']>>;
  symbol_lt?: InputMaybe<Scalars['String']>;
  symbol_lte?: InputMaybe<Scalars['String']>;
  symbol_not?: InputMaybe<Scalars['String']>;
  symbol_not_contains?: InputMaybe<Scalars['String']>;
  symbol_not_contains_nocase?: InputMaybe<Scalars['String']>;
  symbol_not_ends_with?: InputMaybe<Scalars['String']>;
  symbol_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_not_in?: InputMaybe<Array<Scalars['String']>>;
  symbol_not_starts_with?: InputMaybe<Scalars['String']>;
  symbol_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_starts_with?: InputMaybe<Scalars['String']>;
  symbol_starts_with_nocase?: InputMaybe<Scalars['String']>;
  totalSupply?: InputMaybe<Scalars['String']>;
  totalSupply_?: InputMaybe<Erc20Balance_Filter>;
  totalSupply_contains?: InputMaybe<Scalars['String']>;
  totalSupply_contains_nocase?: InputMaybe<Scalars['String']>;
  totalSupply_ends_with?: InputMaybe<Scalars['String']>;
  totalSupply_ends_with_nocase?: InputMaybe<Scalars['String']>;
  totalSupply_gt?: InputMaybe<Scalars['String']>;
  totalSupply_gte?: InputMaybe<Scalars['String']>;
  totalSupply_in?: InputMaybe<Array<Scalars['String']>>;
  totalSupply_lt?: InputMaybe<Scalars['String']>;
  totalSupply_lte?: InputMaybe<Scalars['String']>;
  totalSupply_not?: InputMaybe<Scalars['String']>;
  totalSupply_not_contains?: InputMaybe<Scalars['String']>;
  totalSupply_not_contains_nocase?: InputMaybe<Scalars['String']>;
  totalSupply_not_ends_with?: InputMaybe<Scalars['String']>;
  totalSupply_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  totalSupply_not_in?: InputMaybe<Array<Scalars['String']>>;
  totalSupply_not_starts_with?: InputMaybe<Scalars['String']>;
  totalSupply_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  totalSupply_starts_with?: InputMaybe<Scalars['String']>;
  totalSupply_starts_with_nocase?: InputMaybe<Scalars['String']>;
  transfersCount?: InputMaybe<Scalars['Int']>;
  transfersCount_gt?: InputMaybe<Scalars['Int']>;
  transfersCount_gte?: InputMaybe<Scalars['Int']>;
  transfersCount_in?: InputMaybe<Array<Scalars['Int']>>;
  transfersCount_lt?: InputMaybe<Scalars['Int']>;
  transfersCount_lte?: InputMaybe<Scalars['Int']>;
  transfersCount_not?: InputMaybe<Scalars['Int']>;
  transfersCount_not_in?: InputMaybe<Array<Scalars['Int']>>;
  transfers_?: InputMaybe<Erc20Transfer_Filter>;
};

export enum Erc20Contract_OrderBy {
  AsAccount = 'asAccount',
  AsAccountId = 'asAccount__id',
  Balances = 'balances',
  BurnCount = 'burnCount',
  Decimals = 'decimals',
  Holders = 'holders',
  Id = 'id',
  MintCount = 'mintCount',
  Name = 'name',
  Symbol = 'symbol',
  TotalSupply = 'totalSupply',
  TotalSupplyId = 'totalSupply__id',
  TotalSupplyValue = 'totalSupply__value',
  TotalSupplyValueExact = 'totalSupply__valueExact',
  Transfers = 'transfers',
  TransfersCount = 'transfersCount'
}

export type Erc20Mint = Event & {
  __typename?: 'ERC20Mint';
  contract: Erc20Contract;
  emitter: Account;
  id: Scalars['ID'];
  timestamp: Scalars['BigInt'];
  to?: Maybe<Account>;
  toBalance?: Maybe<Erc20Balance>;
  transaction: Transaction;
  value: Scalars['BigDecimal'];
  valueExact: Scalars['BigInt'];
};

export type Erc20Mint_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Erc20Mint_Filter>>>;
  contract?: InputMaybe<Scalars['String']>;
  contract_?: InputMaybe<Erc20Contract_Filter>;
  contract_contains?: InputMaybe<Scalars['String']>;
  contract_contains_nocase?: InputMaybe<Scalars['String']>;
  contract_ends_with?: InputMaybe<Scalars['String']>;
  contract_ends_with_nocase?: InputMaybe<Scalars['String']>;
  contract_gt?: InputMaybe<Scalars['String']>;
  contract_gte?: InputMaybe<Scalars['String']>;
  contract_in?: InputMaybe<Array<Scalars['String']>>;
  contract_lt?: InputMaybe<Scalars['String']>;
  contract_lte?: InputMaybe<Scalars['String']>;
  contract_not?: InputMaybe<Scalars['String']>;
  contract_not_contains?: InputMaybe<Scalars['String']>;
  contract_not_contains_nocase?: InputMaybe<Scalars['String']>;
  contract_not_ends_with?: InputMaybe<Scalars['String']>;
  contract_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  contract_not_in?: InputMaybe<Array<Scalars['String']>>;
  contract_not_starts_with?: InputMaybe<Scalars['String']>;
  contract_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  contract_starts_with?: InputMaybe<Scalars['String']>;
  contract_starts_with_nocase?: InputMaybe<Scalars['String']>;
  emitter?: InputMaybe<Scalars['String']>;
  emitter_?: InputMaybe<Account_Filter>;
  emitter_contains?: InputMaybe<Scalars['String']>;
  emitter_contains_nocase?: InputMaybe<Scalars['String']>;
  emitter_ends_with?: InputMaybe<Scalars['String']>;
  emitter_ends_with_nocase?: InputMaybe<Scalars['String']>;
  emitter_gt?: InputMaybe<Scalars['String']>;
  emitter_gte?: InputMaybe<Scalars['String']>;
  emitter_in?: InputMaybe<Array<Scalars['String']>>;
  emitter_lt?: InputMaybe<Scalars['String']>;
  emitter_lte?: InputMaybe<Scalars['String']>;
  emitter_not?: InputMaybe<Scalars['String']>;
  emitter_not_contains?: InputMaybe<Scalars['String']>;
  emitter_not_contains_nocase?: InputMaybe<Scalars['String']>;
  emitter_not_ends_with?: InputMaybe<Scalars['String']>;
  emitter_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  emitter_not_in?: InputMaybe<Array<Scalars['String']>>;
  emitter_not_starts_with?: InputMaybe<Scalars['String']>;
  emitter_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  emitter_starts_with?: InputMaybe<Scalars['String']>;
  emitter_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  or?: InputMaybe<Array<InputMaybe<Erc20Mint_Filter>>>;
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  to?: InputMaybe<Scalars['String']>;
  toBalance?: InputMaybe<Scalars['String']>;
  toBalance_?: InputMaybe<Erc20Balance_Filter>;
  toBalance_contains?: InputMaybe<Scalars['String']>;
  toBalance_contains_nocase?: InputMaybe<Scalars['String']>;
  toBalance_ends_with?: InputMaybe<Scalars['String']>;
  toBalance_ends_with_nocase?: InputMaybe<Scalars['String']>;
  toBalance_gt?: InputMaybe<Scalars['String']>;
  toBalance_gte?: InputMaybe<Scalars['String']>;
  toBalance_in?: InputMaybe<Array<Scalars['String']>>;
  toBalance_lt?: InputMaybe<Scalars['String']>;
  toBalance_lte?: InputMaybe<Scalars['String']>;
  toBalance_not?: InputMaybe<Scalars['String']>;
  toBalance_not_contains?: InputMaybe<Scalars['String']>;
  toBalance_not_contains_nocase?: InputMaybe<Scalars['String']>;
  toBalance_not_ends_with?: InputMaybe<Scalars['String']>;
  toBalance_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  toBalance_not_in?: InputMaybe<Array<Scalars['String']>>;
  toBalance_not_starts_with?: InputMaybe<Scalars['String']>;
  toBalance_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  toBalance_starts_with?: InputMaybe<Scalars['String']>;
  toBalance_starts_with_nocase?: InputMaybe<Scalars['String']>;
  to_?: InputMaybe<Account_Filter>;
  to_contains?: InputMaybe<Scalars['String']>;
  to_contains_nocase?: InputMaybe<Scalars['String']>;
  to_ends_with?: InputMaybe<Scalars['String']>;
  to_ends_with_nocase?: InputMaybe<Scalars['String']>;
  to_gt?: InputMaybe<Scalars['String']>;
  to_gte?: InputMaybe<Scalars['String']>;
  to_in?: InputMaybe<Array<Scalars['String']>>;
  to_lt?: InputMaybe<Scalars['String']>;
  to_lte?: InputMaybe<Scalars['String']>;
  to_not?: InputMaybe<Scalars['String']>;
  to_not_contains?: InputMaybe<Scalars['String']>;
  to_not_contains_nocase?: InputMaybe<Scalars['String']>;
  to_not_ends_with?: InputMaybe<Scalars['String']>;
  to_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  to_not_in?: InputMaybe<Array<Scalars['String']>>;
  to_not_starts_with?: InputMaybe<Scalars['String']>;
  to_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  to_starts_with?: InputMaybe<Scalars['String']>;
  to_starts_with_nocase?: InputMaybe<Scalars['String']>;
  transaction?: InputMaybe<Scalars['String']>;
  transaction_?: InputMaybe<Transaction_Filter>;
  transaction_contains?: InputMaybe<Scalars['String']>;
  transaction_contains_nocase?: InputMaybe<Scalars['String']>;
  transaction_ends_with?: InputMaybe<Scalars['String']>;
  transaction_ends_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_gt?: InputMaybe<Scalars['String']>;
  transaction_gte?: InputMaybe<Scalars['String']>;
  transaction_in?: InputMaybe<Array<Scalars['String']>>;
  transaction_lt?: InputMaybe<Scalars['String']>;
  transaction_lte?: InputMaybe<Scalars['String']>;
  transaction_not?: InputMaybe<Scalars['String']>;
  transaction_not_contains?: InputMaybe<Scalars['String']>;
  transaction_not_contains_nocase?: InputMaybe<Scalars['String']>;
  transaction_not_ends_with?: InputMaybe<Scalars['String']>;
  transaction_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_not_in?: InputMaybe<Array<Scalars['String']>>;
  transaction_not_starts_with?: InputMaybe<Scalars['String']>;
  transaction_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_starts_with?: InputMaybe<Scalars['String']>;
  transaction_starts_with_nocase?: InputMaybe<Scalars['String']>;
  value?: InputMaybe<Scalars['BigDecimal']>;
  valueExact?: InputMaybe<Scalars['BigInt']>;
  valueExact_gt?: InputMaybe<Scalars['BigInt']>;
  valueExact_gte?: InputMaybe<Scalars['BigInt']>;
  valueExact_in?: InputMaybe<Array<Scalars['BigInt']>>;
  valueExact_lt?: InputMaybe<Scalars['BigInt']>;
  valueExact_lte?: InputMaybe<Scalars['BigInt']>;
  valueExact_not?: InputMaybe<Scalars['BigInt']>;
  valueExact_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  value_gt?: InputMaybe<Scalars['BigDecimal']>;
  value_gte?: InputMaybe<Scalars['BigDecimal']>;
  value_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  value_lt?: InputMaybe<Scalars['BigDecimal']>;
  value_lte?: InputMaybe<Scalars['BigDecimal']>;
  value_not?: InputMaybe<Scalars['BigDecimal']>;
  value_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
};

export enum Erc20Mint_OrderBy {
  Contract = 'contract',
  ContractBurnCount = 'contract__burnCount',
  ContractDecimals = 'contract__decimals',
  ContractHolders = 'contract__holders',
  ContractId = 'contract__id',
  ContractMintCount = 'contract__mintCount',
  ContractName = 'contract__name',
  ContractSymbol = 'contract__symbol',
  ContractTransfersCount = 'contract__transfersCount',
  Emitter = 'emitter',
  EmitterId = 'emitter__id',
  Id = 'id',
  Timestamp = 'timestamp',
  To = 'to',
  ToBalance = 'toBalance',
  ToBalanceId = 'toBalance__id',
  ToBalanceValue = 'toBalance__value',
  ToBalanceValueExact = 'toBalance__valueExact',
  ToId = 'to__id',
  Transaction = 'transaction',
  TransactionBlockNumber = 'transaction__blockNumber',
  TransactionId = 'transaction__id',
  TransactionTimestamp = 'transaction__timestamp',
  Value = 'value',
  ValueExact = 'valueExact'
}

export type Erc20Transfer = Event & {
  __typename?: 'ERC20Transfer';
  contract: Erc20Contract;
  emitter: Account;
  from?: Maybe<Account>;
  fromBalance?: Maybe<Erc20Balance>;
  id: Scalars['ID'];
  timestamp: Scalars['BigInt'];
  to?: Maybe<Account>;
  toBalance?: Maybe<Erc20Balance>;
  transaction: Transaction;
  value: Scalars['BigDecimal'];
  valueExact: Scalars['BigInt'];
};

export type Erc20Transfer_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Erc20Transfer_Filter>>>;
  contract?: InputMaybe<Scalars['String']>;
  contract_?: InputMaybe<Erc20Contract_Filter>;
  contract_contains?: InputMaybe<Scalars['String']>;
  contract_contains_nocase?: InputMaybe<Scalars['String']>;
  contract_ends_with?: InputMaybe<Scalars['String']>;
  contract_ends_with_nocase?: InputMaybe<Scalars['String']>;
  contract_gt?: InputMaybe<Scalars['String']>;
  contract_gte?: InputMaybe<Scalars['String']>;
  contract_in?: InputMaybe<Array<Scalars['String']>>;
  contract_lt?: InputMaybe<Scalars['String']>;
  contract_lte?: InputMaybe<Scalars['String']>;
  contract_not?: InputMaybe<Scalars['String']>;
  contract_not_contains?: InputMaybe<Scalars['String']>;
  contract_not_contains_nocase?: InputMaybe<Scalars['String']>;
  contract_not_ends_with?: InputMaybe<Scalars['String']>;
  contract_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  contract_not_in?: InputMaybe<Array<Scalars['String']>>;
  contract_not_starts_with?: InputMaybe<Scalars['String']>;
  contract_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  contract_starts_with?: InputMaybe<Scalars['String']>;
  contract_starts_with_nocase?: InputMaybe<Scalars['String']>;
  emitter?: InputMaybe<Scalars['String']>;
  emitter_?: InputMaybe<Account_Filter>;
  emitter_contains?: InputMaybe<Scalars['String']>;
  emitter_contains_nocase?: InputMaybe<Scalars['String']>;
  emitter_ends_with?: InputMaybe<Scalars['String']>;
  emitter_ends_with_nocase?: InputMaybe<Scalars['String']>;
  emitter_gt?: InputMaybe<Scalars['String']>;
  emitter_gte?: InputMaybe<Scalars['String']>;
  emitter_in?: InputMaybe<Array<Scalars['String']>>;
  emitter_lt?: InputMaybe<Scalars['String']>;
  emitter_lte?: InputMaybe<Scalars['String']>;
  emitter_not?: InputMaybe<Scalars['String']>;
  emitter_not_contains?: InputMaybe<Scalars['String']>;
  emitter_not_contains_nocase?: InputMaybe<Scalars['String']>;
  emitter_not_ends_with?: InputMaybe<Scalars['String']>;
  emitter_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  emitter_not_in?: InputMaybe<Array<Scalars['String']>>;
  emitter_not_starts_with?: InputMaybe<Scalars['String']>;
  emitter_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  emitter_starts_with?: InputMaybe<Scalars['String']>;
  emitter_starts_with_nocase?: InputMaybe<Scalars['String']>;
  from?: InputMaybe<Scalars['String']>;
  fromBalance?: InputMaybe<Scalars['String']>;
  fromBalance_?: InputMaybe<Erc20Balance_Filter>;
  fromBalance_contains?: InputMaybe<Scalars['String']>;
  fromBalance_contains_nocase?: InputMaybe<Scalars['String']>;
  fromBalance_ends_with?: InputMaybe<Scalars['String']>;
  fromBalance_ends_with_nocase?: InputMaybe<Scalars['String']>;
  fromBalance_gt?: InputMaybe<Scalars['String']>;
  fromBalance_gte?: InputMaybe<Scalars['String']>;
  fromBalance_in?: InputMaybe<Array<Scalars['String']>>;
  fromBalance_lt?: InputMaybe<Scalars['String']>;
  fromBalance_lte?: InputMaybe<Scalars['String']>;
  fromBalance_not?: InputMaybe<Scalars['String']>;
  fromBalance_not_contains?: InputMaybe<Scalars['String']>;
  fromBalance_not_contains_nocase?: InputMaybe<Scalars['String']>;
  fromBalance_not_ends_with?: InputMaybe<Scalars['String']>;
  fromBalance_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  fromBalance_not_in?: InputMaybe<Array<Scalars['String']>>;
  fromBalance_not_starts_with?: InputMaybe<Scalars['String']>;
  fromBalance_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  fromBalance_starts_with?: InputMaybe<Scalars['String']>;
  fromBalance_starts_with_nocase?: InputMaybe<Scalars['String']>;
  from_?: InputMaybe<Account_Filter>;
  from_contains?: InputMaybe<Scalars['String']>;
  from_contains_nocase?: InputMaybe<Scalars['String']>;
  from_ends_with?: InputMaybe<Scalars['String']>;
  from_ends_with_nocase?: InputMaybe<Scalars['String']>;
  from_gt?: InputMaybe<Scalars['String']>;
  from_gte?: InputMaybe<Scalars['String']>;
  from_in?: InputMaybe<Array<Scalars['String']>>;
  from_lt?: InputMaybe<Scalars['String']>;
  from_lte?: InputMaybe<Scalars['String']>;
  from_not?: InputMaybe<Scalars['String']>;
  from_not_contains?: InputMaybe<Scalars['String']>;
  from_not_contains_nocase?: InputMaybe<Scalars['String']>;
  from_not_ends_with?: InputMaybe<Scalars['String']>;
  from_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  from_not_in?: InputMaybe<Array<Scalars['String']>>;
  from_not_starts_with?: InputMaybe<Scalars['String']>;
  from_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  from_starts_with?: InputMaybe<Scalars['String']>;
  from_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  or?: InputMaybe<Array<InputMaybe<Erc20Transfer_Filter>>>;
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  to?: InputMaybe<Scalars['String']>;
  toBalance?: InputMaybe<Scalars['String']>;
  toBalance_?: InputMaybe<Erc20Balance_Filter>;
  toBalance_contains?: InputMaybe<Scalars['String']>;
  toBalance_contains_nocase?: InputMaybe<Scalars['String']>;
  toBalance_ends_with?: InputMaybe<Scalars['String']>;
  toBalance_ends_with_nocase?: InputMaybe<Scalars['String']>;
  toBalance_gt?: InputMaybe<Scalars['String']>;
  toBalance_gte?: InputMaybe<Scalars['String']>;
  toBalance_in?: InputMaybe<Array<Scalars['String']>>;
  toBalance_lt?: InputMaybe<Scalars['String']>;
  toBalance_lte?: InputMaybe<Scalars['String']>;
  toBalance_not?: InputMaybe<Scalars['String']>;
  toBalance_not_contains?: InputMaybe<Scalars['String']>;
  toBalance_not_contains_nocase?: InputMaybe<Scalars['String']>;
  toBalance_not_ends_with?: InputMaybe<Scalars['String']>;
  toBalance_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  toBalance_not_in?: InputMaybe<Array<Scalars['String']>>;
  toBalance_not_starts_with?: InputMaybe<Scalars['String']>;
  toBalance_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  toBalance_starts_with?: InputMaybe<Scalars['String']>;
  toBalance_starts_with_nocase?: InputMaybe<Scalars['String']>;
  to_?: InputMaybe<Account_Filter>;
  to_contains?: InputMaybe<Scalars['String']>;
  to_contains_nocase?: InputMaybe<Scalars['String']>;
  to_ends_with?: InputMaybe<Scalars['String']>;
  to_ends_with_nocase?: InputMaybe<Scalars['String']>;
  to_gt?: InputMaybe<Scalars['String']>;
  to_gte?: InputMaybe<Scalars['String']>;
  to_in?: InputMaybe<Array<Scalars['String']>>;
  to_lt?: InputMaybe<Scalars['String']>;
  to_lte?: InputMaybe<Scalars['String']>;
  to_not?: InputMaybe<Scalars['String']>;
  to_not_contains?: InputMaybe<Scalars['String']>;
  to_not_contains_nocase?: InputMaybe<Scalars['String']>;
  to_not_ends_with?: InputMaybe<Scalars['String']>;
  to_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  to_not_in?: InputMaybe<Array<Scalars['String']>>;
  to_not_starts_with?: InputMaybe<Scalars['String']>;
  to_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  to_starts_with?: InputMaybe<Scalars['String']>;
  to_starts_with_nocase?: InputMaybe<Scalars['String']>;
  transaction?: InputMaybe<Scalars['String']>;
  transaction_?: InputMaybe<Transaction_Filter>;
  transaction_contains?: InputMaybe<Scalars['String']>;
  transaction_contains_nocase?: InputMaybe<Scalars['String']>;
  transaction_ends_with?: InputMaybe<Scalars['String']>;
  transaction_ends_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_gt?: InputMaybe<Scalars['String']>;
  transaction_gte?: InputMaybe<Scalars['String']>;
  transaction_in?: InputMaybe<Array<Scalars['String']>>;
  transaction_lt?: InputMaybe<Scalars['String']>;
  transaction_lte?: InputMaybe<Scalars['String']>;
  transaction_not?: InputMaybe<Scalars['String']>;
  transaction_not_contains?: InputMaybe<Scalars['String']>;
  transaction_not_contains_nocase?: InputMaybe<Scalars['String']>;
  transaction_not_ends_with?: InputMaybe<Scalars['String']>;
  transaction_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_not_in?: InputMaybe<Array<Scalars['String']>>;
  transaction_not_starts_with?: InputMaybe<Scalars['String']>;
  transaction_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_starts_with?: InputMaybe<Scalars['String']>;
  transaction_starts_with_nocase?: InputMaybe<Scalars['String']>;
  value?: InputMaybe<Scalars['BigDecimal']>;
  valueExact?: InputMaybe<Scalars['BigInt']>;
  valueExact_gt?: InputMaybe<Scalars['BigInt']>;
  valueExact_gte?: InputMaybe<Scalars['BigInt']>;
  valueExact_in?: InputMaybe<Array<Scalars['BigInt']>>;
  valueExact_lt?: InputMaybe<Scalars['BigInt']>;
  valueExact_lte?: InputMaybe<Scalars['BigInt']>;
  valueExact_not?: InputMaybe<Scalars['BigInt']>;
  valueExact_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  value_gt?: InputMaybe<Scalars['BigDecimal']>;
  value_gte?: InputMaybe<Scalars['BigDecimal']>;
  value_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  value_lt?: InputMaybe<Scalars['BigDecimal']>;
  value_lte?: InputMaybe<Scalars['BigDecimal']>;
  value_not?: InputMaybe<Scalars['BigDecimal']>;
  value_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
};

export enum Erc20Transfer_OrderBy {
  Contract = 'contract',
  ContractBurnCount = 'contract__burnCount',
  ContractDecimals = 'contract__decimals',
  ContractHolders = 'contract__holders',
  ContractId = 'contract__id',
  ContractMintCount = 'contract__mintCount',
  ContractName = 'contract__name',
  ContractSymbol = 'contract__symbol',
  ContractTransfersCount = 'contract__transfersCount',
  Emitter = 'emitter',
  EmitterId = 'emitter__id',
  From = 'from',
  FromBalance = 'fromBalance',
  FromBalanceId = 'fromBalance__id',
  FromBalanceValue = 'fromBalance__value',
  FromBalanceValueExact = 'fromBalance__valueExact',
  FromId = 'from__id',
  Id = 'id',
  Timestamp = 'timestamp',
  To = 'to',
  ToBalance = 'toBalance',
  ToBalanceId = 'toBalance__id',
  ToBalanceValue = 'toBalance__value',
  ToBalanceValueExact = 'toBalance__valueExact',
  ToId = 'to__id',
  Transaction = 'transaction',
  TransactionBlockNumber = 'transaction__blockNumber',
  TransactionId = 'transaction__id',
  TransactionTimestamp = 'transaction__timestamp',
  Value = 'value',
  ValueExact = 'valueExact'
}

export type Event = {
  emitter: Account;
  id: Scalars['ID'];
  timestamp: Scalars['BigInt'];
  transaction: Transaction;
};

export type Event_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Event_Filter>>>;
  emitter?: InputMaybe<Scalars['String']>;
  emitter_?: InputMaybe<Account_Filter>;
  emitter_contains?: InputMaybe<Scalars['String']>;
  emitter_contains_nocase?: InputMaybe<Scalars['String']>;
  emitter_ends_with?: InputMaybe<Scalars['String']>;
  emitter_ends_with_nocase?: InputMaybe<Scalars['String']>;
  emitter_gt?: InputMaybe<Scalars['String']>;
  emitter_gte?: InputMaybe<Scalars['String']>;
  emitter_in?: InputMaybe<Array<Scalars['String']>>;
  emitter_lt?: InputMaybe<Scalars['String']>;
  emitter_lte?: InputMaybe<Scalars['String']>;
  emitter_not?: InputMaybe<Scalars['String']>;
  emitter_not_contains?: InputMaybe<Scalars['String']>;
  emitter_not_contains_nocase?: InputMaybe<Scalars['String']>;
  emitter_not_ends_with?: InputMaybe<Scalars['String']>;
  emitter_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  emitter_not_in?: InputMaybe<Array<Scalars['String']>>;
  emitter_not_starts_with?: InputMaybe<Scalars['String']>;
  emitter_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  emitter_starts_with?: InputMaybe<Scalars['String']>;
  emitter_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  or?: InputMaybe<Array<InputMaybe<Event_Filter>>>;
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transaction?: InputMaybe<Scalars['String']>;
  transaction_?: InputMaybe<Transaction_Filter>;
  transaction_contains?: InputMaybe<Scalars['String']>;
  transaction_contains_nocase?: InputMaybe<Scalars['String']>;
  transaction_ends_with?: InputMaybe<Scalars['String']>;
  transaction_ends_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_gt?: InputMaybe<Scalars['String']>;
  transaction_gte?: InputMaybe<Scalars['String']>;
  transaction_in?: InputMaybe<Array<Scalars['String']>>;
  transaction_lt?: InputMaybe<Scalars['String']>;
  transaction_lte?: InputMaybe<Scalars['String']>;
  transaction_not?: InputMaybe<Scalars['String']>;
  transaction_not_contains?: InputMaybe<Scalars['String']>;
  transaction_not_contains_nocase?: InputMaybe<Scalars['String']>;
  transaction_not_ends_with?: InputMaybe<Scalars['String']>;
  transaction_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_not_in?: InputMaybe<Array<Scalars['String']>>;
  transaction_not_starts_with?: InputMaybe<Scalars['String']>;
  transaction_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_starts_with?: InputMaybe<Scalars['String']>;
  transaction_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum Event_OrderBy {
  Emitter = 'emitter',
  EmitterId = 'emitter__id',
  Id = 'id',
  Timestamp = 'timestamp',
  Transaction = 'transaction',
  TransactionBlockNumber = 'transaction__blockNumber',
  TransactionId = 'transaction__id',
  TransactionTimestamp = 'transaction__timestamp'
}

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc'
}

export type Query = {
  __typename?: 'Query';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  account?: Maybe<Account>;
  accounts: Array<Account>;
  erc20Balance?: Maybe<Erc20Balance>;
  erc20Balances: Array<Erc20Balance>;
  erc20Burn?: Maybe<Erc20Burn>;
  erc20Burns: Array<Erc20Burn>;
  erc20Contract?: Maybe<Erc20Contract>;
  erc20Contracts: Array<Erc20Contract>;
  erc20Mint?: Maybe<Erc20Mint>;
  erc20Mints: Array<Erc20Mint>;
  erc20Transfer?: Maybe<Erc20Transfer>;
  erc20Transfers: Array<Erc20Transfer>;
  event?: Maybe<Event>;
  events: Array<Event>;
  transaction?: Maybe<Transaction>;
  transactions: Array<Transaction>;
};


export type Query_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type QueryAccountArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryAccountsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Account_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Account_Filter>;
};


export type QueryErc20BalanceArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryErc20BalancesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Erc20Balance_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Erc20Balance_Filter>;
};


export type QueryErc20BurnArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryErc20BurnsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Erc20Burn_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Erc20Burn_Filter>;
};


export type QueryErc20ContractArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryErc20ContractsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Erc20Contract_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Erc20Contract_Filter>;
};


export type QueryErc20MintArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryErc20MintsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Erc20Mint_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Erc20Mint_Filter>;
};


export type QueryErc20TransferArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryErc20TransfersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Erc20Transfer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Erc20Transfer_Filter>;
};


export type QueryEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Event_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Event_Filter>;
};


export type QueryTransactionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTransactionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Transaction_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Transaction_Filter>;
};

export type Subscription = {
  __typename?: 'Subscription';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  account?: Maybe<Account>;
  accounts: Array<Account>;
  erc20Balance?: Maybe<Erc20Balance>;
  erc20Balances: Array<Erc20Balance>;
  erc20Burn?: Maybe<Erc20Burn>;
  erc20Burns: Array<Erc20Burn>;
  erc20Contract?: Maybe<Erc20Contract>;
  erc20Contracts: Array<Erc20Contract>;
  erc20Mint?: Maybe<Erc20Mint>;
  erc20Mints: Array<Erc20Mint>;
  erc20Transfer?: Maybe<Erc20Transfer>;
  erc20Transfers: Array<Erc20Transfer>;
  event?: Maybe<Event>;
  events: Array<Event>;
  transaction?: Maybe<Transaction>;
  transactions: Array<Transaction>;
};


export type Subscription_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type SubscriptionAccountArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionAccountsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Account_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Account_Filter>;
};


export type SubscriptionErc20BalanceArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionErc20BalancesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Erc20Balance_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Erc20Balance_Filter>;
};


export type SubscriptionErc20BurnArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionErc20BurnsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Erc20Burn_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Erc20Burn_Filter>;
};


export type SubscriptionErc20ContractArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionErc20ContractsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Erc20Contract_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Erc20Contract_Filter>;
};


export type SubscriptionErc20MintArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionErc20MintsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Erc20Mint_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Erc20Mint_Filter>;
};


export type SubscriptionErc20TransferArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionErc20TransfersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Erc20Transfer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Erc20Transfer_Filter>;
};


export type SubscriptionEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Event_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Event_Filter>;
};


export type SubscriptionTransactionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionTransactionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Transaction_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Transaction_Filter>;
};

export type Transaction = {
  __typename?: 'Transaction';
  blockNumber: Scalars['BigInt'];
  events: Array<Event>;
  id: Scalars['ID'];
  timestamp: Scalars['BigInt'];
};


export type TransactionEventsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Event_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Event_Filter>;
};

export type Transaction_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Transaction_Filter>>>;
  blockNumber?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  events_?: InputMaybe<Event_Filter>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  or?: InputMaybe<Array<InputMaybe<Transaction_Filter>>>;
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum Transaction_OrderBy {
  BlockNumber = 'blockNumber',
  Events = 'events',
  Id = 'id',
  Timestamp = 'timestamp'
}

export type _Block_ = {
  __typename?: '_Block_';
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']>;
  /** The block number */
  number: Scalars['Int'];
  /** The hash of the parent block */
  parentHash?: Maybe<Scalars['Bytes']>;
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars['Int']>;
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  __typename?: '_Meta_';
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   *
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean'];
};

export enum _SubgraphErrorPolicy_ {
  /** Data will be returned even if the subgraph has indexing errors */
  Allow = 'allow',
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  Deny = 'deny'
}

export type EvmAssetOverviewQueryVariables = Exact<{
  address: Scalars['ID'];
}>;


export type EvmAssetOverviewQuery = { erc20Contract?: { __typename?: 'ERC20Contract', id: any, name?: string | null, symbol?: string | null, decimals: number, holders: number, totalSupply: { __typename?: 'ERC20Balance', value: any } } | null };

export type EvmAssetHoldersQueryVariables = Exact<{
  address: Scalars['ID'];
  offset?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
}>;


export type EvmAssetHoldersQuery = { erc20Balances: Array<{ __typename?: 'ERC20Balance', value: any, account?: { __typename?: 'Account', id: any } | null }>, erc20Contract?: { __typename?: 'ERC20Contract', holders: number } | null };

export type EvmAssetTransfersQueryVariables = Exact<{
  address: Scalars['ID'];
  offset?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
}>;


export type EvmAssetTransfersQuery = { erc20Transfers: Array<{ __typename?: 'ERC20Transfer', value: any, timestamp: any, from?: { __typename?: 'Account', id: any } | null, to?: { __typename?: 'Account', id: any } | null, transaction: { __typename?: 'Transaction', id: string } }>, erc20Contract?: { __typename?: 'ERC20Contract', transfersCount: number } | null };

export type EvmAssetMintsQueryVariables = Exact<{
  address: Scalars['ID'];
  offset?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
}>;


export type EvmAssetMintsQuery = { erc20Transfers: Array<{ __typename?: 'ERC20Transfer', value: any, timestamp: any, to?: { __typename?: 'Account', id: any } | null, transaction: { __typename?: 'Transaction', id: string } }>, erc20Contract?: { __typename?: 'ERC20Contract', mintCount: number } | null };

export type EvmAssetBurnsQueryVariables = Exact<{
  address: Scalars['ID'];
  offset?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
}>;


export type EvmAssetBurnsQuery = { erc20Transfers: Array<{ __typename?: 'ERC20Transfer', value: any, timestamp: any, from?: { __typename?: 'Account', id: any } | null, transaction: { __typename?: 'Transaction', id: string } }>, erc20Contract?: { __typename?: 'ERC20Contract', burnCount: number } | null };


export const EvmAssetOverviewDocument = gql`
    query EvmAssetOverview($address: ID!) {
  erc20Contract(id: $address) {
    id
    name
    symbol
    decimals
    totalSupply {
      value
    }
    holders
  }
}
    `;

/**
 * __useEvmAssetOverviewQuery__
 *
 * To run a query within a React component, call `useEvmAssetOverviewQuery` and pass it any options that fit your needs.
 * When your component renders, `useEvmAssetOverviewQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEvmAssetOverviewQuery({
 *   variables: {
 *      address: // value for 'address'
 *   },
 * });
 */
export function useEvmAssetOverviewQuery(baseOptions: Apollo.QueryHookOptions<EvmAssetOverviewQuery, EvmAssetOverviewQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<EvmAssetOverviewQuery, EvmAssetOverviewQueryVariables>(EvmAssetOverviewDocument, options);
      }
export function useEvmAssetOverviewLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<EvmAssetOverviewQuery, EvmAssetOverviewQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<EvmAssetOverviewQuery, EvmAssetOverviewQueryVariables>(EvmAssetOverviewDocument, options);
        }
export type EvmAssetOverviewQueryHookResult = ReturnType<typeof useEvmAssetOverviewQuery>;
export type EvmAssetOverviewLazyQueryHookResult = ReturnType<typeof useEvmAssetOverviewLazyQuery>;
export type EvmAssetOverviewQueryResult = Apollo.QueryResult<EvmAssetOverviewQuery, EvmAssetOverviewQueryVariables>;
export const EvmAssetHoldersDocument = gql`
    query EvmAssetHolders($address: ID!, $offset: Int = 1, $limit: Int = 10) {
  erc20Balances(
    orderBy: value
    orderDirection: desc
    first: $limit
    skip: $offset
  ) {
    account {
      id
    }
    value
  }
  erc20Contract(id: $address) {
    holders
  }
}
    `;

/**
 * __useEvmAssetHoldersQuery__
 *
 * To run a query within a React component, call `useEvmAssetHoldersQuery` and pass it any options that fit your needs.
 * When your component renders, `useEvmAssetHoldersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEvmAssetHoldersQuery({
 *   variables: {
 *      address: // value for 'address'
 *      offset: // value for 'offset'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useEvmAssetHoldersQuery(baseOptions: Apollo.QueryHookOptions<EvmAssetHoldersQuery, EvmAssetHoldersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<EvmAssetHoldersQuery, EvmAssetHoldersQueryVariables>(EvmAssetHoldersDocument, options);
      }
export function useEvmAssetHoldersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<EvmAssetHoldersQuery, EvmAssetHoldersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<EvmAssetHoldersQuery, EvmAssetHoldersQueryVariables>(EvmAssetHoldersDocument, options);
        }
export type EvmAssetHoldersQueryHookResult = ReturnType<typeof useEvmAssetHoldersQuery>;
export type EvmAssetHoldersLazyQueryHookResult = ReturnType<typeof useEvmAssetHoldersLazyQuery>;
export type EvmAssetHoldersQueryResult = Apollo.QueryResult<EvmAssetHoldersQuery, EvmAssetHoldersQueryVariables>;
export const EvmAssetTransfersDocument = gql`
    query EvmAssetTransfers($address: ID!, $offset: Int = 0, $limit: Int = 10) {
  erc20Transfers(
    where: {from_not: null, to_not: null}
    orderBy: timestamp
    orderDirection: desc
    first: $limit
    skip: $offset
  ) {
    from {
      id
    }
    to {
      id
    }
    value
    timestamp
    transaction {
      id
    }
  }
  erc20Contract(id: $address) {
    transfersCount
  }
}
    `;

/**
 * __useEvmAssetTransfersQuery__
 *
 * To run a query within a React component, call `useEvmAssetTransfersQuery` and pass it any options that fit your needs.
 * When your component renders, `useEvmAssetTransfersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEvmAssetTransfersQuery({
 *   variables: {
 *      address: // value for 'address'
 *      offset: // value for 'offset'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useEvmAssetTransfersQuery(baseOptions: Apollo.QueryHookOptions<EvmAssetTransfersQuery, EvmAssetTransfersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<EvmAssetTransfersQuery, EvmAssetTransfersQueryVariables>(EvmAssetTransfersDocument, options);
      }
export function useEvmAssetTransfersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<EvmAssetTransfersQuery, EvmAssetTransfersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<EvmAssetTransfersQuery, EvmAssetTransfersQueryVariables>(EvmAssetTransfersDocument, options);
        }
export type EvmAssetTransfersQueryHookResult = ReturnType<typeof useEvmAssetTransfersQuery>;
export type EvmAssetTransfersLazyQueryHookResult = ReturnType<typeof useEvmAssetTransfersLazyQuery>;
export type EvmAssetTransfersQueryResult = Apollo.QueryResult<EvmAssetTransfersQuery, EvmAssetTransfersQueryVariables>;
export const EvmAssetMintsDocument = gql`
    query EvmAssetMints($address: ID!, $offset: Int = 0, $limit: Int = 10) {
  erc20Transfers(
    where: {from: null, to_not: null}
    orderBy: timestamp
    orderDirection: desc
    first: $limit
    skip: $offset
  ) {
    to {
      id
    }
    value
    timestamp
    transaction {
      id
    }
  }
  erc20Contract(id: $address) {
    mintCount
  }
}
    `;

/**
 * __useEvmAssetMintsQuery__
 *
 * To run a query within a React component, call `useEvmAssetMintsQuery` and pass it any options that fit your needs.
 * When your component renders, `useEvmAssetMintsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEvmAssetMintsQuery({
 *   variables: {
 *      address: // value for 'address'
 *      offset: // value for 'offset'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useEvmAssetMintsQuery(baseOptions: Apollo.QueryHookOptions<EvmAssetMintsQuery, EvmAssetMintsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<EvmAssetMintsQuery, EvmAssetMintsQueryVariables>(EvmAssetMintsDocument, options);
      }
export function useEvmAssetMintsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<EvmAssetMintsQuery, EvmAssetMintsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<EvmAssetMintsQuery, EvmAssetMintsQueryVariables>(EvmAssetMintsDocument, options);
        }
export type EvmAssetMintsQueryHookResult = ReturnType<typeof useEvmAssetMintsQuery>;
export type EvmAssetMintsLazyQueryHookResult = ReturnType<typeof useEvmAssetMintsLazyQuery>;
export type EvmAssetMintsQueryResult = Apollo.QueryResult<EvmAssetMintsQuery, EvmAssetMintsQueryVariables>;
export const EvmAssetBurnsDocument = gql`
    query EvmAssetBurns($address: ID!, $offset: Int = 0, $limit: Int = 10) {
  erc20Transfers(
    where: {from_not: null, to: null}
    orderBy: timestamp
    orderDirection: desc
    first: $limit
    skip: $offset
  ) {
    from {
      id
    }
    value
    timestamp
    transaction {
      id
    }
  }
  erc20Contract(id: $address) {
    burnCount
  }
}
    `;

/**
 * __useEvmAssetBurnsQuery__
 *
 * To run a query within a React component, call `useEvmAssetBurnsQuery` and pass it any options that fit your needs.
 * When your component renders, `useEvmAssetBurnsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEvmAssetBurnsQuery({
 *   variables: {
 *      address: // value for 'address'
 *      offset: // value for 'offset'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useEvmAssetBurnsQuery(baseOptions: Apollo.QueryHookOptions<EvmAssetBurnsQuery, EvmAssetBurnsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<EvmAssetBurnsQuery, EvmAssetBurnsQueryVariables>(EvmAssetBurnsDocument, options);
      }
export function useEvmAssetBurnsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<EvmAssetBurnsQuery, EvmAssetBurnsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<EvmAssetBurnsQuery, EvmAssetBurnsQueryVariables>(EvmAssetBurnsDocument, options);
        }
export type EvmAssetBurnsQueryHookResult = ReturnType<typeof useEvmAssetBurnsQuery>;
export type EvmAssetBurnsLazyQueryHookResult = ReturnType<typeof useEvmAssetBurnsLazyQuery>;
export type EvmAssetBurnsQueryResult = Apollo.QueryResult<EvmAssetBurnsQuery, EvmAssetBurnsQueryVariables>;