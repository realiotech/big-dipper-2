import type { CoinGeckoMarket } from '@/utils/coingecko';

/**
 * Groups CoinGecko's tokenized-stock coins by the stock they track, so the
 * Assets > Stocks table shows one row per company (Nvidia) that expands into
 * its tokenized versions (NVDAx by xStocks, NVDAon by Ondo, bNVDA by Backed …).
 *
 * Pure and client-safe: /api/stocks runs it on the server and the page only
 * imports its types.
 */

export type StockToken = {
  id: string;
  name: string;
  /** Issuer-styled symbol: NVDAx, NVDAon, bNVDA. */
  symbol: string;
  issuer: string | null;
  image: string | null;
  price: number;
  change1h: number | null;
  change24h: number | null;
  marketCap: number;
  volume24h: number;
};

export type StockGroup = {
  /** Underlying ticker, e.g. NVDA. */
  ticker: string;
  name: string;
  image: string | null;
  /** Volume-weighted price across versions. */
  price: number;
  /** Largest deviation of a version's price from `price`, in percent. */
  spread: number;
  change1h: number | null;
  change24h: number | null;
  marketCap: number;
  volume24h: number;
  /** Hourly prices over the last day, oldest first; empty when unknown. */
  sparkline: number[];
  /** Versions, most traded first. */
  tokens: StockToken[];
};

type Issuer = {
  name: string;
  match: (coin: CoinGeckoMarket) => boolean;
  /** Issuer symbol -> underlying ticker. */
  ticker: (symbol: string) => string;
  /** Underlying ticker -> issuer-styled symbol. */
  style: (ticker: string) => string;
};

// Tokenized-stock issuers listed on CoinGecko. Extend this list when a new
// issuer shows up as ungrouped rows in the table.
export const ISSUERS: Issuer[] = [
  { name: 'xStocks', match: (c) => /xstock/i.test(c.name), ticker: (s) => s.replace(/x$/i, ''), style: (t) => `${t}x` },
  { name: 'Ondo', match: (c) => /\bondo\b/i.test(c.name), ticker: (s) => s.replace(/on$/i, ''), style: (t) => `${t}on` },
  { name: 'Backed', match: (c) => /^backed\b/i.test(c.name), ticker: (s) => s.replace(/^b/i, ''), style: (t) => `b${t}` },
  { name: 'Dinari', match: (c) => /\bdinari\b/i.test(c.name) || /\.d$/i.test(c.symbol), ticker: (s) => s.replace(/\.d$/i, ''), style: (t) => `${t}.d` },
  { name: 'Robinhood', match: (c) => /\brobinhood\b/i.test(c.name) && !/^robinhood( markets)?\b/i.test(c.name), ticker: (s) => s, style: (t) => t },
];

// Display names for common tickers; others use the cleaned coin name.
const KNOWN_NAMES: Record<string, string> = {
  AAPL: 'Apple',
  AMD: 'AMD',
  AMZN: 'Amazon',
  COIN: 'Coinbase',
  CRCL: 'Circle Internet Group',
  GOOGL: 'Alphabet',
  HOOD: 'Robinhood',
  META: 'Meta',
  MSFT: 'Microsoft',
  MSTR: 'Strategy',
  NFLX: 'Netflix',
  NVDA: 'Nvidia',
  PLTR: 'Palantir',
  QQQ: 'Nasdaq 100 ETF',
  SPY: 'S&P 500 ETF',
  TSLA: 'Tesla',
};

