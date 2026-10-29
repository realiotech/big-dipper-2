import type { NextApiRequest, NextApiResponse } from 'next';
import { blacklistedHolders } from '@/server/blacklist';

// Native denoms (ario, arst…) and ERC-20 denoms (erc20:0x…), the tokens the accounts page ranks by.
const DENOM = /^([a-z]{3,16}|erc20:0x[0-9a-fA-F]{40})$/;
const MAX_PAGE_SIZE = 100;

/** One page of blacklisted accounts holding a token, largest first: { total, rows }. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const denom = String(req.query.denom ?? '');
  const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(String(req.query.pageSize ?? '50'), 10) || 50, 1), MAX_PAGE_SIZE);
  if (!DENOM.test(denom)) {
    res.status(400).json({ error: 'Expected a denom such as ario or erc20:0x…' });
    return;
  }

  try {
    const holders = await blacklistedHolders(denom);
    res.setHeader('cache-control', 'public, max-age=60, s-maxage=300');
    res.status(200).json({ total: holders.length, rows: holders.slice((page - 1) * pageSize, page * pageSize) });
  } catch (error) {
    console.error('Blacklisted holders lookup failed:', error);
    res.status(502).json({ error: 'Indexer unavailable' });
  }
}
