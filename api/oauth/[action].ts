import type { VercelRequest, VercelResponse } from '@vercel/node';
import authorize from '../_oauth/authorize';
import client from '../_oauth/client';
import token from '../_oauth/token';

const handlers = { authorize, client, token } as const;

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
