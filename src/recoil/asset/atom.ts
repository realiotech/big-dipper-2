import { atom } from "recoil";
import { AtomState } from "./types";

const initialState: AtomState = {
  assetArr: [],
  assetMap: {},
};

export const atomState = atom<AtomState>({
  key: 'asset',
  default: initialState,
});