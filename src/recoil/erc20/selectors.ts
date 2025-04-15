import { DefaultValue, ReadOnlySelectorOptions, selector, selectorFamily } from 'recoil';
import { atomState } from '@/recoil/erc20/atom';
import type { AtomState } from '@/recoil/erc20/types';
import { mergeStateChange } from '@/utils/merge_state_change';

const getTokens: ReadOnlySelectorOptions<AtomState>['get'] = ({ get }) => {
  const state = get(atomState);
  return state;
};

export const writeTokens = selector({
  key: 'token.write.tokens',
  get: getTokens,
  set: ({ get, set }, value) => {
    if (value instanceof DefaultValue) return;
    const prevState = get(atomState);
    const newState = mergeStateChange(prevState, value);
    set(atomState, newState);
  },
});

export const readTokens = selector({
  key: 'token.read.tokens',
  get: getTokens,
});

export const readToken = selectorFamily({
  key: 'token.read.token',
  get: (address: string) => ({ get }) => {
    const tokens = get(atomState);
    return tokens.tokenMap[address];
  },
});
