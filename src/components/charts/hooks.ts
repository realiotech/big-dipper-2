import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import {
  useBlocksAtHeightsQuery,
  useBlocksByHeightQuery,
  usePriceHistoryQuery,
} from '@/graphql/types/general_types';
import { readAssets } from '@/recoil/asset';
import dayjs from '@/utils/dayjs';
import { useValidators } from '@/components/validators/hooks';
import { useTokenomics } from '@/components/home/tokenomics/hooks';

const PRICE_POINTS = 100;
const BLOCK_TIME_HOURS = 48;
// ~1 hour of blocks at Realio's ~5.7s block time.
const BLOCKS_PER_SAMPLE = 630;
const NEWEST = '9223372036854775807';

export const useCharts = () => {
  const { assetArr } = useRecoilValue(readAssets);
  const { items: validators, stats, loading: validatorsLoading } = useValidators();
  const { state: pool } = useTokenomics();

  const { data: priceData, loading: priceLoading } = usePriceHistoryQuery({ variables: { unit: 'rio', limit: PRICE_POINTS } });

  // Block time per hour: sample one block every ~hour back from the latest and
  // divide the time between neighbours by the blocks between them.
  const { data: latestData } = useBlocksByHeightQuery({ variables: { maxHeight: NEWEST, limit: 1 } });
  const latest = Number(latestData?.blocks?.[0]?.height ?? 0);
  const heights = useMemo(
    () => (latest ? Array.from({ length: BLOCK_TIME_HOURS + 1 }, (_, i) => latest - i * BLOCKS_PER_SAMPLE) : []),
    [latest]
  );
  const { data: sampleData, loading: samplesLoading } = useBlocksAtHeightsQuery({ variables: { heights }, skip: !heights.length });

  return useMemo(() => {
    const prices = [...(priceData?.history ?? [])].reverse().map((point) => ({
      time: point.timestamp,
      price: Number(point.price),
      marketCap: Number(point.marketCap),
    }));
    const firstPrice = prices[0]?.price ?? 0;
    const lastPrice = prices[prices.length - 1]?.price ?? 0;

    const samples = sampleData?.blocks ?? [];
    const blockTimes = samples.slice(1).map((block, i) => {
      const previous = samples[i];
      const seconds = dayjs.utc(block.timestamp).diff(dayjs.utc(previous.timestamp), 'millisecond') / 1000;
      return { time: block.timestamp, seconds: seconds / (Number(block.height) - Number(previous.height)) };
    });

    const active = validators.filter((v) => v.status === 3);
    const byToken = assetArr
      .map((asset) => ({
        symbol: asset.symbol,
        power: active.filter((v) => v.denom === asset.denom).reduce((sum, v) => sum + v.votingPower, 0),
      }))
      .filter((row) => row.power > 0);

    return {
      price: {
        loading: priceLoading,
        points: prices,
        latest: lastPrice,
        change: firstPrice ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0,
      },
      blockTime: {
        loading: samplesLoading || !heights.length,
        points: blockTimes,
        latest: blockTimes[blockTimes.length - 1]?.seconds ?? 0,
        average: blockTimes.length ? blockTimes.reduce((sum, p) => sum + p.seconds, 0) / blockTimes.length : 0,
      },
      bonded: {
        bonded: pool.bonded,
        notBonded: pool.unbonding,
        ratio: pool.bonded + pool.unbonding ? (pool.bonded / (pool.bonded + pool.unbonding)) * 100 : 0,
      },
      validators: {
        loading: validatorsLoading,
        stats,
        byToken,
        top: active.slice(0, 20),
      },
    };
  }, [assetArr, heights.length, pool, priceData, priceLoading, sampleData, samplesLoading, stats, validators, validatorsLoading]);
};
