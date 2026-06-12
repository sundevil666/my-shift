import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_request: VercelRequest, response: VercelResponse) {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) {
    return response.status(503).json({ error: 'Push notifications are not configured' });
  }
  response.setHeader('Cache-Control', 'public, max-age=300');
  return response.status(200).json({ publicKey });
}
