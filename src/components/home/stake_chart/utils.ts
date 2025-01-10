import { AssetItem } from "@/recoil/asset/types";
import { StakeValueMap } from "./types";
import { formatTokenByExponent } from "@/utils";

export function formatStakingData(bonded: StakeValueMap, unbonding: StakeValueMap, assetArr: AssetItem[]) {
    var labels = assetArr.map(item => item.symbol)
    var bondedData = assetArr.map(item => {
        let bondedValue = bonded[item.denom] ?? '0' 
        return parseFloat(formatTokenByExponent(bondedValue, item.decimals))
    })

    var unbondingData = assetArr.map(item => {
        let unbondingValue = unbonding[item.denom] ?? '0'
        return parseFloat(formatTokenByExponent(unbondingValue, item.decimals))
    })

    return {
        labels: labels,
        datasets: [
            {
                label: "Staked",
                data: bondedData,
                backgroundColor: "#38A169",
                borderRadius: 4,
            },
            {
                label: "Unbonding",
                data: unbondingData,
                backgroundColor: "#6C63FF",
                borderRadius: 4,
            },
        ],
    }
}