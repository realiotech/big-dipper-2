/**
 * Tests for the freehold spot-price client (REA-3126): batched request shape,
 * USD mapping, the unresolved→0 degradation the API routes rely on (LMX ships
 * unresolved until it has a usable price source), and the in-process cache
 * that keeps the explorer under the endpoint's 60 req/min per-key throttle.
 */
import { fetchSpotPrices, fetchUsdPrices, resetSpotPriceCache } from '.';

const ORIGINAL_ENV = { ...process.env };

const RIO_ENTRY = {
  assetId: 'a-rio',
  symbol: 'RIO',
  price: { USD: 0.51, EUR: 0.47 },
  priceChange24h: { USD: -1.2 },
  provider: 'coinmarketcap',
  priceFetchedAt: '2026-09-02T00:00:00.000Z',
};

const okResponse = (data: object, unresolved: string[] = []) => ({
  ok: true,
  json: async () => ({ data, unresolved }),
});

describe('spot_prices', () => {
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
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.restoreAllMocks();
  });

  it('makes one batched request with normalized, deduped symbols and the x-api-key', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ RIO: RIO_ENTRY }));

    await fetchSpotPrices(['rio', 'RIO', 'dstrx']);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.example/api/v1/prices/spot?symbols=RIO%2CDSTRX');
    expect(opts.headers['x-api-key']).toBe('rlo_price_bigdipper_test');
  });

  it('maps USD prices per symbol, degrading unresolved symbols to 0 (the LMX launch state)', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ RIO: RIO_ENTRY }, ['LMX']));

    const prices = await fetchUsdPrices(['RIO', 'LMX']);

    expect(prices).toEqual({ RIO: 0.51, LMX: 0 });
  });

  it('throws when env vars are missing, without calling upstream', async () => {
    delete process.env.PRICE_API_URL;

    await expect(fetchSpotPrices(['RIO'])).rejects.toThrow('Missing PRICE_API_URL');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('throws on an upstream error status when nothing is cached', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) });

    await expect(fetchSpotPrices(['RIO'])).rejects.toThrow('status 401');
  });

  describe('throttle-protecting cache', () => {
    it('serves repeat requests for the same symbol set from cache within the TTL', async () => {
      fetchMock.mockResolvedValueOnce(okResponse({ RIO: RIO_ENTRY }));

      const first = await fetchSpotPrices(['RIO']);
      const second = await fetchSpotPrices(['rio']);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(second).toBe(first);
    });

    it('coalesces concurrent requests into one upstream call', async () => {
      let resolveUpstream: (value: unknown) => void = () => undefined;
      fetchMock.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveUpstream = resolve;
        }),
      );

      const a = fetchSpotPrices(['RIO']);
      const b = fetchSpotPrices(['RIO']);
      resolveUpstream(okResponse({ RIO: RIO_ENTRY }));

      expect(await a).toEqual(await b);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('refetches once the entry is older than the TTL', async () => {
      const nowSpy = jest.spyOn(Date, 'now');
      nowSpy.mockReturnValue(1_000_000);
      fetchMock.mockResolvedValueOnce(okResponse({ RIO: RIO_ENTRY }));
      await fetchSpotPrices(['RIO']);

      nowSpy.mockReturnValue(1_000_000 + 31_000);
      fetchMock.mockResolvedValueOnce(okResponse({ RIO: { ...RIO_ENTRY, price: { USD: 0.6 } } }));
      const refreshed = await fetchSpotPrices(['RIO']);

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(refreshed.data.RIO.price.USD).toBe(0.6);
    });

    it('keeps serving the last good prices when a refresh fails (e.g. 429 from the throttle)', async () => {
      const nowSpy = jest.spyOn(Date, 'now');
      nowSpy.mockReturnValue(1_000_000);
      fetchMock.mockResolvedValueOnce(okResponse({ RIO: RIO_ENTRY }));
      await fetchSpotPrices(['RIO']);

      nowSpy.mockReturnValue(1_000_000 + 31_000);
      fetchMock.mockResolvedValueOnce({ ok: false, status: 429, json: async () => ({}) });
      const stale = await fetchSpotPrices(['RIO']);

      expect(stale.data.RIO.price.USD).toBe(0.51);
      expect(console.warn).toHaveBeenCalled();
    });

    it('stops serving stale prices after the stale ceiling', async () => {
      const nowSpy = jest.spyOn(Date, 'now');
      nowSpy.mockReturnValue(1_000_000);
      fetchMock.mockResolvedValueOnce(okResponse({ RIO: RIO_ENTRY }));
      await fetchSpotPrices(['RIO']);

      nowSpy.mockReturnValue(1_000_000 + 11 * 60_000);
      fetchMock.mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({}) });

      await expect(fetchSpotPrices(['RIO'])).rejects.toThrow('status 503');
    });
  });
});
