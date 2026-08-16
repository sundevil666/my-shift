import type { VercelRequest, VercelResponse } from '@vercel/node';
import activity from '../_analytics/activity.js';
import download from '../_analytics/download.js';
import session from '../_analytics/session.js';
import summary from '../_analytics/summary.js';

const handlers = { activity, download, session, summary } as const;

export default function handler(request: VercelRequest, response: VercelResponse) {
  const action = Array.isArray(request.query.action)
    ? request.query.action[0]
    : request.query.action;
  const actionHandler = action ? handlers[action as keyof typeof handlers] : undefined;

  if (!actionHandler) {
    return response.status(404).json({ error: 'Not found' });
  }

  return actionHandler(request, response);
}