/** "NVIDIA xStock" / "NVIDIA (Ondo Tokenized)" / "Backed NVIDIA Corp" -> "NVIDIA". */
export const cleanStockName = (name: string) =>
  name
    .replace(/\(.*?\)/g, ' ')
    .replace(/\b(xstocks?|backed|dinari|tokenized|stock|ondo)\b/gi, ' ')
    .replace(/\b(inc|corp|corporation|co|ltd|plc|class [a-c])\b\.?/gi, ' ')
    .replace(/[\s,.-]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const num = (value: number | null | undefined) => (typeof value === 'number' && Number.isFinite(value) ? value : null);

export const toStockToken = (coin: CoinGeckoMarket): StockToken & { ticker: string; sparkline7d: number[] } => {
  const issuer = ISSUERS.find((candidate) => candidate.match(coin));
  const raw = coin.symbol.toUpperCase();
  const ticker = (issuer ? issuer.ticker(raw) : raw).toUpperCase() || raw;
  return {
    id: coin.id,
    ticker,
    name: coin.name,
    symbol: issuer ? issuer.style(ticker) : raw,
    issuer: issuer?.name ?? null,
    image: coin.image ?? null,
    price: num(coin.current_price) ?? 0,
    change1h: num(coin.price_change_percentage_1h_in_currency),
    change24h: num(coin.price_change_percentage_24h_in_currency),
    marketCap: num(coin.market_cap) ?? 0,
    volume24h: num(coin.total_volume) ?? 0,
    sparkline7d: coin.sparkline_in_7d?.price?.filter((p) => Number.isFinite(p)) ?? [],
  };
};

/** Volume-weighted mean of the values that exist; a plain mean when nothing traded. */
const weighted = (items: Array<{ value: number | null; weight: number }>) => {
  const present = items.filter((item): item is { value: number; weight: number } => item.value !== null);
  if (!present.length) return null;
  const total = present.reduce((sum, item) => sum + item.weight, 0);
  if (total <= 0) return present.reduce((sum, item) => sum + item.value, 0) / present.length;
  return present.reduce((sum, item) => sum + item.value * item.weight, 0) / total;
};

// 7d hourly sparkline -> the last 24 hours (25 points, both ends included).
const ONE_DAY_POINTS = 25;

export const groupStocks = (coins: CoinGeckoMarket[]): StockGroup[] => {
  const byTicker = new Map<string, ReturnType<typeof toStockToken>[]>();
  coins.map(toStockToken).forEach((token) => {
    byTicker.set(token.ticker, [...(byTicker.get(token.ticker) ?? []), token]);
  });

  return [...byTicker.entries()]
    .map(([ticker, versions]) => {
      const sorted = [...versions].sort((a, b) => b.volume24h - a.volume24h);
      const priced = sorted.filter((token) => token.price > 0);
      const price = weighted(priced.map((token) => ({ value: token.price, weight: token.volume24h }))) ?? 0;
      const spread = price ? Math.max(0, ...priced.map((token) => (Math.abs(token.price - price) / price) * 100)) : 0;
      const chartSource = sorted.find((token) => token.sparkline7d.length > 1);
      const lead = sorted[0];

      return {
        ticker,
        name: KNOWN_NAMES[ticker] ?? (cleanStockName(lead.name) || ticker),
        image: sorted.find((token) => token.image)?.image ?? null,
        price,
        spread,
        change1h: weighted(sorted.map((token) => ({ value: token.change1h, weight: token.volume24h }))),
        change24h: weighted(sorted.map((token) => ({ value: token.change24h, weight: token.volume24h }))),
        marketCap: sorted.reduce((sum, token) => sum + token.marketCap, 0),
        volume24h: sorted.reduce((sum, token) => sum + token.volume24h, 0),
        sparkline: chartSource ? chartSource.sparkline7d.slice(-ONE_DAY_POINTS) : [],
        tokens: sorted.map(({ ticker: _ticker, sparkline7d: _sparkline, ...token }) => token),
      };
    })
    .sort((a, b) => b.volume24h - a.volume24h);
};

export type StocksResponse = {
  /** "coingecko" for live data, "sample" for the dev fixture, "unavailable" when neither. */
  source: 'coingecko' | 'sample' | 'unavailable';
  updatedAt: string;
  stocks: StockGroup[];
};

export type StockSort = 'volume' | 'marketCap' | 'change24h' | 'price';

export const STOCK_SORTS: Array<{ value: StockSort; label: string }> = [
  { value: 'volume', label: '1D volume' },
  { value: 'marketCap', label: 'Market cap' },
  { value: 'change24h', label: '1D change' },
  { value: 'price', label: 'Price' },
];

export const sortStocks = (stocks: StockGroup[], sort: StockSort) => {
  const key: Record<StockSort, (stock: StockGroup) => number> = {
    volume: (stock) => stock.volume24h,
    marketCap: (stock) => stock.marketCap,
    change24h: (stock) => stock.change24h ?? -Infinity,
    price: (stock) => stock.price,
  };
  return [...stocks].sort((a, b) => key[sort](b) - key[sort](a));
};
