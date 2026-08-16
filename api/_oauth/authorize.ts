import type { VercelRequest, VercelResponse } from '@vercel/node';
import { analyticsDb } from '../_lib/analytics.js';
import {
  ACTIVITY_SCOPE,
  ensureIntegrationSchema,
  hashToken,
  integrationClient,
  opaqueToken,
  requireSession,
} from '../_lib/integrations.js';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'method_not_allowed' });
  }
  const userId = await requireSession(request);
  if (!userId) return response.status(401).json({ error: 'invalid_session' });
  const { clientId, redirectUri, state, scope, codeChallenge, codeChallengeMethod } = request.body ?? {};
  const client = typeof clientId === 'string' ? integrationClient(clientId) : null;
  if (
    !client ||
    typeof redirectUri !== 'string' ||
    !client.redirectUris.includes(redirectUri) ||
    scope !== ACTIVITY_SCOPE ||
    codeChallengeMethod !== 'S256' ||
    typeof codeChallenge !== 'string' ||
    !/^[A-Za-z0-9_-]{43,128}$/.test(codeChallenge) ||
    typeof state !== 'string' ||
    state.length < 16 ||
    state.length > 500
  ) {
    return response.status(400).json({ error: 'invalid_authorization_request' });
  }
  await ensureIntegrationSchema();
  const code = opaqueToken('mys_code');
  const sql = analyticsDb();
  await sql`
    INSERT INTO integration_authorization_codes
      (code_hash, user_id, client_id, redirect_uri, scope, code_challenge, expires_at)
    VALUES
      (${hashToken(code)}, ${userId}, ${client.id}, ${redirectUri}, ${scope}, ${codeChallenge}, NOW() + INTERVAL '5 minutes')
  `;
  const redirect = new URL(redirectUri);
  redirect.searchParams.set('code', code);
  redirect.searchParams.set('state', state);
  response.setHeader('Cache-Control', 'no-store');
  return response.status(200).json({ redirectTo: redirect.toString() });
}
