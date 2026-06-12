import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  deviceMessageIdsKey,
  getQStash,
  getRedis,
  type ScheduledPush,
  type StoredSubscription,
} from '../_lib/push.js';

interface SubscribeBody {
  deviceId?: string;
  reminders?: Array<Omit<ScheduledPush, 'deviceId'>>;
  subscription?: StoredSubscription;
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const body = request.body as SubscribeBody;
  if (!isValidBody(body)) return response.status(400).json({ error: 'Invalid subscription' });

  const redis = getRedis();
  const qstash = getQStash();
  const messageIdsKey = deviceMessageIdsKey(body.deviceId);
  const previousMessageIds = await redis.smembers<string[]>(messageIdsKey);
  const reminders = body.reminders
    .filter((reminder) => reminder.at > Date.now() - 60_000)
    .slice(0, 100);

  if (previousMessageIds.length) {
    await qstash.messages.cancel(previousMessageIds);
  }
  await redis.del(messageIdsKey);

  const origin = request.headers['x-forwarded-host']
    ? `https://${request.headers['x-forwarded-host']}`
    : `https://${request.headers.host}`;
  const messageIds: string[] = [];
  for (const reminder of reminders) {
    const result = await qstash.publishJSON({
      url: `${origin}/api/push/deliver`,
      body: { reminder: { ...reminder, deviceId: body.deviceId }, subscription: body.subscription },
      notBefore: Math.floor(reminder.at / 1_000),
      retries: 3,
    });
    messageIds.push(result.messageId);
  }

  if (messageIds.length) {
    const pipeline = redis.pipeline();
    messageIds.forEach((messageId) => pipeline.sadd(messageIdsKey, messageId));
    pipeline.expire(messageIdsKey, 60 * 60 * 24 * 15);
    await pipeline.exec();
  }

  return response.status(200).json({ ok: true, scheduled: messageIds.length });
}

function isValidBody(body: SubscribeBody): body is Required<SubscribeBody> {
  return Boolean(
    body &&
      typeof body.deviceId === 'string' &&
      body.deviceId.length >= 16 &&
      body.subscription?.endpoint &&
      body.subscription.keys?.auth &&
      body.subscription.keys?.p256dh &&
      Array.isArray(body.reminders) &&
      body.reminders.every(
        (reminder) =>
          typeof reminder.id === 'string' &&
          typeof reminder.at === 'number' &&
          typeof reminder.body === 'string' &&
          (reminder.kind === 'alarm' || reminder.kind === 'notification'),
      ),
  );
}
