import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchStockMarkets } from '@/utils/coingecko';
import { groupStocks, StocksResponse } from '@/utils/stocks';
import { SAMPLE_STOCK_MARKETS } from '@/utils/stocks/sample';

/**
 * Tokenized stocks grouped by underlying ticker, for Assets > Stocks.
 * Prices come from CoinGecko (see src/utils/coingecko); outside production a
 * failed fetch falls back to illustrative sample data so the page still renders.
 */
export default async function handler(_req: NextApiRequest, res: NextApiResponse<StocksResponse>) {
  try {
    const markets = await fetchStockMarkets();
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ source: 'coingecko', updatedAt: new Date().toISOString(), stocks: groupStocks(markets) });
  } catch (error) {
    console.error('Error fetching tokenized stocks:', error);
    res.setHeader('Cache-Control', 'no-store');
    if (process.env.NODE_ENV !== 'production') {
      return res.status(200).json({ source: 'sample', updatedAt: new Date().toISOString(), stocks: groupStocks(SAMPLE_STOCK_MARKETS) });
    }
    // An empty list, not a 500: the rest of the Assets page keeps working.
    return res.status(200).json({ source: 'unavailable', updatedAt: new Date().toISOString(), stocks: [] });
  }
}
