import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  configureWebPush,
  getQStashReceiver,
  type ScheduledPush,
  type StoredSubscription,
} from '../_lib/push.js';

interface DeliveryBody {
  reminder: ScheduledPush;
  subscription: StoredSubscription;
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const signature = request.headers['upstash-signature'];
  const rawBody = JSON.stringify(request.body);
  if (
    typeof signature !== 'string' ||
    !(await getQStashReceiver().verify({ signature, body: rawBody }))
  ) {
    return response.status(401).json({ error: 'Invalid QStash signature' });
  }

  const { reminder, subscription } = request.body as DeliveryBody;
  try {
    await configureWebPush().sendNotification(
      subscription,
      JSON.stringify({
        title: 'My Shift',
        body: reminder.body,
        tag: reminder.id,
        kind: reminder.kind,
        url: '/',
      }),
      { TTL: 300, urgency: reminder.kind === 'alarm' ? 'high' : 'normal' },
    );
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode !== 404 && statusCode !== 410) throw error;
  }

  return response.status(200).json({ ok: true });
}
