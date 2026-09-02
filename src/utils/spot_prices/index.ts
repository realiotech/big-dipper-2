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

export const fetchSpotPrices = async (symbols: string[]): Promise<SpotPricesResponse> => {
  const apiUrl = process.env.PRICE_API_URL;
  const apiKey = process.env.PRICE_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error('Missing PRICE_API_URL or PRICE_API_KEY in environment variables');
  }

  const uniqueSymbols = Array.from(new Set(symbols.map((s) => s.toUpperCase())));
  const response = await fetch(`${apiUrl}?symbols=${encodeURIComponent(uniqueSymbols.join(','))}`, {
    headers: {
      'x-api-key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Price API request failed with status ${response.status}`);
  }

  return response.json();
};

/**
 * USD price per requested (uppercased) symbol. A symbol the API reports as
 * unresolved maps to 0 — the same degraded value the API routes already
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
