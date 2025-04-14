import { DefaultValue, ReadOnlySelectorOptions, selector, selectorFamily } from 'recoil';
import { atomState } from '@/recoil/asset/atom';
import type { AtomState } from '@/recoil/asset/types';
import { mergeStateChange } from '@/utils/merge_state_change';

const getAssets: ReadOnlySelectorOptions<AtomState>['get'] = ({ get }) => {
  const state = get(atomState);
  return state;
};

export const writeAssets = selector({
  key: 'asset.write.assets',
  get: getAssets,
  set: ({ get, set }, value) => {
    if (value instanceof DefaultValue) return;
    const prevState = get(atomState);
    const newState = mergeStateChange(prevState, value);
    set(atomState, newState);
  },
});

export const readAssets = selector({
  key: 'asset.read.assets',
  get: getAssets,
});

export const readAsset = selectorFamily({
  key: 'asset.read.asset',
  get: (denom: string) => ({ get }) => {
    const assets = get(atomState);
    return assets.assetMap[denom];
  },
});
