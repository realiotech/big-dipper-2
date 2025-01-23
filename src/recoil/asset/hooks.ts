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
    fetchAssets()
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

async function fetchAssets() {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return [
    {
      denom: 'ario',
      symbol: 'RIO',
      name: 'Realio Network',
      description: 'Realio Network Token',
      image: '/images/assets/RIO.png',
      decimals: 18,
      price: 1
    },
    {
      denom: 'arst',
      symbol: 'RST',
      name: 'Realio Staking Token',
      description: 'Realio Network Staking Token',
      image: '/images/assets/RST.png',
      decimals: 18,
      price: 1
    },
    {
      denom: 'almx',
      symbol: 'LMX',
      name: 'LMX Token',
      description: 'LMX Token',
      image: '/images/assets/LMX.png',
      decimals: 18,
      price: 1
    },
  ]
}
