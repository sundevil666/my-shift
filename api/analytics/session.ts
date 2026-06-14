import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  clearAdminCookie,
  createAdminCookie,
  isAdminPassword,
  isAdminRequest,
} from '../_lib/admin-auth.js';
import { enforceRateLimit } from '../_lib/push.js';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Cache-Control', 'no-store');

  if (request.method === 'GET') {
    return response.status(isAdminRequest(request) ? 200 : 401).json({
      authenticated: isAdminRequest(request),
    });
  }

  if (request.method === 'POST') {
    const clientAddress = String(request.headers['x-forwarded-for'] ?? 'unknown')
      .split(',')[0]
      ?.trim();
    if (!(await enforceRateLimit(`analytics-login:${clientAddress}`, 10, 15 * 60))) {
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
