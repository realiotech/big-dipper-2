import type { AtomState } from '@/recoil/erc20/types';
import { useRecoilState, SetterOrUpdater } from 'recoil';
import { writeTokens } from './selectors';
import { useEffect } from 'react';

export const useTokenRecoil = () => {
  const [_, setTokens] = useRecoilState(writeTokens) as [
    AtomState,
    SetterOrUpdater<AtomState>
  ];

  useEffect(() => {
    fetch("/api/erc20")
      .then(data => data.json())
      .then(data => {
        var tokenMap = {}
        var newData = []
        data.forEach((item, idx) => {
          let convertedItem = { ...item, idx: idx }
          tokenMap[item.address] = convertedItem
          newData.push(convertedItem)
        })
        newData.sort((a, b) => a.idx - b.idx)
        setTokens({ tokenArr: newData, tokenMap: tokenMap, loaded: true })
      })
      .catch(e => {
        console.log("can not fetch token data", e)
        setTokens({ tokenArr: [], tokenMap: {}, loaded: true })
      })
  }, [])
}
