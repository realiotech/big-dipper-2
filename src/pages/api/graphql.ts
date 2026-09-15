import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const hasuraUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL;

    if (!hasuraUrl) {
      console.error('NEXT_PUBLIC_GRAPHQL_URL is not configured');
      return res.status(500).json({ error: 'GraphQL endpoint not configured' });
    }

    // Explorer queries use Hasura's public read permissions. Never attach an
    // admin secret to this unauthenticated, general-purpose browser proxy.
    const response = await fetch(hasuraUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('GraphQL proxy error:', error);
    res.status(500).json({
      error: 'Failed to process GraphQL request',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
