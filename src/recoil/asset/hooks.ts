import type { AtomState } from '@/recoil/asset/types';
import { useRecoilState, SetterOrUpdater } from 'recoil';
import { writeAssets } from './selectors';
import { useEffect } from 'react';

export const useAssetRecoil = () => {
  const [_, setAssets] = useRecoilState(writeAssets) as [
    AtomState,
    SetterOrUpdater<AtomState>
  ];

  useEffect(() => {
    fetch("/api/assets")
      .then(data => data.json())
      .then(data => {
        var assetMap = {}
        var newData = []
        data.forEach((item, idx) => {
          let convertedItem = { ...item, idx: idx }
          assetMap[item.denom] = convertedItem
          newData.push(convertedItem)
        })
        newData.sort((a, b) => a.idx - b.idx)
        setAssets({ assetArr: newData, assetMap: assetMap, loaded: true })
      })
      .catch(e => {
        console.log("can not fetch token data", e)
        setAssets({ assetArr: [], assetMap: {}, loaded: true })
      })
  }, [])
}
