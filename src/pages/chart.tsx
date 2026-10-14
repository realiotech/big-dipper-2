import React from "react";
import { Box, Flex, Grid, SimpleGrid, Skeleton, Stack, Text } from "@chakra-ui/react";
import numeral from "numeral";
import { NextSeo } from "next-seo";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import dayjs from "@/utils/dayjs";
import { Panel } from "@/components/explorer/panel";
import { PageTitle } from "@/components/explorer/page_title";
import { StatCard } from "@/components/explorer/stat_card";
import { formatCompact, formatPercent } from "@/components/explorer/format";
import { useChartTheme } from "@/components/explorer/chart_theme";
import { useProfilesRecoil } from "@/recoil/profiles/hooks";
import { useCharts } from "@/components/charts/hooks";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Filler, Tooltip);

const ChartPanel = ({ title, subtitle, loading, children, height = "220px" }: { title: string; subtitle?: string; loading?: boolean; children: React.ReactNode; height?: string }) => (
  <Panel>
    <Text fontSize="md" fontWeight="600" color="explorer.text">
      {title}
    </Text>
    {subtitle && (
      <Text fontSize="sm" color="explorer.muted">
        {subtitle}
      </Text>
    )}
    <Skeleton loading={loading} mt="4" h={height}>
      <Box h={height}>{children}</Box>
    </Skeleton>
  </Panel>
);

const shortTime = (time: string) => dayjs.utc(time).local().format("MM-DD HH:mm");

export default function ChartsPage() {
  const { price, blockTime, bonded, validators } = useCharts();
  const theme = useChartTheme();
  const { profiles } = useProfilesRecoil(validators.top.map((v) => v.validator));

  const axes = (format: (value: number) => string) => ({
    x: { grid: { display: false }, border: { color: theme.grid }, ticks: { color: theme.tick, font: { size: 10 }, maxTicksLimit: 6, maxRotation: 0 } },
    y: { border: { display: false }, grid: { color: theme.grid }, ticks: { color: theme.tick, font: { size: 10 }, maxTicksLimit: 5, callback: (v: any) => format(Number(v)) } },
  });
  const lineOptions = (format: (value: number) => string) => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => format(ctx.raw) } } },
    scales: axes(format),
  });
  const line = (labels: string[], data: number[], color: string) => ({
    labels,
    datasets: [{ data, borderColor: color, backgroundColor: `${color}22`, fill: true, borderWidth: 1.5, pointRadius: 0, tension: 0.3 }],
  });

  const usd = (v: number) => `$${numeral(v).format(v < 1 ? "0.0000" : "0,0.[00]a").toUpperCase()}`;

  return (
    <>
      <NextSeo title="Charts and stats" openGraph={{ title: "Charts and stats" }} />
      <PageTitle title="Charts and stats" />
      <Stack gap="5">
        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap="4">
          <StatCard
            label="RIO price"
            loading={price.loading}
            value={price.latest ? `$${numeral(price.latest).format("0.000000")}` : "—"}
            rows={[
              { label: "Change over window", value: formatPercent(price.change) },
              { label: "Points in window", value: price.points.length },
            ]}
          />
          <StatCard
            label="Average block time"
            loading={blockTime.loading}
            value={`${numeral(blockTime.average).format("0.00")}s`}
            rows={[
              { label: "Hours sampled", value: blockTime.points.length },
              { label: "Latest hour", value: `${numeral(blockTime.latest).format("0.00")}s` },
            ]}
          />
          <StatCard
            label="Bonded ratio"
            loading={!bonded.bonded}
            value={formatPercent(bonded.ratio, 1)}
            rows={[
              { label: "Bonded", value: formatCompact(bonded.bonded) },
              { label: "Not bonded", value: formatCompact(bonded.notBonded) },
            ]}
          />
          <StatCard
            label="Nakamoto coefficient"
            loading={validators.loading}
            value={validators.stats.nakamoto}
            rows={[
              { label: "Active validators", value: validators.stats.active },
              { label: "Top 10 share", value: formatPercent(validators.stats.top10Share) },
            ]}
          />
        </SimpleGrid>

        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="5">
          <ChartPanel title="RIO price" subtitle={`${price.points.length} hourly points`} loading={price.loading}>
            <Line data={line(price.points.map((p) => shortTime(p.time)), price.points.map((p) => p.price), theme.series[0])} options={lineOptions(usd)} />
          </ChartPanel>
          <ChartPanel title="Market cap" subtitle="Same window as the price series" loading={price.loading}>
            <Line data={line(price.points.map((p) => shortTime(p.time)), price.points.map((p) => p.marketCap), theme.series[2])} options={lineOptions(usd)} />
          </ChartPanel>
          <ChartPanel title="Block time" subtitle={`Hourly average, most recent ${blockTime.points.length} hours`} loading={blockTime.loading}>
            <Line
              data={line(blockTime.points.map((p) => shortTime(p.time)), blockTime.points.map((p) => Number(p.seconds.toFixed(3))), theme.series[1])}
              options={lineOptions((v) => `${numeral(v).format("0.00")}s`)}
            />
          </ChartPanel>
          <ChartPanel title="Voting power by staking token" subtitle="Realio bonds several tokens, not one" loading={validators.loading}>
            <Flex h="full" align="center" justify="center" gap="8" direction={{ base: "column", sm: "row" }}>
              <Box boxSize="170px">
                <Doughnut
                  data={{
                    labels: validators.byToken.map((row) => row.symbol),
                    datasets: [{ data: validators.byToken.map((row) => row.power), backgroundColor: theme.series, borderColor: theme.card, borderWidth: 2 }],
                  }}
                  options={{ cutout: "78%", maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                />
              </Box>
              <Stack gap="2" minW="160px">
                {validators.byToken.map((row, index) => {
                  const total = validators.byToken.reduce((sum, r) => sum + r.power, 0);
                  return (
                    <Flex key={row.symbol} justify="space-between" gap="6" fontSize="sm">
                      <Flex align="center" gap="2" color="explorer.muted">
                        <Box w="7px" h="7px" borderRadius="full" bg={theme.series[index]} />
                        {row.symbol}
                      </Flex>
                      <Text color="explorer.text">{formatPercent(total ? (row.power / total) * 100 : 0, 1)}</Text>
                    </Flex>
                  );
                })}
              </Stack>
            </Flex>
          </ChartPanel>
        </Grid>

        <ChartPanel title="Validator concentration" subtitle="Top 20 of the active set by voting power" loading={validators.loading} height="260px">
          <Bar
            data={{
              labels: validators.top.map((v, i) => profiles[i]?.name && profiles[i].name !== v.validator ? profiles[i].name : `#${i + 1}`),
              datasets: [{ data: validators.top.map((v) => v.votingPower), backgroundColor: theme.series[0], borderRadius: 2, maxBarThickness: 40 }],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => numeral(ctx.raw).format("0,0") } } },
              scales: { ...axes((v) => numeral(v).format("0.[0]a").toUpperCase()), x: { ...axes(String).x, ticks: { display: false } } },
            }}
          />
        </ChartPanel>
      </Stack>
    </>
  );
}
