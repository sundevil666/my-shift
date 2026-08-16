import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  adminRateLimitKey,
  clearAdminCookie,
  createAdminCookie,
  isAdminPassword,
  isAdminRequest,
} from '../_lib/admin-auth.js';
import { analyticsDb, ensureAnalyticsSchema } from '../_lib/analytics.js';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Cache-Control', 'no-store');

  if (request.method === 'GET') {
    return response.status(isAdminRequest(request) ? 200 : 401).json({
      authenticated: isAdminRequest(request),
    });
  }

  if (request.method === 'POST') {
    const clientAddress =
      (String(request.headers['x-forwarded-for'] ?? 'unknown').split(',')[0] ?? '').trim() ||
      'unknown';
    if (!(await allowLoginAttempt(clientAddress))) {
      return response.status(429).json({ error: 'Too many attempts' });
    }
    if (!isAdminPassword((request.body as { password?: unknown })?.password)) {
      return response.status(401).json({ error: 'Invalid password' });
    }
    response.setHeader('Set-Cookie', createAdminCookie());
    return response.status(204).end();
  }

  if (request.method === 'DELETE') {
    response.setHeader('Set-Cookie', clearAdminCookie());
    return response.status(204).end();
  }

  response.setHeader('Allow', 'GET, POST, DELETE');
  return response.status(405).json({ error: 'Method not allowed' });
}

async function allowLoginAttempt(clientAddress: string) {
  await ensureAnalyticsSchema();
  const sql = analyticsDb();
  const key = adminRateLimitKey(clientAddress);
  const result = await sql`
    INSERT INTO admin_login_limits (key_hash, attempt_count, expires_at)
    VALUES (${key}, 1, NOW() + INTERVAL '15 minutes')
    ON CONFLICT (key_hash) DO UPDATE SET
      attempt_count = CASE
        WHEN admin_login_limits.expires_at <= NOW() THEN 1
        ELSE admin_login_limits.attempt_count + 1
      END,
      expires_at = CASE
        WHEN admin_login_limits.expires_at <= NOW() THEN NOW() + INTERVAL '15 minutes'
        ELSE admin_login_limits.expires_at
      END
    RETURNING attempt_count
  `;
  return Number(result[0]?.attempt_count ?? 0) <= 10;
}
