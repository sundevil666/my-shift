import type { VercelRequest, VercelResponse } from '@vercel/node';
import { analyticsDb, ensureAnalyticsSchema } from '../_lib/analytics.js';

const allowedHosts = new Set(['github.com', 'raw.githubusercontent.com']);

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const target = typeof request.query.url === 'string' ? request.query.url : '';
  const version =
    typeof request.query.version === 'string' && /^[0-9A-Za-z.+-]{1,32}$/.test(request.query.version)
      ? request.query.version
      : 'unknown';

  let url: URL;
  try {
    url = new URL(target);
  } catch {
    return response.status(400).json({ error: 'Invalid download URL' });
  }
  if (url.protocol !== 'https:' || !allowedHosts.has(url.hostname)) {
    return response.status(400).json({ error: 'Download host is not allowed' });
  }

  try {
    await ensureAnalyticsSchema();
    const sql = analyticsDb();
    await sql`
      INSERT INTO app_downloads (release_version, platform)
      VALUES (${version}, 'android')
    `;
  } catch (error) {
    console.error('Download analytics failed', error);
  }

  response.setHeader('Cache-Control', 'no-store');
  return response.redirect(307, url.toString());
}
