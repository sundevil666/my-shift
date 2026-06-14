import { createHash, timingSafeEqual } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { analyticsDb, ensureAnalyticsSchema } from '../_lib/analytics.js';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed' });
  }
  if (!authorized(request)) return response.status(401).json({ error: 'Unauthorized' });

  try {
    await ensureAnalyticsSchema();
    const sql = analyticsDb();
    const [totals, platforms, versions, daily] = await Promise.all([
      sql`
        SELECT
          (SELECT COUNT(*)::int FROM app_installations) AS installations,
          (SELECT COUNT(*)::int FROM app_downloads) AS downloads,
          (SELECT COUNT(DISTINCT installation_id)::int FROM app_activity
            WHERE activity_date >= CURRENT_DATE - 0) AS active_1d,
          (SELECT COUNT(DISTINCT installation_id)::int FROM app_activity
            WHERE activity_date >= CURRENT_DATE - 6) AS active_7d,
          (SELECT COUNT(DISTINCT installation_id)::int FROM app_activity
            WHERE activity_date >= CURRENT_DATE - 29) AS active_30d
      `,
      sql`
        SELECT platform, COUNT(*)::int AS installations
        FROM app_installations GROUP BY platform ORDER BY installations DESC
      `,
      sql`
        SELECT app_version, COUNT(*)::int AS installations
        FROM app_installations GROUP BY app_version ORDER BY installations DESC
      `,
      sql`
        SELECT activity_date, COUNT(DISTINCT installation_id)::int AS active
        FROM app_activity
        WHERE activity_date >= CURRENT_DATE - 29
        GROUP BY activity_date ORDER BY activity_date
      `,
    ]);
    return response.status(200).json({ totals: totals[0], platforms, versions, daily });
  } catch (error) {
    console.error('Analytics summary failed', error);
    return response.status(503).json({ error: 'Analytics unavailable' });
  }
}

function authorized(request: VercelRequest) {
  const secret = process.env.ANALYTICS_ADMIN_TOKEN;
  const supplied = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!secret || !supplied) return false;
  const expectedHash = createHash('sha256').update(secret).digest();
  const suppliedHash = createHash('sha256').update(supplied).digest();
  return timingSafeEqual(expectedHash, suppliedHash);
}
