import type { AtomState } from '@/recoil/asset/types';
import { useRecoilState, SetterOrUpdater } from 'recoil';
import { writeAssets } from './selectors';
import { useEffect } from 'react';
import { useBalanceByDenomQuery } from '@/graphql/types/general_types';

export const useAssetRecoil = () => {
  const [_, setAssets] = useRecoilState(writeAssets) as [
    AtomState,
    SetterOrUpdater<AtomState>
  ];

  useEffect(() => {
    fetch("/api/assets")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }
        const text = await response.text();
        if (!text) {
          throw new Error("Empty response body");
        }
        return JSON.parse(text);
      })
      .then(data => {
        if (!Array.isArray(data)) {
          throw new Error("Invalid response format: expected array");
        }
        var assetMap = {}
        var newData = []
        data.forEach((item, idx) => {
          let convertedItem = { ...item, idx: idx }
          assetMap[item.denom] = convertedItem
          newData.push(convertedItem)
        })
        newData.sort((a, b) => a.idx - b.idx)
        setAssets(prevState => ({ ...prevState, assetArr: newData, assetMap: assetMap, loaded: true }))
      })
      .catch(e => {
        console.error("Error fetching asset data:", e)
        setAssets(prevState => ({ ...prevState, assetArr: [], assetMap: {}, loaded: true }))
      })
  }, [])

  useBalanceByDenomQuery({
    variables: {
      denom: "ario",
      account: "realio1qqqqqqqqqqqqqqqqqqqqqqqqqqqqph4dujhguh"
    },
    onCompleted: (data) => {
      setAssets(prevState => ({ ...prevState, burnedSupply: data?.balance[0].amount }))
    }
  })
}
