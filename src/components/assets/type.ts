export interface OverviewState {
    denom: string;
    supply: string;
    holders: number;
}

export interface HolderState {
    holders: Holder[];
}

export interface Holder {
    address: string;
    balance: TokenUnit;
  }