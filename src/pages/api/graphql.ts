import type { NextApiRequest, NextApiResponse } from 'next';
import { readOnlyGraphqlError } from '@/server/graphql_proxy';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rejection = readOnlyGraphqlError(req.body);
  if (rejection) {
    return res.status(400).json({ errors: [{ message: rejection }] });
  }

  try {
    const hasuraUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL;
    const hasuraAdminSecret = process.env.HASURA_ADMIN_SECRET;

    if (!hasuraUrl) {
      console.error('NEXT_PUBLIC_GRAPHQL_URL is not configured');
      return res.status(500).json({ error: 'GraphQL endpoint not configured' });
    }

    // Some indexers expose no anonymous role, so the secret is attached here,
    // server-side only. The read-only check above keeps this public proxy from
    // running mutations with admin rights.
    const response = await fetch(hasuraUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(hasuraAdminSecret ? { 'x-hasura-admin-secret': hasuraAdminSecret } : {}),
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
