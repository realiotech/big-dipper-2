import React, { useMemo } from "react";
import { Box, Flex, Grid, Skeleton, Table, Text } from "@chakra-ui/react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from "chart.js";
import { useRecoilValue } from "recoil";
import numeral from "numeral";
import { readAssets } from "@/recoil/asset";
import { formatTokenByExponent } from "@/utils";
import { useColorModeValue } from "@/components/ui/color-mode";
import { Panel } from "@/components/explorer/panel";
import { useHero } from "./hooks";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

// Hex values of the explorer.chart* tokens; chart.js draws on a canvas and
// cannot read CSS variables.
const CHART_COLORS = {
  light: ["#5D5FEF", "#BF4A86", "#7879F1", "#2E855F"],
  dark: ["#5D5FEF", "#EF5DA8", "#A5A6F6", "#8CA98E"],
};

// LMX is not shown in the design's staking breakdown.
const HIDDEN_SYMBOLS = ["LMX"];

export default function StakingChart() {
  const { state } = useHero();
  const { assetArr } = useRecoilValue(readAssets);
  const colors = useColorModeValue(CHART_COLORS.light, CHART_COLORS.dark);
  const tickColor = useColorModeValue("#767F84", "#7B878D");
  const gridColor = useColorModeValue("#EBEDED", "#162026");

  const rows = useMemo(
    () =>
      assetArr
        .filter((asset) => !HIDDEN_SYMBOLS.includes(asset.symbol))
        .map((asset, index) => ({
          symbol: asset.symbol,
          color: colors[index % colors.length],
          bonded: parseFloat(formatTokenByExponent(state.bonded[asset.denom.toLowerCase()] ?? "0", asset.decimals)),
          unbonding: parseFloat(formatTokenByExponent(state.unbonding[asset.denom.toLowerCase()] ?? "0", asset.decimals)),
        })),
    [assetArr, state.bonded, state.unbonding, colors]
  );

  const data = {
    labels: rows.map((row) => row.symbol),
    datasets: [
      {
        label: "Bonded",
        data: rows.map((row) => row.bonded),
        backgroundColor: rows.map((row) => row.color),
        borderRadius: 2,
        maxBarThickness: 56,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (context: any) => `Bonded: ${numeral(context.raw).format("0,0")}` },
      },
    },
    scales: {
      x: { grid: { display: false }, border: { color: gridColor }, ticks: { color: tickColor, font: { size: 11 } } },
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: gridColor },
        ticks: { color: tickColor, font: { size: 11 }, maxTicksLimit: 5, callback: (value: any) => numeral(value).format("0,0") },
      },
    },
  };

  return (
    <Panel>
      <Text fontSize="md" fontWeight="600" color="explorer.text" mb="6">
        Staking
      </Text>
      <Grid templateColumns={{ base: "1fr", lg: "1fr 464px" }} gap={{ base: "6", lg: "12" }}>
        <Skeleton loading={state.loading} h={{ base: "200px", md: "240px" }}>
          <Box h="full">
            <Bar data={data} options={options} />
          </Box>
        </Skeleton>
        <Table.Root size="sm" variant="line" alignSelf="start">
          <Table.Header>
            <Table.Row bg="transparent">
              {["Token", "Bonded", "Unbonding"].map((heading, index) => (
                <Table.ColumnHeader
                  key={heading}
                  color="explorer.muted"
                  fontWeight="400"
                  borderColor="explorer.border"
                  textAlign={index ? "end" : "start"}
                  px="0"
                >
                  {heading}
                </Table.ColumnHeader>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.map((row) => (
              <Table.Row key={row.symbol} bg="transparent">
                <Table.Cell borderColor="explorer.border" px="0" py="3">
                  <Flex align="center" gap="3" color="explorer.text">
                    <Box w="7px" h="7px" borderRadius="full" bg={row.color} />
                    {row.symbol}
                  </Flex>
                </Table.Cell>
                <Table.Cell borderColor="explorer.border" px="0" textAlign="end" color="explorer.text">
                  {numeral(row.bonded).format("0,0")}
                </Table.Cell>
                <Table.Cell borderColor="explorer.border" px="0" textAlign="end" color="explorer.muted">
                  {numeral(row.unbonding).format("0,0")}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Grid>
    </Panel>
  );
}
