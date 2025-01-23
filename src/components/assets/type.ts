export interface OverviewState {
    denom: string;
    supply: string;
    holders: number;
}

export interface HolderState {
    loading: boolean;
    holders: Holder[];
}

export interface Holder {
    address: string;
    balance: string;
  }