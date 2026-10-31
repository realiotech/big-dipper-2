/**
 * Tests for /api/stocks: the CoinGecko request shape and key header, the
 * in-process cache, and the fallbacks when CoinGecko fails (sample data in
 * development, an empty list in production).
 */
import handler from '@/pages/api/stocks';
import { resetCoinGeckoCache } from '@/utils/coingecko';

const ORIGINAL_ENV = { ...process.env };

const makeRes = () => {
  const res: Record<string, unknown> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res as { status: jest.Mock; json: jest.Mock; setHeader: jest.Mock };
};

const market = (id: string, name: string, symbol: string) => ({
  id,
  name,
  symbol,
  image: null,
  current_price: 100,
  market_cap: 1e6,
  total_volume: 1e3,
  price_change_percentage_1h_in_currency: 0.1,
  price_change_percentage_24h_in_currency: -1,
  sparkline_in_7d: { price: [1, 2, 3] },
  last_updated: null,
});

const setEnv = (env: Record<string, string | undefined>) => {
  process.env = { ...ORIGINAL_ENV, ...env } as NodeJS.ProcessEnv;
};

describe('GET /api/stocks', () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    resetCoinGeckoCache();
    setEnv({ COINGECKO_API_URL: undefined, COINGECKO_API_KEY: undefined, COINGECKO_STOCK_CATEGORY: undefined });
    fetchMock = jest.fn();
    global.fetch = fetchMock as never;
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('asks CoinGecko for the tokenized-stock category with 1h/24h change and sparklines', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => [market('nvdax', 'NVIDIA xStock', 'nvdax'), market('nvdaon', 'NVIDIA (Ondo Tokenized)', 'nvdaon')] });
    const res = makeRes();

    await handler({} as never, res as never);

    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe('https://api.coingecko.com/api/v3/coins/markets');
    expect(url.searchParams.get('category')).toBe('tokenized-stock');
    expect(url.searchParams.get('sparkline')).toBe('true');
    expect(url.searchParams.get('price_change_percentage')).toBe('1h,24h');
    const body = res.json.mock.calls[0][0];
    expect(body.source).toBe('coingecko');
    expect(body.stocks).toHaveLength(1);
    expect(body.stocks[0].tokens).toHaveLength(2);
  });

  it('sends the pro key header for the pro API and the demo header otherwise', async () => {
    setEnv({ COINGECKO_API_URL: 'https://pro-api.coingecko.com/api/v3', COINGECKO_API_KEY: 'k' });
    fetchMock.mockResolvedValue({ ok: true, json: async () => [] });
    await handler({} as never, makeRes() as never);
    expect(fetchMock.mock.calls[0][1].headers).toMatchObject({ 'x-cg-pro-api-key': 'k' });

    resetCoinGeckoCache();
    setEnv({ COINGECKO_API_KEY: 'd' });
    await handler({} as never, makeRes() as never);
    expect(fetchMock.mock.calls[1][1].headers).toMatchObject({ 'x-cg-demo-api-key': 'd' });
  });

  it('serves repeat requests from the cache', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => [market('a', 'Apple xStock', 'aaplx')] });
    await handler({} as never, makeRes() as never);
    await handler({} as never, makeRes() as never);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('falls back to sample data outside production when CoinGecko fails', async () => {
    setEnv({ NODE_ENV: 'development' });
    fetchMock.mockResolvedValue({ ok: false, status: 429 });
    const res = makeRes();
    await handler({} as never, res as never);
    const body = res.json.mock.calls[0][0];
    expect(body.source).toBe('sample');
    expect(body.stocks.length).toBeGreaterThan(0);
  });

  it('returns an empty list in production when CoinGecko fails', async () => {
    setEnv({ NODE_ENV: 'production' });
    fetchMock.mockRejectedValue(new Error('network down'));
    const res = makeRes();
    await handler({} as never, res as never);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0]).toMatchObject({ source: 'unavailable', stocks: [] });
  });
});
