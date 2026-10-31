/**
 * Server-side client for CoinGecko's market data, used by /api/stocks to list
 * tokenized stocks (xStocks, Ondo, Backed, …) the way Uniswap's Explore >
 * Stocks page does.
 *
 *   GET {COINGECKO_API_URL}/coins/markets
 *       ?vs_currency=usd&category=tokenized-stock&order=volume_desc
 *       &per_page=250&page=1&sparkline=true&price_change_percentage=1h,24h
 *   x-cg-demo-api-key | x-cg-pro-api-key: {COINGECKO_API_KEY}
 *
 * Environment (all optional, server only):
 *   COINGECKO_API_URL         https://api.coingecko.com/api/v3 (demo / keyless)
 *                             or https://pro-api.coingecko.com/api/v3 (paid)
 *   COINGECKO_API_KEY         sent as the demo or pro key header, picked from the URL
 *   COINGECKO_STOCK_CATEGORY  comma-separated category ids, default "tokenized-stock"
 *   COINGECKO_MAX_PAGES       pages of 250 coins per category, default 2
 *
 * Responses are cached in-process: the keyless and demo tiers allow roughly
 * 30 calls a minute and CoinGecko refreshes market data about once a minute,
 * so every page load in that minute shares one upstream request.
 */

export interface CoinGeckoMarket {
  id: string;
  symbol: string;
  name: string;
  image: string | null;
  current_price: number | null;
  market_cap: number | null;
  total_volume: number | null;
  price_change_percentage_1h_in_currency?: number | null;
  price_change_percentage_24h_in_currency?: number | null;
  /** Hourly prices over the last 7 days, oldest first. */
  sparkline_in_7d?: { price: number[] } | null;
  last_updated: string | null;
}

const DEFAULT_URL = 'https://api.coingecko.com/api/v3';
const PER_PAGE = 250;
const FRESH_TTL_MS = 60_000;
// Serve the last good list through a rate-limit window or an outage, but not
// for so long that the table silently shows hours-old prices.
const STALE_MAX_MS = 15 * 60_000;

type CacheEntry = { data: CoinGeckoMarket[]; fetchedAt: number };
let cache: CacheEntry | null = null;
let inFlight: Promise<CoinGeckoMarket[]> | null = null;

/** Test hook: drop the cached list and any in-flight request. */
export const resetCoinGeckoCache = (): void => {
  cache = null;
  inFlight = null;
};

const config = () => {
  const baseUrl = (process.env.COINGECKO_API_URL || DEFAULT_URL).replace(/\/$/, '');
  const categories = (process.env.COINGECKO_STOCK_CATEGORY || 'tokenized-stock')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
  const maxPages = Math.max(1, Number(process.env.COINGECKO_MAX_PAGES) || 2);
  const apiKey = process.env.COINGECKO_API_KEY;
  const headers: Record<string, string> = { accept: 'application/json' };
  if (apiKey) headers[baseUrl.includes('pro-api') ? 'x-cg-pro-api-key' : 'x-cg-demo-api-key'] = apiKey;
  return { baseUrl, categories, maxPages, headers };
};

const fetchCategory = async (category: string): Promise<CoinGeckoMarket[]> => {
  const { baseUrl, maxPages, headers } = config();
  const coins: CoinGeckoMarket[] = [];
  for (let page = 1; page <= maxPages; page += 1) {
    const params = new URLSearchParams({
      vs_currency: 'usd',
      category,
      order: 'volume_desc',
      per_page: String(PER_PAGE),
      page: String(page),
      sparkline: 'true',
      price_change_percentage: '1h,24h',
    });
    const response = await fetch(`${baseUrl}/coins/markets?${params}`, { headers });
    if (!response.ok) throw new Error(`CoinGecko /coins/markets (${category}) failed with status ${response.status}`);
    const batch: CoinGeckoMarket[] = await response.json();
    coins.push(...batch);
    if (batch.length < PER_PAGE) break;
  }
  return coins;
};

const requestMarkets = async (): Promise<CoinGeckoMarket[]> => {
  const lists = await Promise.all(config().categories.map(fetchCategory));
  // A coin can sit in several categories; keep one copy.
  const byId = new Map<string, CoinGeckoMarket>();
  lists.flat().forEach((coin) => byId.set(coin.id, coin));
  return [...byId.values()];
};

/** Every tokenized-stock coin CoinGecko lists, with 1h/24h change and a 7d sparkline. */
export const fetchStockMarkets = async (): Promise<CoinGeckoMarket[]> => {
  const cached = cache;
  if (cached && Date.now() - cached.fetchedAt < FRESH_TTL_MS) return cached.data;
  if (inFlight) return inFlight;

  const request = requestMarkets()
    .then((data) => {
      cache = { data, fetchedAt: Date.now() };
      return data;
    })
    .catch((error: unknown) => {
      if (cached && Date.now() - cached.fetchedAt < STALE_MAX_MS) {
        console.warn('CoinGecko refresh failed; serving cached stock markets:', error);
        return cached.data;
      }
      throw error;
    })
    .finally(() => {
      inFlight = null;
    });

  inFlight = request;
  return request;
};
