import { Redis } from '@upstash/redis';
import { Client, Receiver } from '@upstash/qstash';
import webpush from 'web-push';

export interface ScheduledPush {
  at: number;
  body: string;
  deviceId: string;
  id: string;
  kind: 'alarm' | 'notification';
}

export interface StoredSubscription {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    auth: string;
    p256dh: string;
  };
}

export function getRedis(): Redis {
  return Redis.fromEnv();
}

export function configureWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) {
    throw new Error('Missing VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY or VAPID_SUBJECT');
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return webpush;
}

export function getQStash(): Client {
  return new Client({ token: requireEnvironment('QSTASH_TOKEN') });
}

export function getQStashReceiver(): Receiver {
  return new Receiver({
    currentSigningKey: requireEnvironment('QSTASH_CURRENT_SIGNING_KEY'),
    nextSigningKey: requireEnvironment('QSTASH_NEXT_SIGNING_KEY'),
  });
}

export const deviceMessageIdsKey = (deviceId: string) =>
  `my-shift:qstash-message-ids:${deviceId}`;

export async function enforceRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const redis = getRedis();
  const redisKey = `my-shift:rate:${key}`;
  const count = await redis.incr(redisKey);
  if (count === 1) await redis.expire(redisKey, windowSeconds);
  return count <= limit;
}

function requireEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}
