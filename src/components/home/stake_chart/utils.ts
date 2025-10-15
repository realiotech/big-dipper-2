import { formatTokenByExponent } from "@/utils";

export function formatStakingData(bonded: any, unbonding: any, assetArr: any[]) {
  const labels = assetArr.map((item: any) => item.symbol);
  const colors = [
    "#57B888",
    "#8642E3",
    // "#FF4C00",
    "#FFD788",
    "#57B88880",
    "#8642E380",
    // "#FF4C0080",
    "#FFD78880",
  ];

  const getColor = (index: number) => colors[index % colors.length];

  // Calculate raw values first
  const bondedDataWithoutWeight = assetArr.map((item) => {
    let bondedValue = bonded[item.denom.toLowerCase()] ?? "0";
    return parseFloat(formatTokenByExponent(bondedValue, item.decimals));
  });

  const unbondingDataWithoutWeight = assetArr.map((item) => {
    let unbondingValue = unbonding[item.denom.toLowerCase()] ?? "0";
    return parseFloat(formatTokenByExponent(unbondingValue, item.decimals));
  });

  // For chart display, ensure minimum visibility for non-zero values
  const bondedData = bondedDataWithoutWeight.map((value: number) => {
    if (value === 0) return 0;

    // Find the maximum value to calculate relative scaling
    const maxValue = Math.max(...bondedDataWithoutWeight);

    // If the value is very small compared to the max, give it a minimum height
    // This ensures small values like DSTRX are still visible
    const minVisibleRatio = 0.01; // 1% of max value as minimum
    const minVisibleValue = maxValue * minVisibleRatio;

    return Math.max(value, minVisibleValue);
  });

  const unbondingData = unbondingDataWithoutWeight.map((value: number) => {
    if (value === 0) return 0;

    // Find the maximum value across both datasets for consistent scaling
    const maxBonded = Math.max(...bondedDataWithoutWeight);
    const maxUnbonding = Math.max(...unbondingDataWithoutWeight);
    const maxValue = Math.max(maxBonded, maxUnbonding);

    // Apply minimum visibility
    const minVisibleRatio = 0.01;
    const minVisibleValue = maxValue * minVisibleRatio;

    return Math.max(value, minVisibleValue);
  });

  const chartData = {
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
  return chartData;
}