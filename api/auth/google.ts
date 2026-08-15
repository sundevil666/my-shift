import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createSession, upsertUser, verifyGoogleCredential } from '../_lib/integrations.js';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'method_not_allowed' });
  }
  const credential = request.body?.credential;
  if (typeof credential !== 'string' || credential.length > 10_000) {
    return response.status(400).json({ error: 'invalid_google_credential' });
  }
  try {
    const identity = await verifyGoogleCredential(credential);
    const userId = await upsertUser(identity);
    const session = await createSession(userId);
    response.setHeader('Cache-Control', 'no-store');
    return response.status(200).json({
      accessToken: session.token,
      expiresAt: session.expiresAt,
      user: { id: userId, email: identity.email, name: identity.name, picture: identity.picture },
    });
  } catch (error) {
    console.error('Google authentication failed', error);
    return response.status(401).json({ error: 'google_authentication_failed' });
  }
}
