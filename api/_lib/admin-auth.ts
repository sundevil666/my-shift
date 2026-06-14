import { createHmac, timingSafeEqual } from 'node:crypto';
import type { VercelRequest } from '@vercel/node';

const cookieName = 'my_shift_admin';
const sessionLifetimeSeconds = 12 * 60 * 60;

export function createAdminCookie() {
  const expires = Math.floor(Date.now() / 1000) + sessionLifetimeSeconds;
  const payload = String(expires);
  const value = `${payload}.${sign(payload)}`;
  return `${cookieName}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${sessionLifetimeSeconds}`;
}

export function clearAdminCookie() {
  return `${cookieName}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export function isAdminRequest(request: VercelRequest) {
  const bearer = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (bearer && secureEqual(bearer, requireEnvironment('ANALYTICS_ADMIN_TOKEN'))) return true;

  const cookie = request.headers.cookie
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`))
    ?.slice(cookieName.length + 1);
  if (!cookie) return false;

  const [expires, signature] = cookie.split('.');
  if (!expires || !signature || Number(expires) <= Math.floor(Date.now() / 1000)) return false;
  return secureEqual(signature, sign(expires));
}

export function isAdminPassword(value: unknown) {
  return (
    typeof value === 'string' &&
    secureEqual(value, requireEnvironment('ANALYTICS_ADMIN_PASSWORD'))
  );
}

function sign(payload: string) {
  return createHmac('sha256', requireEnvironment('ANALYTICS_ADMIN_TOKEN'))
    .update(payload)
    .digest('base64url');
}

function secureEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function requireEnvironment(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}
