import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAdminRequest } from '../_lib/admin-auth.js';
import { analyticsDb, ensureAnalyticsSchema } from '../_lib/analytics.js';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed' });
  }
  if (!isAdminRequest(request)) return response.status(401).json({ error: 'Unauthorized' });

  try {
    await ensureAnalyticsSchema();
    const sql = analyticsDb();
    const [
      totals,
      platforms,
      versions,
      daily,
      newInstallations,
      retention,
      versionChanges,
    ] = await Promise.all([
      sql`
        SELECT
          (SELECT COUNT(*)::int FROM app_installations) AS installations,
          (SELECT COUNT(*)::int FROM app_downloads) AS downloads,
          (SELECT COUNT(*)::int FROM app_version_changes) AS successful_updates,
          (SELECT COUNT(*)::int FROM app_installations
            WHERE last_seen_at < NOW() - INTERVAL '30 days') AS inactive_30d,
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
      sql`
        SELECT first_seen_at::date AS install_date, COUNT(*)::int AS installations
        FROM app_installations
        WHERE first_seen_at >= CURRENT_DATE - INTERVAL '29 days'
        GROUP BY first_seen_at::date ORDER BY install_date
      `,
      sql`
        WITH cohorts AS (
          SELECT installation_id, first_seen_at::date AS install_date
          FROM app_installations
          WHERE first_seen_at < CURRENT_DATE
        )
        SELECT
          COUNT(*) FILTER (WHERE install_date <= CURRENT_DATE - 1)::int AS eligible_d1,
          COUNT(*) FILTER (
            WHERE install_date <= CURRENT_DATE - 1
              AND EXISTS (
                SELECT 1 FROM app_activity
                WHERE app_activity.installation_id = cohorts.installation_id
                  AND app_activity.activity_date = cohorts.install_date + 1
              )
          )::int AS retained_d1,
          COUNT(*) FILTER (WHERE install_date <= CURRENT_DATE - 7)::int AS eligible_d7,
          COUNT(*) FILTER (
            WHERE install_date <= CURRENT_DATE - 7
              AND EXISTS (
                SELECT 1 FROM app_activity
                WHERE app_activity.installation_id = cohorts.installation_id
                  AND app_activity.activity_date BETWEEN cohorts.install_date + 6
                    AND cohorts.install_date + 8
              )
          )::int AS retained_d7,
          COUNT(*) FILTER (WHERE install_date <= CURRENT_DATE - 30)::int AS eligible_d30,
          COUNT(*) FILTER (
            WHERE install_date <= CURRENT_DATE - 30
              AND EXISTS (
                SELECT 1 FROM app_activity
                WHERE app_activity.installation_id = cohorts.installation_id
                  AND app_activity.activity_date BETWEEN cohorts.install_date + 29
                    AND cohorts.install_date + 31
              )
          )::int AS retained_d30
        FROM cohorts
      `,
      sql`
        SELECT from_version, to_version, COUNT(*)::int AS updates,
          MAX(changed_at) AS last_update_at
        FROM app_version_changes
        GROUP BY from_version, to_version
        ORDER BY last_update_at DESC
      `,
    ]);
    return response.status(200).json({
      totals: totals[0],
      platforms,
      versions,
      daily,
      newInstallations,
      retention: retention[0],
      versionChanges,
    });
  } catch (error) {
    console.error('Analytics summary failed', error);
    return response.status(503).json({ error: 'Analytics unavailable' });
  }
}
