import type { VercelRequest, VercelResponse } from '@vercel/node';
import { analyticsDb } from '../_lib/analytics.js';
import { integrationClient, requireSession } from '../_lib/integrations.js';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'GET' && request.method !== 'DELETE') {
    response.setHeader('Allow', 'GET, DELETE');
    return response.status(405).json({ error: 'method_not_allowed' });
  }
  const userId = await requireSession(request);
  if (!userId) return response.status(401).json({ error: 'invalid_session' });
  const sql = analyticsDb();
  if (request.method === 'DELETE') {
    const clientId = request.body?.clientId;
    if (typeof clientId !== 'string') return response.status(400).json({ error: 'invalid_client' });
    await sql`
      UPDATE integration_tokens SET revoked_at = NOW()
      WHERE user_id = ${userId} AND client_id = ${clientId} AND revoked_at IS NULL
    `;
    return response.status(200).json({ ok: true });
  }
  const rows = await sql`
    SELECT client_id, scope, MAX(created_at) AS connected_at
    FROM integration_tokens
    WHERE user_id = ${userId} AND revoked_at IS NULL
    GROUP BY client_id, scope ORDER BY connected_at DESC
  `;
  return response.status(200).json({ grants: rows.map((row) => ({
    clientId: row.client_id,
    clientName: integrationClient(String(row.client_id))?.name ?? row.client_id,
    scope: row.scope,
    connectedAt: row.connected_at,
  })) });
}
