export type AssetItem = {
  idx: number;
  denom: string;
  symbol: string;
  name: string;
  description: string;
  image: string;
  decimals: number;
  price: number;
}

export type AssetMap = {
  [key: string]: AssetItem
}

export interface AtomState {
  assetArr: AssetItem[];
  assetMap: AssetMap;
  loaded: boolean;
}
