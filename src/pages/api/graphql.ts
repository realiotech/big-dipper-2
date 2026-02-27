import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const hasuraUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL;
    const hasuraAdminSecret = process.env.HASURA_ADMIN_SECRET;

    if (!hasuraUrl) {
      console.error('NEXT_PUBLIC_GRAPHQL_URL is not configured');
      return res.status(500).json({ error: 'GraphQL endpoint not configured' });
    }

    if (!hasuraAdminSecret) {
      console.error('HASURA_ADMIN_SECRET is not configured');
      return res.status(500).json({ error: 'Admin secret not configured' });
    }

    // console.log('Forwarding GraphQL request to:', hasuraUrl);

    const response = await fetch(hasuraUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': hasuraAdminSecret,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    // console.log('GraphQL response status:', response.status);

    res.status(response.status).json(data);
  } catch (error) {
    console.error('GraphQL proxy error:', error);
    res.status(500).json({
      error: 'Failed to process GraphQL request',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

