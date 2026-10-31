/**
 * Tests for grouping CoinGecko tokenized-stock coins into one row per
 * company: issuer detection, symbol styling, and the aggregate figures the
 * Stocks table shows (volume-weighted price and change, spread, totals).
 */
import type { CoinGeckoMarket } from '@/utils/coingecko';
import { cleanStockName, groupStocks, sortStocks, toStockToken } from '.';

const coin = (id: string, name: string, symbol: string, overrides: Partial<CoinGeckoMarket> = {}): CoinGeckoMarket => ({
  id,
  name,
  symbol,
  image: null,
  current_price: 100,
  market_cap: 1_000_000,
  total_volume: 1_000,
  price_change_percentage_1h_in_currency: 0,
  price_change_percentage_24h_in_currency: 0,
  sparkline_in_7d: null,
  last_updated: null,
  ...overrides,
});

describe('toStockToken', () => {
  it.each([
    ['NVIDIA xStock', 'nvdax', 'NVDA', 'NVDAx', 'xStocks'],
    ['NVIDIA (Ondo Tokenized)', 'nvdaon', 'NVDA', 'NVDAon', 'Ondo'],
    ['Backed NVIDIA Corp', 'bnvda', 'NVDA', 'bNVDA', 'Backed'],
    ['Tesla Dinari', 'tsla.d', 'TSLA', 'TSLA.d', 'Dinari'],
    ['Some Stock Token', 'abc', 'ABC', 'ABC', null],
  ])('reads %s (%s) as %s by %s', (name, symbol, ticker, styled, issuer) => {
    const token = toStockToken(coin('id', name, symbol));
    expect(token.ticker).toBe(ticker);
    expect(token.symbol).toBe(styled);
    expect(token.issuer).toBe(issuer);
  });

  it('does not treat Robinhood the company as an issuer', () => {
    expect(toStockToken(coin('hood', 'Robinhood Markets xStock', 'hoodx')).ticker).toBe('HOOD');
  });
});

describe('cleanStockName', () => {
  it.each([
    ['NVIDIA xStock', 'NVIDIA'],
    ['NVIDIA (Ondo Tokenized)', 'NVIDIA'],
    ['Backed NVIDIA Corp', 'NVIDIA'],
    ['Circle Internet Group xStock', 'Circle Internet Group'],
  ])('%s -> %s', (name, clean) => expect(cleanStockName(name)).toBe(clean));
});

describe('groupStocks', () => {
  const coins = [
    coin('nvdax', 'NVIDIA xStock', 'nvdax', { current_price: 200, total_volume: 3_000, market_cap: 40e6, price_change_percentage_24h_in_currency: -2 }),
    coin('nvdaon', 'NVIDIA (Ondo Tokenized)', 'nvdaon', {
      current_price: 210,
      total_volume: 1_000,
      market_cap: 30e6,
      price_change_percentage_24h_in_currency: 2,
      sparkline_in_7d: { price: Array.from({ length: 168 }, (_, i) => i) },
    }),
    coin('acmex', 'Acme Widgets xStock', 'acmex', { total_volume: 10_000, price_change_percentage_1h_in_currency: null }),
  ];

  it('groups versions by underlying ticker, most traded stock first', () => {
    const stocks = groupStocks(coins);
    expect(stocks.map((s) => s.ticker)).toEqual(['ACME', 'NVDA']);
    expect(stocks[1].name).toBe('Nvidia');
    expect(stocks[0].name).toBe('Acme Widgets');
    expect(stocks[1].tokens.map((t) => t.symbol)).toEqual(['NVDAx', 'NVDAon']);
  });

  it('sums cap and volume, weights price and change by volume, and measures spread', () => {
    const nvda = groupStocks(coins).find((s) => s.ticker === 'NVDA')!;
    expect(nvda.marketCap).toBe(70e6);
    expect(nvda.volume24h).toBe(4_000);
    expect(nvda.price).toBeCloseTo(202.5);
    expect(nvda.change24h).toBeCloseTo(-1);
    // 210 vs 202.5
    expect(nvda.spread).toBeCloseTo((7.5 / 202.5) * 100);
  });

  it('uses the last day of the first version that has a sparkline', () => {
    const nvda = groupStocks(coins).find((s) => s.ticker === 'NVDA')!;
    expect(nvda.sparkline).toHaveLength(25);
    expect(nvda.sparkline[24]).toBe(167);
  });

  it('keeps a missing change as null instead of 0', () => {
    expect(groupStocks(coins).find((s) => s.ticker === 'ACME')!.change1h).toBeNull();
  });

  it('sorts by the chosen column, missing changes last', () => {
    const stocks = groupStocks([...coins, coin('x', 'Zed xStock', 'zedx', { price_change_percentage_24h_in_currency: null })]);
    expect(sortStocks(stocks, 'marketCap')[0].ticker).toBe('NVDA');
    expect(sortStocks(stocks, 'change24h').map((s) => s.ticker)).toEqual(['ACME', 'NVDA', 'ZED']);
  });
});
