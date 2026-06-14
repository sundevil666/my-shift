import type { VercelRequest, VercelResponse } from '@vercel/node';
import { enforceRateLimit } from './_lib/push.js';

const recipient = 'sundevildi@gmail.com';
const subject = 'My Shift - ошибка приложения';

interface ErrorReportBody {
  name?: string;
  message?: string;
  stack?: string;
  page?: string;
  platform?: string;
  appVersion?: string;
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const clientAddress = String(request.headers['x-forwarded-for'] ?? 'unknown')
    .split(',')[0]
    ?.trim();
  if (!(await enforceRateLimit(`error-report:${clientAddress}`, 20, 60 * 60))) {
    return response.status(429).json({ error: 'Rate limit exceeded' });
  }

  const body = request.body as ErrorReportBody;
  if (!isValidBody(body)) return response.status(400).json({ error: 'Invalid error report' });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FEEDBACK_FROM_EMAIL;
  if (!apiKey || !from) {
    return response.status(503).json({ error: 'Error reporting email is not configured' });
  }

  const text = [
    `Тип: ${body.name}`,
    `Сообщение: ${body.message}`,
    `Версия: ${body.appVersion}`,
    `Платформа: ${body.platform}`,
    `Страница: ${body.page}`,
    '',
    body.stack || 'Stack trace отсутствует',
  ].join('\n');

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [recipient], subject, text }),
  });

  if (!resendResponse.ok) return response.status(502).json({ error: 'Email delivery failed' });
  return response.status(200).json({ ok: true });
}

function isValidBody(body: ErrorReportBody): body is Required<ErrorReportBody> {
  return Boolean(
    body &&
      typeof body.name === 'string' &&
      body.name.length >= 1 &&
      body.name.length <= 100 &&
      typeof body.message === 'string' &&
      body.message.length >= 1 &&
      body.message.length <= 2000 &&
      typeof body.stack === 'string' &&
      body.stack.length <= 8000 &&
      typeof body.page === 'string' &&
      body.page.length <= 500 &&
      typeof body.platform === 'string' &&
      body.platform.length <= 100 &&
      typeof body.appVersion === 'string' &&
      body.appVersion.length <= 100,
  );
}
