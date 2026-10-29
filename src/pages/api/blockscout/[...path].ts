import type { NextApiRequest, NextApiResponse } from 'next';

const BLOCKSCOUT_API_URL = process.env.BLOCKSCOUT_API_URL || 'https://blockscout.realio.network/api/v2';

// Only the read endpoints the explorer's EVM pages use are forwarded.
const ALLOWED = [
  /^transactions\/0x[0-9a-fA-F]{64}(\/(token-transfers|internal-transactions|logs|state-changes|raw-trace))?$/,
  /^addresses\/0x[0-9a-fA-F]{40}(\/(counters|transactions|token-transfers|tokens|token-balances|internal-transactions|logs))?$/,
  /^smart-contracts(\/counters|\/0x[0-9a-fA-F]{40})?$/,
];

/** GET-only, allowlisted proxy to the Blockscout API v2, so the browser talks to one origin. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { path, ...query } = req.query;
  const route = (Array.isArray(path) ? path : [path]).join('/');
  if (!ALLOWED.some((pattern) => pattern.test(route))) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  const search = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    (Array.isArray(value) ? value : [value]).forEach((v) => v !== undefined && search.append(key, v));
  });

  try {
    const upstream = await fetch(`${BLOCKSCOUT_API_URL}/${route}${search.size ? `?${search}` : ''}`, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(15000),
    });
    const body = await upstream.text();
    res.status(upstream.status).setHeader('content-type', upstream.headers.get('content-type') ?? 'application/json');
    // Short shared cache: EVM data is final once indexed, lists change slowly.
    if (upstream.ok) res.setHeader('cache-control', 'public, s-maxage=10, stale-while-revalidate=30');
    res.send(body);
  } catch (error) {
    console.error('Blockscout request failed:', route, error);
    res.status(502).json({ error: 'Blockscout unavailable' });
  }
}
