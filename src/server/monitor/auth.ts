import { timingSafeEqual } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

function same(left: string, right: string): boolean {
  const a = Buffer.from(left); const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Optional Basic Auth: enabled only when both environment values are set. */
export function authorized(header: string | undefined): boolean {
  const expectedUser = process.env.MONITOR_BASIC_AUTH_USER;
  const expectedPassword = process.env.MONITOR_BASIC_AUTH_PASSWORD;
  if (!expectedUser && !expectedPassword) {
    return process.env.NODE_ENV !== 'production' || process.env.MONITOR_PUBLIC === 'true';
  }
  if (!expectedUser || !expectedPassword || !header?.startsWith('Basic ')) return false;
  try {
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
    const split = decoded.indexOf(':');
    return split >= 0 && same(decoded.slice(0, split), expectedUser) && same(decoded.slice(split + 1), expectedPassword);
  } catch { return false; }
}

export function requireAuth(req: IncomingMessage, res: ServerResponse): boolean {
  if (authorized(req.headers.authorization)) return true;
  res.statusCode = 401;
  res.setHeader('WWW-Authenticate', 'Basic realm="Realio wallet monitor", charset="UTF-8"');
  res.setHeader('Cache-Control', 'no-store');
  return false;
}
