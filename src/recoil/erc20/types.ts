export type TokenItem = {
  idx: number;
  address: string;
  symbol: string;
  name: string;
  description: string;
  image: string;
  decimals: number;
  price: number;
}

export type TokenMap = {
  [key: string]: TokenItem
}

export interface AtomState {
  tokenArr: TokenItem[];
  tokenMap: TokenMap;
  loaded: boolean;
}
