import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  deviceMessageIdsKey,
  enforceRateLimit,
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
  if (request.method !== 'POST' && request.method !== 'DELETE') {
    response.setHeader('Allow', 'POST, DELETE');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const body = request.body as SubscribeBody;
  if (request.method === 'DELETE') {
    if (typeof body?.deviceId !== 'string' || body.deviceId.length > 100) {
      return response.status(400).json({ error: 'Invalid device' });
    }
    await cancelDeviceMessages(body.deviceId);
    return response.status(200).json({ ok: true });
  }
  if (!isValidBody(body)) return response.status(400).json({ error: 'Invalid subscription' });
  if (!(await enforceRateLimit(`push:${body.deviceId}`, 12, 60))) {
    return response.status(429).json({ error: 'Rate limit exceeded' });
  }

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

  const origin = process.env.PUBLIC_APP_ORIGIN;
  if (!origin || !/^https:\/\/[^/]+$/.test(origin)) {
    return response.status(503).json({ error: 'Push callback origin is not configured' });
  }
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
  const now = Date.now();
  const latestAllowed = now + 16 * 24 * 60 * 60 * 1_000;
  return Boolean(
    body &&
      typeof body.deviceId === 'string' &&
      body.deviceId.length >= 16 &&
      body.deviceId.length <= 100 &&
      body.subscription?.endpoint &&
      body.subscription.keys?.auth &&
      body.subscription.keys?.p256dh &&
      body.subscription.endpoint.length <= 2_048 &&
      body.subscription.keys.auth.length <= 512 &&
      body.subscription.keys.p256dh.length <= 512 &&
      Array.isArray(body.reminders) &&
      body.reminders.length <= 100 &&
      body.reminders.every(
        (reminder) =>
          typeof reminder.id === 'string' &&
          reminder.id.length <= 200 &&
          typeof reminder.at === 'number' &&
          reminder.at >= now - 60_000 &&
          reminder.at <= latestAllowed &&
          typeof reminder.body === 'string' &&
          reminder.body.length <= 300 &&
          (reminder.kind === 'alarm' || reminder.kind === 'notification'),
      ),
  );
}

async function cancelDeviceMessages(deviceId: string) {
  const redis = getRedis();
  const qstash = getQStash();
  const key = deviceMessageIdsKey(deviceId);
  const messageIds = await redis.smembers<string[]>(key);
  if (messageIds.length) await qstash.messages.cancel(messageIds);
  await redis.del(key);
}
