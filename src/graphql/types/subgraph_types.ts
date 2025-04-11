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
  AsErc20Decimals = 'asERC20__decimals',
  AsErc20Id = 'asERC20__id',
  AsErc20Name = 'asERC20__name',
  AsErc20Symbol = 'asERC20__symbol',
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
  ContractDecimals = 'contract__decimals',
  ContractId = 'contract__id',
  ContractName = 'contract__name',
  ContractSymbol = 'contract__symbol',
  Id = 'id',
  TransferFromEvent = 'transferFromEvent',
  TransferToEvent = 'transferToEvent',
  Value = 'value',
  ValueExact = 'valueExact'
}

export type Erc20Contract = {
  __typename?: 'ERC20Contract';
  asAccount: Account;
  balances: Array<Erc20Balance>;
  decimals: Scalars['Int'];
  id: Scalars['Bytes'];
  name?: Maybe<Scalars['String']>;
  symbol?: Maybe<Scalars['String']>;
  totalSupply: Erc20Balance;
  transfers: Array<Erc20Transfer>;
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
  decimals?: InputMaybe<Scalars['Int']>;
  decimals_gt?: InputMaybe<Scalars['Int']>;
  decimals_gte?: InputMaybe<Scalars['Int']>;
  decimals_in?: InputMaybe<Array<Scalars['Int']>>;
  decimals_lt?: InputMaybe<Scalars['Int']>;
  decimals_lte?: InputMaybe<Scalars['Int']>;
  decimals_not?: InputMaybe<Scalars['Int']>;
  decimals_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  transfers_?: InputMaybe<Erc20Transfer_Filter>;
};

export enum Erc20Contract_OrderBy {
  AsAccount = 'asAccount',
  AsAccountId = 'asAccount__id',
  Balances = 'balances',
  Decimals = 'decimals',
  Id = 'id',
  Name = 'name',
  Symbol = 'symbol',
  TotalSupply = 'totalSupply',
  TotalSupplyId = 'totalSupply__id',
  TotalSupplyValue = 'totalSupply__value',
  TotalSupplyValueExact = 'totalSupply__valueExact',
  Transfers = 'transfers'
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
  ContractDecimals = 'contract__decimals',
  ContractId = 'contract__id',
  ContractName = 'contract__name',
  ContractSymbol = 'contract__symbol',
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
  erc20Contract?: Maybe<Erc20Contract>;
  erc20Contracts: Array<Erc20Contract>;
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
  erc20Contract?: Maybe<Erc20Contract>;
  erc20Contracts: Array<Erc20Contract>;
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

export type AssetOverviewQueryVariables = Exact<{
  address: Scalars['ID'];
}>;


export type AssetOverviewQuery = { erc20Contract?: { __typename?: 'ERC20Contract', id: any, name?: string | null, symbol?: string | null, decimals: number, totalSupply: { __typename?: 'ERC20Balance', value: any } } | null };

export type AssetHoldersQueryVariables = Exact<{
  offset?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
}>;


export type AssetHoldersQuery = { erc20Balances: Array<{ __typename?: 'ERC20Balance', value: any, account?: { __typename?: 'Account', id: any } | null }> };

export type AssetTransfersQueryVariables = Exact<{
  offset?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
}>;


export type AssetTransfersQuery = { erc20Transfers: Array<{ __typename?: 'ERC20Transfer', value: any, timestamp: any, from?: { __typename?: 'Account', id: any } | null, to?: { __typename?: 'Account', id: any } | null, transaction: { __typename?: 'Transaction', id: string } }> };

export type AssetMintsQueryVariables = Exact<{
  offset?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
}>;


export type AssetMintsQuery = { erc20Transfers: Array<{ __typename?: 'ERC20Transfer', value: any, timestamp: any, to?: { __typename?: 'Account', id: any } | null, transaction: { __typename?: 'Transaction', id: string } }> };

export type AssetBurnsQueryVariables = Exact<{
  offset?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
}>;


export type AssetBurnsQuery = { erc20Transfers: Array<{ __typename?: 'ERC20Transfer', value: any, timestamp: any, from?: { __typename?: 'Account', id: any } | null, transaction: { __typename?: 'Transaction', id: string } }> };


export const AssetOverviewDocument = gql`
    query AssetOverview($address: ID!) {
  erc20Contract(id: $address) {
    id
    name
    symbol
    decimals
    totalSupply {
      value
    }
  }
}
    `;

/**
 * __useAssetOverviewQuery__
 *
 * To run a query within a React component, call `useAssetOverviewQuery` and pass it any options that fit your needs.
 * When your component renders, `useAssetOverviewQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAssetOverviewQuery({
 *   variables: {
 *      address: // value for 'address'
 *   },
 * });
 */
export function useAssetOverviewQuery(baseOptions: Apollo.QueryHookOptions<AssetOverviewQuery, AssetOverviewQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AssetOverviewQuery, AssetOverviewQueryVariables>(AssetOverviewDocument, options);
      }
export function useAssetOverviewLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AssetOverviewQuery, AssetOverviewQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AssetOverviewQuery, AssetOverviewQueryVariables>(AssetOverviewDocument, options);
        }
