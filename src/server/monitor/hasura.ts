import { HASURA_ADMIN_SECRET, HASURA_URL } from './config';

export const requestStats = { requests: 0 };
let adminSecretUsable = Boolean(HASURA_ADMIN_SECRET);

export async function gql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 55_000);
  try {
    const send = (useSecret: boolean) => {
      requestStats.requests += 1;
      return fetch(HASURA_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(useSecret ? { 'x-hasura-admin-secret': HASURA_ADMIN_SECRET } : {}),
        },
        body: JSON.stringify({ query, variables }), signal: controller.signal,
      });
    };
    let response = await send(adminSecretUsable);
    // An obsolete locally-configured secret must not prevent use of the
    // deliberately public monitor queries. Never log or return the secret.
    if (adminSecretUsable && (response.status === 401 || response.status === 403)) {
      adminSecretUsable = false;
      response = await send(false);
    }
    if (!response.ok) throw new Error(`monitor indexer HTTP ${response.status}`);
    let body = await response.json() as { data?: T; errors?: { message: string }[] };
    if (
      adminSecretUsable &&
      body.errors?.some((item) => /invalid.*x-hasura-admin-secret/i.test(item.message))
    ) {
      adminSecretUsable = false;
      response = await send(false);
      if (!response.ok) throw new Error(`monitor indexer HTTP ${response.status}`);
      body = await response.json() as { data?: T; errors?: { message: string }[] };
    }
    if (body.errors?.length) throw new Error(body.errors.map((item) => item.message).join('; '));
    if (!body.data) throw new Error('monitor indexer returned no data');
    return body.data;
  } finally {
    clearTimeout(timer);
  }
}

export async function chainHead(): Promise<{ height: number; timestamp: string }> {
  const data = await gql<{ block: { height: number; timestamp: string }[] }>(
    'query MonitorHead { block(order_by: {height: desc}, limit: 1) { height timestamp } }'
  );
  if (!data.block[0]) throw new Error('monitor indexer returned no blocks');
  return data.block[0];
}

export async function paginate<T>(
  cap: number,
  fetchPage: (limit: number, offset: number) => Promise<T[]>,
  maxPages = 500
): Promise<T[]> {
  const rows: T[] = [];
  for (let page = 0; page < maxPages; page += 1) {
    const next = await fetchPage(cap, page * cap);
    rows.push(...next);
    if (next.length < cap) return rows;
  }
  throw new Error(`monitor pagination exceeded ${maxPages} pages`);
}
