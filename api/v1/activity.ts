import type { VercelRequest, VercelResponse } from '@vercel/node';
import { analyticsDb } from '../_lib/analytics.js';
import { requireActivityToken } from '../_lib/integrations.js';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  setCors(response);
  if (request.method === 'OPTIONS') return response.status(204).end();
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET, OPTIONS');
    return response.status(405).json({ error: 'method_not_allowed' });
  }
  const grant = await requireActivityToken(request);
  if (!grant) return response.status(401).json({ error: 'invalid_access_token' });
  const from = queryDate(request.query.from);
  const to = queryDate(request.query.to);
  if ((from && !isDate(from)) || (to && !isDate(to)) || (from && to && from > to)) {
    return response.status(400).json({ error: 'invalid_date_range' });
  }

  const sql = analyticsDb();
  const rows = await sql`
    SELECT s.payload, s.data_version, s.updated_at, u.id
    FROM integration_schedule_snapshots s
    JOIN integration_users u ON u.id = s.user_id
    WHERE s.user_id = ${grant.userId}
  `;
  const row = rows[0];
  if (!row) return response.status(404).json({ error: 'schedule_not_synced' });
  const etag = `"${String(row.data_version)}"`;
  response.setHeader('ETag', etag);
  response.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');
  if (request.headers['if-none-match'] === etag) return response.status(304).end();

  const payload = row.payload as Record<string, unknown> & { days?: Array<{ date?: string }> };
  const days = (payload.days ?? []).filter(
    (day) => (!from || String(day.date) >= from) && (!to || String(day.date) <= to),
  );
  return response.status(200).json({
    schemaVersion: '1.0',
    generatedAt: new Date().toISOString(),
    dataVersion: row.data_version,
    user: { id: row.id, timezone: payload.timezone, locale: payload.locale },
    range: { from: from ?? days[0]?.date ?? null, to: to ?? days.at(-1)?.date ?? null },
    preferences: payload.preferences ?? {},
    days,
  });
}

function queryDate(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function setCors(response: VercelResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'Authorization, If-None-Match');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Expose-Headers', 'ETag');
}
