/**
 * Tests for the freehold spot-price client (REA-3126): batched request shape,
 * USD mapping, and the unresolved→0 degradation the API routes rely on
 * (LMX ships unresolved until it has a usable price source).
 */
import { fetchSpotPrices, fetchUsdPrices } from '.';

const ORIGINAL_ENV = { ...process.env };

const RIO_ENTRY = {
  assetId: 'a-rio',
  symbol: 'RIO',
  price: { USD: 0.51, EUR: 0.47 },
  priceChange24h: { USD: -1.2 },
  provider: 'coinmarketcap',
  priceFetchedAt: '2026-09-02T00:00:00.000Z',
};

describe('spot_prices', () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
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

  it('makes one batched request with normalized, deduped symbols and the x-api-key', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { RIO: RIO_ENTRY }, unresolved: [] }),
    });

    await fetchSpotPrices(['rio', 'RIO', 'dstrx']);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.example/api/v1/prices/spot?symbols=RIO%2CDSTRX');
    expect(opts.headers['x-api-key']).toBe('rlo_price_bigdipper_test');
  });

  it('maps USD prices per symbol, degrading unresolved symbols to 0 (the LMX launch state)', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { RIO: RIO_ENTRY }, unresolved: ['LMX'] }),
    });

    const prices = await fetchUsdPrices(['RIO', 'LMX']);

    expect(prices).toEqual({ RIO: 0.51, LMX: 0 });
  });

  it('throws when env vars are missing, without calling upstream', async () => {
    delete process.env.PRICE_API_URL;

    await expect(fetchSpotPrices(['RIO'])).rejects.toThrow('Missing PRICE_API_URL');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('throws on an upstream error status', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) });

    await expect(fetchSpotPrices(['RIO'])).rejects.toThrow('status 401');
  });
});
