export type TokenItem = {
  idx: number;
  address: string;
  symbol: string;
  name: string;
  description: string;
  image: string;
  decimals: number;
  price: number;
  // Pre-loaded supply data from subgraph
  supply?: string;
  holders?: number;
}

export type TokenMap = {
  [key: string]: TokenItem
}

export interface AtomState {
  tokenArr: TokenItem[];
  tokenMap: TokenMap;
  loaded: boolean;
}
