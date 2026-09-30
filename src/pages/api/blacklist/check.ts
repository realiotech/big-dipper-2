import type { NextApiRequest, NextApiResponse } from 'next';
import { isBlacklisted } from '@/server/blacklist';

const ACCOUNT = /^realio1[02-9ac-hj-np-z]{38,58}$/;
const MAX_ADDRESSES = 100;

/** Which of up to 100 comma-separated accounts are blacklisted: { blacklisted: string[] }. */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const addresses = String(req.query.addresses ?? '').split(',').filter(Boolean);
  if (!addresses.length || addresses.length > MAX_ADDRESSES || !addresses.every((address) => ACCOUNT.test(address))) {
    res.status(400).json({ error: `Expected 1 to ${MAX_ADDRESSES} comma-separated realio1 addresses` });
    return;
  }

  try {
    res.setHeader('cache-control', 'public, max-age=3600, s-maxage=86400');
    res.status(200).json({ blacklisted: addresses.filter(isBlacklisted) });
  } catch (error) {
    console.error('Blacklist lookup failed:', error);
    res.status(500).json({ error: 'Blacklist unavailable' });
  }
}
