import { createHmac, timingSafeEqual } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { enforceRateLimit } from './_lib/push.js';

const recipient = 'sundevildi@gmail.com';
const subject = 'My Shift — Отзывы и предложения';

interface FeedbackBody {
  name?: string;
  email?: string;
  message?: string;
  answer?: string;
  challengeToken?: string;
  website?: string;
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method === 'GET') return createChallenge(response);
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'GET, POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const body = request.body as FeedbackBody;
  const clientAddress = String(request.headers['x-forwarded-for'] ?? 'unknown')
    .split(',')[0]
    ?.trim();
  if (!(await enforceRateLimit(`feedback:${clientAddress}`, 5, 60 * 60))) {
    return response.status(429).json({ error: 'Rate limit exceeded' });
  }
  if (body.website) return response.status(200).json({ ok: true });
  if (!isValidBody(body) || !verifyChallenge(body.challengeToken, body.answer)) {
    return response.status(400).json({ error: 'Invalid feedback' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FEEDBACK_FROM_EMAIL;
  if (!apiKey || !from) {
    return response.status(503).json({ error: 'Feedback email is not configured' });
  }

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [recipient],
      reply_to: body.email,
      subject,
      text: `Имя: ${body.name}\nEmail: ${body.email}\n\n${body.message}`,
    }),
  });
  if (!resendResponse.ok) return response.status(502).json({ error: 'Email delivery failed' });
  return response.status(200).json({ ok: true });
}

function createChallenge(response: VercelResponse) {
  const left = randomNumber();
  const right = randomNumber();
  const expires = Date.now() + 10 * 60_000;
  const payload = `${left + right}.${expires}`;
  return response.status(200).json({
    question: `${left} + ${right}`,
    token: `${payload}.${sign(payload)}`,
  });
}

function verifyChallenge(token: string, answer: string) {
  const [expected, expires, signature] = token.split('.');
  if (!expected || !expires || !signature || Number(expires) < Date.now()) return false;
  const payload = `${expected}.${expires}`;
  const actual = Buffer.from(signature);
  const valid = Buffer.from(sign(payload));
  return (
    actual.length === valid.length &&
    timingSafeEqual(actual, valid) &&
    Number(answer) === Number(expected)
  );
}

function sign(payload: string) {
  const secret = process.env.FEEDBACK_CAPTCHA_SECRET;
  if (!secret) throw new Error('Missing FEEDBACK_CAPTCHA_SECRET');
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function randomNumber() {
  return Math.floor(Math.random() * 8) + 2;
}

function isValidBody(body: FeedbackBody): body is Required<FeedbackBody> {
  return Boolean(
    body &&
      typeof body.name === 'string' &&
      body.name.trim().length >= 2 &&
      body.name.length <= 100 &&
      typeof body.email === 'string' &&
      body.email.length <= 160 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) &&
      typeof body.message === 'string' &&
      body.message.trim().length >= 10 &&
      body.message.length <= 4000 &&
      typeof body.answer === 'string' &&
      typeof body.challengeToken === 'string' &&
      typeof body.website === 'string',
  );
}
