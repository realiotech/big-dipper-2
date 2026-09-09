/**
 * Client for the freehold spot-price API (REA-3126), which replaces the v1
 * asset-api price endpoints ahead of v1 shutdown. One batched request prices
 * every symbol at once:
 *
 *   GET {PRICE_API_URL}?symbols=RIO,RST,LMX,DSTRX
 *   x-api-key: {PRICE_API_KEY}
 *
 * `data` is keyed by the normalized (uppercase) symbol; `price` and
 * `priceChange24h` are keyed by fiat symbol. Symbols that are unknown or have
 * no usable price source are listed in `unresolved` instead of failing the
 * batch (LMX is expected there until it has a price source; see REA-3105).
 *
 * Responses are cached in-process. The endpoint is throttled at 60 requests
 * per minute per consumer key, and every request counts against that budget
 * even when the API answers from its own 30s cache (its guards run before
 * the cache interceptor). /api/assets and /api/erc20 both fire on every full
 * page load of the explorer, so without this cache a modest burst of page
 * loads would exhaust the key and blank prices site-wide for the rest of the
 * minute - a limit the v1 asset-api never imposed.
 */

export interface SpotPriceEntry {
  assetId: string;
  symbol: string;
  price: Record<string, number>;
  priceChange24h: Record<string, number>;
  provider: string;
  priceFetchedAt: string;
}

export interface SpotPricesResponse {
  data: Record<string, SpotPriceEntry>;
  unresolved: string[];
}

interface CacheEntry {
  data: SpotPricesResponse;
  fetchedAt: number;
}

// Matches the API's own cache TTL - refetching sooner can't return newer data.
const FRESH_TTL_MS = 30_000;
// How long a stale entry may keep serving when the upstream call fails
// (throttled, down, or misconfigured). Bounded so a long outage degrades to
// "no price" rather than silently showing hours-old figures.
const STALE_MAX_MS = 10 * 60_000;

const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<SpotPricesResponse>>();

/** Test hook: drop cached responses and in-flight requests. */
export const resetSpotPriceCache = (): void => {
  cache.clear();
  inFlight.clear();
};

const normalizeSymbols = (symbols: string[]): string[] =>
  Array.from(new Set(symbols.map((s) => s.toUpperCase())));

const requestSpotPrices = async (symbols: string[]): Promise<SpotPricesResponse> => {
  const apiUrl = process.env.PRICE_API_URL;
  const apiKey = process.env.PRICE_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error('Missing PRICE_API_URL or PRICE_API_KEY in environment variables');
  }

  const response = await fetch(`${apiUrl}?symbols=${encodeURIComponent(symbols.join(','))}`, {
    headers: {
      'x-api-key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Price API request failed with status ${response.status}`);
  }

  return response.json();
};

export const fetchSpotPrices = async (symbols: string[]): Promise<SpotPricesResponse> => {
  const uniqueSymbols = normalizeSymbols(symbols);
  const key = uniqueSymbols.join(',');
  const now = Date.now();

  const cached = cache.get(key);
  if (cached && now - cached.fetchedAt < FRESH_TTL_MS) {
    return cached.data;
  }

  // Concurrent page loads share one upstream request instead of each
  // spending a unit of the throttle budget.
  const pending = inFlight.get(key);
  if (pending) {
    return pending;
  }

  const request = requestSpotPrices(uniqueSymbols)
    .then((data) => {
      cache.set(key, { data, fetchedAt: Date.now() });
      return data;
    })
    .catch((error: unknown) => {
      // Stale-on-error: keep the last known prices through a throttle window
      // or upstream blip rather than dropping every price to 0.
      if (cached && Date.now() - cached.fetchedAt < STALE_MAX_MS) {
        console.warn('Spot price refresh failed; serving cached prices:', error);
        return cached.data;
      }
      throw error;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, request);
  return request;
};

/**
 * USD price per requested (uppercased) symbol. A symbol the API reports as
 * unresolved maps to 0 - the same degraded value the API routes already
 * serve when pricing fails, which the UI renders as "no price".
 */
export const fetchUsdPrices = async (symbols: string[]): Promise<Record<string, number>> => {
  const { data } = await fetchSpotPrices(symbols);
  const prices: Record<string, number> = {};
  symbols.forEach((symbol) => {
    const normalized = symbol.toUpperCase();
    prices[normalized] = data[normalized]?.price?.USD ?? 0;
  });
  return prices;
};
