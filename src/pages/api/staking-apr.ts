import type { NextApiRequest, NextApiResponse } from 'next';
import Big from 'big.js';

type AnnualProvisionsResponse = {
  annual_provisions?: string;
};

type StakingPoolResponse = {
  pool?: {
    bonded_tokens?: string;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const restUrl =
    process.env.NEXT_PUBLIC_RPC_API ?? process.env.NEXT_PUBLIC_API_URL;
  if (!restUrl) {
    return res.status(500).json({ error: 'Chain REST endpoint not configured' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const [annualResponse, poolResponse] = await Promise.all([
      fetch(`${restUrl}/realionetwork/mint/v1/annual_provisions`, {
        signal: controller.signal,
      }),
      fetch(`${restUrl}/cosmos/staking/v1beta1/pool`, {
        signal: controller.signal,
      }),
    ]);

    if (!annualResponse.ok || !poolResponse.ok) {
      return res.status(502).json({ error: 'Chain REST request failed' });
    }

    const annual = (await annualResponse.json()) as AnnualProvisionsResponse;
    const pool = (await poolResponse.json()) as StakingPoolResponse;
    const annualProvisions = new Big(annual.annual_provisions ?? '0');
    const bondedTokens = new Big(pool.pool?.bonded_tokens ?? '0');

    if (bondedTokens.eq(0)) {
      return res.status(502).json({ error: 'Bonded token supply is unavailable' });
    }

    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({
      apr: annualProvisions.div(bondedTokens).times(100).toFixed(3),
    });
  } catch (error) {
    return res.status(502).json({
      error: error instanceof Error ? error.message : 'Chain REST request failed',
    });
  } finally {
    clearTimeout(timeout);
  }
}
