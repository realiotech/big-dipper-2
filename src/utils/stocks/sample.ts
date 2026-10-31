import type { CoinGeckoMarket } from '@/utils/coingecko';

/**
 * Illustrative CoinGecko-shaped rows so the Stocks tab renders in local
 * development without network access to CoinGecko. Figures are made up;
 * /api/stocks serves them only outside production and marks the response
 * `source: "sample"`, which the page labels.
 */

// Deterministic hourly walk ending at `end`, 7 days long like CoinGecko's sparkline.
const walk = (seed: number, end: number, drift: number) => {
  let x = seed;
  const rand = () => {
    x = (x * 16807) % 2147483647;
    return x / 2147483647 - 0.5;
  };
  const points = [end];
  for (let i = 1; i < 168; i += 1) points.unshift(points[0] * (1 - drift / 168 + rand() * 0.006));
  return points;
};

type Seed = [id: string, name: string, symbol: string, price: number, cap: number, volume: number, h1: number, d1: number];

const SEEDS: Seed[] = [
  ['nvidia-xstock', 'NVIDIA xStock', 'nvdax', 204.86, 42.4e6, 4.1e6, -0.01, -1.98],
  ['nvidia-ondo-tokenized', 'NVIDIA (Ondo Tokenized)', 'nvdaon', 205.25, 32.7e6, 2.9e6, -0.01, -1.9],
  ['backed-nvidia', 'Backed NVIDIA Corp', 'bnvda', 204.46, 43.8e6, 3.7e6, 0.05, -1.96],
  ['tesla-xstock', 'Tesla xStock', 'tslax', 400.0, 177.1e6, 2.2e6, 0.0, 1.26],
  ['tesla-ondo-tokenized', 'Tesla (Ondo Tokenized)', 'tslaon', 401.9, 100e6, 0.8e6, 0.01, 1.31],
  ['microsoft-xstock', 'Microsoft xStock', 'msftx', 528.44, 14.4e6, 4.9e6, 0.2, 0.29],
  ['microsoft-ondo-tokenized', 'Microsoft (Ondo Tokenized)', 'msfton', 530.1, 10e6, 2.4e6, 0.19, 0.31],
  ['apple-xstock', 'Apple xStock', 'aaplx', 345.28, 22.1e6, 3.6e6, -0.03, -1.75],
  ['backed-apple', 'Backed Apple Inc', 'baapl', 343.2, 10e6, 1.8e6, -0.02, -1.7],
  ['strategy-xstock', 'Strategy xStock', 'mstrx', 133.08, 160.7e6, 3.1e6, 0.36, -1.69],
  ['strategy-ondo-tokenized', 'MicroStrategy (Ondo Tokenized)', 'mstron', 133.7, 50e6, 1.5e6, 0.35, -1.66],
  ['circle-xstock', 'Circle Internet Group xStock', 'crclx', 73.04, 264.8e6, 2.0e6, 0.21, -4.25],
  ['circle-ondo-tokenized', 'Circle Internet Group (Ondo Tokenized)', 'crclon', 73.3, 100e6, 0.8e6, 0.2, -4.2],
  ['sp500-xstock', 'SP500 xStock', 'spyx', 671.2, 61e6, 2.3e6, 0.02, 0.41],
  ['coinbase-xstock', 'Coinbase xStock', 'coinx', 342.9, 18e6, 1.1e6, -0.12, 2.04],
];

export const SAMPLE_STOCK_MARKETS: CoinGeckoMarket[] = SEEDS.map(([id, name, symbol, price, cap, volume, h1, d1], index) => ({
  id,
  name,
  symbol,
  image: null,
  current_price: price,
  market_cap: cap,
  total_volume: volume,
  price_change_percentage_1h_in_currency: h1,
  price_change_percentage_24h_in_currency: d1,
  sparkline_in_7d: { price: walk(index + 7, price, d1 / 100) },
  last_updated: null,
}));
