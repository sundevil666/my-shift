import { createHash } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { analyticsDb } from '../_lib/analytics.js';
import { ensureIntegrationSchema, requireSession } from '../_lib/integrations.js';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'PUT') {
    response.setHeader('Allow', 'PUT');
    return response.status(405).json({ error: 'method_not_allowed' });
  }
  const userId = await requireSession(request);
  if (!userId) return response.status(401).json({ error: 'invalid_session' });
  if (!isSnapshot(request.body)) return response.status(400).json({ error: 'invalid_snapshot' });

  const serialized = JSON.stringify(request.body);
  if (serialized.length > 1_000_000) return response.status(413).json({ error: 'snapshot_too_large' });
  const dataVersion = createHash('sha256').update(serialized).digest('base64url');
  await ensureIntegrationSchema();
  const sql = analyticsDb();
  await sql`
    INSERT INTO integration_schedule_snapshots (user_id, timezone, payload, data_version)
    VALUES (${userId}, ${request.body.timezone}, ${serialized}::jsonb, ${dataVersion})
    ON CONFLICT (user_id) DO UPDATE SET
      timezone = EXCLUDED.timezone,
      payload = EXCLUDED.payload,
      data_version = EXCLUDED.data_version,
      updated_at = NOW()
  `;
  response.setHeader('Cache-Control', 'no-store');
  return response.status(200).json({ ok: true, dataVersion });
}

function isSnapshot(value: unknown): value is { timezone: string; days: unknown[] } {
  if (!value || typeof value !== 'object') return false;
  const snapshot = value as { timezone?: unknown; days?: unknown };
  if (typeof snapshot.timezone !== 'string' || snapshot.timezone.length > 100) return false;
  if (!Array.isArray(snapshot.days) || snapshot.days.length > 120) return false;
  try {
    new Intl.DateTimeFormat('en', { timeZone: snapshot.timezone }).format();
    return true;
  } catch {
    return false;
  }
}
