/**
 * Tests for /api/assets after the spot-price migration (REA-3126): one
 * batched upstream call, metadata + price merge, and the price-0 degradation
 * on unresolved symbols and upstream failure (the UI's existing contract).
 */
import handler from '@/pages/api/assets';
import { resetSpotPriceCache } from '@/utils/spot_prices';

const ORIGINAL_ENV = { ...process.env };

const makeRes = () => {
  const res: Record<string, unknown> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as { status: jest.Mock; json: jest.Mock };
};

const entry = (symbol: string, usd: number) => ({
  assetId: `a-${symbol.toLowerCase()}`,
  symbol,
  price: { USD: usd },
  priceChange24h: { USD: 0 },
  provider: 'test',
  priceFetchedAt: '2026-09-02T00:00:00.000Z',
});

describe('GET /api/assets', () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    resetSpotPriceCache();
    process.env = {
      ...ORIGINAL_ENV,
      PRICE_API_URL: 'https://api.example/api/v1/prices/spot',
      PRICE_API_KEY: 'rlo_price_bigdipper_test',
    };
    fetchMock = jest.fn();
    global.fetch = fetchMock as never;
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('prices all four assets from one batched call, degrading unresolved LMX to 0', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { RIO: entry('RIO', 0.51), RST: entry('RST', 0.14), DSTRX: entry('DSTRX', 0.031) },
        unresolved: ['LMX'],
      }),
    });
    const res = makeRes();

    await handler({} as never, res as never);

    // One request for the whole set - not one per symbol like the v1 client.
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('symbols=RIO%2CRST%2CLMX%2CDSTRX');

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    const bySymbol = Object.fromEntries(payload.map((a: { symbol: string; price: number }) => [a.symbol, a]));
    expect(bySymbol.RIO.price).toBe(0.51);
    expect(bySymbol.RST.price).toBe(0.14);
    expect(bySymbol.DSTRX.price).toBe(0.031);
    expect(bySymbol.LMX.price).toBe(0);
    // Metadata still rides along untouched.
    expect(bySymbol.RIO.denom).toBe('ario');
    expect(bySymbol.RIO.decimals).toBe(18);
  });

  it('returns all metadata with price 0 when the upstream call fails', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) });
    const res = makeRes();

    await handler({} as never, res as never);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload).toHaveLength(4);
    payload.forEach((a: { price: number }) => expect(a.price).toBe(0));
  });

  it('returns all metadata with price 0 when env vars are missing', async () => {
    delete process.env.PRICE_API_URL;
    const res = makeRes();

    await handler({} as never, res as never);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    res.json.mock.calls[0][0].forEach((a: { price: number }) => expect(a.price).toBe(0));
  });
});
