import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ACTIVITY_SCOPE, integrationClient } from '../_lib/integrations.js';

export default function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'GET') return response.status(405).json({ error: 'method_not_allowed' });
  const clientId = Array.isArray(request.query.client_id)
    ? request.query.client_id[0]
    : request.query.client_id;
  const redirectUri = Array.isArray(request.query.redirect_uri)
    ? request.query.redirect_uri[0]
    : request.query.redirect_uri;
  const client = clientId ? integrationClient(clientId) : null;
  if (!client || !redirectUri || !client.redirectUris.includes(redirectUri)) {
    return response.status(400).json({ error: 'unknown_client' });
  }
  response.setHeader('Cache-Control', 'no-store');
  return response.status(200).json({ id: client.id, name: client.name, scope: ACTIVITY_SCOPE });
}
