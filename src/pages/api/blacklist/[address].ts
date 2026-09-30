import type { NextApiRequest, NextApiResponse } from 'next';
import { isBlacklisted } from '@/server/blacklist';

const ACCOUNT = /^realio1[02-9ac-hj-np-z]{38,58}$/;

/** Whether one account is on the chain's blacklist: { blacklisted: boolean }. */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const address = String(req.query.address ?? '');
  if (!ACCOUNT.test(address)) {
    res.status(400).json({ error: 'Expected a realio1 address' });
    return;
  }

  try {
    // The list only changes with a deploy, so browsers and any CDN can keep the answer.
    res.setHeader('cache-control', 'public, max-age=3600, s-maxage=86400');
    res.status(200).json({ blacklisted: isBlacklisted(address) });
  } catch (error) {
    console.error('Blacklist lookup failed:', error);
    res.status(500).json({ error: 'Blacklist unavailable' });
  }
}
