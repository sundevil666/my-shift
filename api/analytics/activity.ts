import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  analyticsDb,
  ensureAnalyticsSchema,
  isAnalyticsPlatform,
} from '../_lib/analytics.js';

interface ActivityBody {
  installationId?: string;
  platform?: string;
  appVersion?: string;
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (request.method === 'OPTIONS') return response.status(204).end();
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST, OPTIONS');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const body = request.body as ActivityBody;
  if (
    !uuidPattern.test(body?.installationId ?? '') ||
    !isAnalyticsPlatform(body?.platform) ||
    typeof body?.appVersion !== 'string' ||
    !/^[0-9A-Za-z.+-]{1,32}$/.test(body.appVersion)
  ) {
    return response.status(400).json({ error: 'Invalid activity' });
  }

  try {
    await ensureAnalyticsSchema();
    const sql = analyticsDb();
    await sql`
      INSERT INTO app_installations (installation_id, platform, app_version)
      VALUES (${body.installationId}, ${body.platform}, ${body.appVersion})
      ON CONFLICT (installation_id) DO UPDATE SET
        platform = EXCLUDED.platform,
        app_version = EXCLUDED.app_version,
        last_seen_at = NOW()
    `;
    await sql`
      INSERT INTO app_activity (installation_id, platform, app_version)
      VALUES (${body.installationId}, ${body.platform}, ${body.appVersion})
      ON CONFLICT (installation_id, activity_date) DO UPDATE SET
        platform = EXCLUDED.platform,
        app_version = EXCLUDED.app_version
    `;
    return response.status(204).end();
  } catch (error) {
    console.error('Analytics activity failed', error);
    return response.status(503).json({ error: 'Analytics unavailable' });
  }
}