export type AssetOverviewQueryHookResult = ReturnType<typeof useAssetOverviewQuery>;
export type AssetOverviewLazyQueryHookResult = ReturnType<typeof useAssetOverviewLazyQuery>;
export type AssetOverviewQueryResult = Apollo.QueryResult<AssetOverviewQuery, AssetOverviewQueryVariables>;
export const AssetHoldersDocument = gql`
    query AssetHolders($offset: Int = 1, $limit: Int = 10) {
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
}
    `;

/**
 * __useAssetHoldersQuery__
 *
 * To run a query within a React component, call `useAssetHoldersQuery` and pass it any options that fit your needs.
 * When your component renders, `useAssetHoldersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAssetHoldersQuery({
 *   variables: {
 *      offset: // value for 'offset'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useAssetHoldersQuery(baseOptions?: Apollo.QueryHookOptions<AssetHoldersQuery, AssetHoldersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AssetHoldersQuery, AssetHoldersQueryVariables>(AssetHoldersDocument, options);
      }
export function useAssetHoldersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AssetHoldersQuery, AssetHoldersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AssetHoldersQuery, AssetHoldersQueryVariables>(AssetHoldersDocument, options);
        }
export type AssetHoldersQueryHookResult = ReturnType<typeof useAssetHoldersQuery>;
export type AssetHoldersLazyQueryHookResult = ReturnType<typeof useAssetHoldersLazyQuery>;
export type AssetHoldersQueryResult = Apollo.QueryResult<AssetHoldersQuery, AssetHoldersQueryVariables>;
export const AssetTransfersDocument = gql`
    query AssetTransfers($offset: Int = 0, $limit: Int = 10) {
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
}
    `;

/**
 * __useAssetTransfersQuery__
 *
 * To run a query within a React component, call `useAssetTransfersQuery` and pass it any options that fit your needs.
 * When your component renders, `useAssetTransfersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAssetTransfersQuery({
 *   variables: {
 *      offset: // value for 'offset'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useAssetTransfersQuery(baseOptions?: Apollo.QueryHookOptions<AssetTransfersQuery, AssetTransfersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AssetTransfersQuery, AssetTransfersQueryVariables>(AssetTransfersDocument, options);
      }
export function useAssetTransfersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AssetTransfersQuery, AssetTransfersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AssetTransfersQuery, AssetTransfersQueryVariables>(AssetTransfersDocument, options);
        }
export type AssetTransfersQueryHookResult = ReturnType<typeof useAssetTransfersQuery>;
export type AssetTransfersLazyQueryHookResult = ReturnType<typeof useAssetTransfersLazyQuery>;
export type AssetTransfersQueryResult = Apollo.QueryResult<AssetTransfersQuery, AssetTransfersQueryVariables>;
export const AssetMintsDocument = gql`
    query AssetMints($offset: Int = 0, $limit: Int = 10) {
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
}
    `;

/**
 * __useAssetMintsQuery__
 *
 * To run a query within a React component, call `useAssetMintsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAssetMintsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAssetMintsQuery({
 *   variables: {
 *      offset: // value for 'offset'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useAssetMintsQuery(baseOptions?: Apollo.QueryHookOptions<AssetMintsQuery, AssetMintsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AssetMintsQuery, AssetMintsQueryVariables>(AssetMintsDocument, options);
      }
export function useAssetMintsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AssetMintsQuery, AssetMintsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AssetMintsQuery, AssetMintsQueryVariables>(AssetMintsDocument, options);
        }
export type AssetMintsQueryHookResult = ReturnType<typeof useAssetMintsQuery>;
export type AssetMintsLazyQueryHookResult = ReturnType<typeof useAssetMintsLazyQuery>;
export type AssetMintsQueryResult = Apollo.QueryResult<AssetMintsQuery, AssetMintsQueryVariables>;
export const AssetBurnsDocument = gql`
    query AssetBurns($offset: Int = 0, $limit: Int = 10) {
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
}
    `;

/**
 * __useAssetBurnsQuery__
 *
 * To run a query within a React component, call `useAssetBurnsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAssetBurnsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAssetBurnsQuery({
 *   variables: {
 *      offset: // value for 'offset'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useAssetBurnsQuery(baseOptions?: Apollo.QueryHookOptions<AssetBurnsQuery, AssetBurnsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AssetBurnsQuery, AssetBurnsQueryVariables>(AssetBurnsDocument, options);
      }
export function useAssetBurnsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AssetBurnsQuery, AssetBurnsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AssetBurnsQuery, AssetBurnsQueryVariables>(AssetBurnsDocument, options);
        }
export type AssetBurnsQueryHookResult = ReturnType<typeof useAssetBurnsQuery>;
export type AssetBurnsLazyQueryHookResult = ReturnType<typeof useAssetBurnsLazyQuery>;
export type AssetBurnsQueryResult = Apollo.QueryResult<AssetBurnsQuery, AssetBurnsQueryVariables>;