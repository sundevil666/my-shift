import type { VercelRequest, VercelResponse } from '@vercel/node';
import { analyticsDb } from '../_lib/analytics.js';
import {
  ensureIntegrationSchema,
  hashToken,
  integrationClient,
  opaqueToken,
  pkceChallenge,
} from '../_lib/integrations.js';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  setCors(response);
  if (request.method === 'OPTIONS') return response.status(204).end();
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST, OPTIONS');
    return response.status(405).json({ error: 'method_not_allowed' });
  }
  await ensureIntegrationSchema();
  const body = request.body ?? {};
  const result =
    body.grant_type === 'authorization_code'
      ? await exchangeCode(body)
      : body.grant_type === 'refresh_token'
        ? await refreshToken(body)
        : null;
  if (!result) return response.status(400).json({ error: 'invalid_grant' });
  response.setHeader('Cache-Control', 'no-store');
  return response.status(200).json(result);
}

async function exchangeCode(body: Record<string, unknown>) {
  if (
    typeof body.code !== 'string' ||
    typeof body.client_id !== 'string' ||
    typeof body.redirect_uri !== 'string' ||
    typeof body.code_verifier !== 'string' ||
    !integrationClient(body.client_id)
  ) return null;
  const sql = analyticsDb();
  const rows = await sql`
    UPDATE integration_authorization_codes SET consumed_at = NOW()
    WHERE code_hash = ${hashToken(body.code)}
      AND client_id = ${body.client_id}
      AND redirect_uri = ${body.redirect_uri}
      AND code_challenge = ${pkceChallenge(body.code_verifier)}
      AND expires_at > NOW() AND consumed_at IS NULL
    RETURNING user_id, client_id, scope
  `;
  const row = rows[0];
  return row ? issueTokens(String(row.user_id), String(row.client_id), String(row.scope)) : null;
}

async function refreshToken(body: Record<string, unknown>) {
  if (typeof body.refresh_token !== 'string' || typeof body.client_id !== 'string') return null;
  const sql = analyticsDb();
  const rows = await sql`
    UPDATE integration_tokens SET revoked_at = NOW()
    WHERE refresh_token_hash = ${hashToken(body.refresh_token)}
      AND client_id = ${body.client_id} AND revoked_at IS NULL
    RETURNING user_id, client_id, scope
  `;
  const row = rows[0];
  return row ? issueTokens(String(row.user_id), String(row.client_id), String(row.scope)) : null;
}

async function issueTokens(userId: string, clientId: string, scope: string) {
  const accessToken = opaqueToken('mys_access');
  const refreshToken = opaqueToken('mys_refresh');
  const expiresIn = 3_600;
  const sql = analyticsDb();
  await sql`
    INSERT INTO integration_tokens
      (token_hash, refresh_token_hash, user_id, client_id, scope, expires_at)
    VALUES
      (${hashToken(accessToken)}, ${hashToken(refreshToken)}, ${userId}, ${clientId}, ${scope}, NOW() + INTERVAL '1 hour')
  `;
  return { access_token: accessToken, token_type: 'Bearer', expires_in: expiresIn, refresh_token: refreshToken, scope };
}

function setCors(response: VercelResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
}
