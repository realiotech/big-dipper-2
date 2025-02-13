import { formatTokenByExponent } from "@/utils";

export function formatStakingData(bonded, unbonding, assetArr) {
  const labels = assetArr.map((item) => item.symbol);
  const colors = [
    "#57B888",
    "#8642E3",
    "#FF4C00",
    "#57B88880",
    "#8642E380",
    "#FF4C0080",
  ];
  const bondedWeight = [1, 1, 10];
  const getColor = (index) => colors[index % colors.length];
  const bondedData = assetArr.map((item, index) => {
    let bondedValue =
      (parseFloat(bonded[item.denom]) * bondedWeight[index]).toString() ?? "0";
    return parseFloat(formatTokenByExponent(bondedValue, item.decimals));
  });

  const unbondingData = assetArr.map((item, index) => {
    let unbondingValue =
      (parseFloat(unbonding[item.denom]) * bondedWeight[index]).toString() ??
      "0";
    return parseFloat(formatTokenByExponent(unbondingValue, item.decimals));
  });

  const bondedDataWithoutWeight = assetArr.map((item) => {
    let bondedValue = bonded[item.denom] ?? "0";
    return parseFloat(formatTokenByExponent(bondedValue, item.decimals));
  });

  const unbondingDataWithoutWeight = assetArr.map((item) => {
    let unbondingValue = unbonding[item.denom] ?? "0";
    return parseFloat(formatTokenByExponent(unbondingValue, item.decimals));
  });
  
  return {
    labels: labels,
    datasets: [
      {
        label: "Staked",
        data: bondedData,
        dataWithoutWeight: bondedDataWithoutWeight,
        backgroundColor: bondedData.map((_, index) => getColor(index)),
        borderRadius: 4,
      },
      {
        label: "Unbonding",
        data: unbondingData,
        dataWithoutWeight: unbondingDataWithoutWeight,
        backgroundColor: unbondingData.map((_, index) => getColor(index + 3)),
        borderRadius: 4,
      },
    ],
  };
}