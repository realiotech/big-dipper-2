import { atom } from "recoil";
import { AtomState } from "./types";

const initialState: AtomState = {
  tokenArr: [],
  tokenMap: {},
  loaded: false
};

export const atomState = atom<AtomState>({
  key: 'erc20',
  default: initialState,
});