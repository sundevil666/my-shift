import type { UserData } from 'src/models/app';
import { buildActivitySnapshot } from 'src/core/activity-snapshot';

const SESSION_KEY = 'my-shift:integration-session';

export interface IntegrationSession {
  accessToken: string;
  expiresAt: string;
  user: { id: string; email: string; name: string | null; picture: string | null };
}

export function integrationSession(): IntegrationSession | null {
  try {
    const value = localStorage.getItem(SESSION_KEY);
    return value ? (JSON.parse(value) as IntegrationSession) : null;
  } catch {
    return null;
  }
}

export async function authenticateWithGoogle(credential: string) {
  const response = await fetch('/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  });
  if (!response.ok) throw new Error('google-auth-failed');
  const session = (await response.json()) as IntegrationSession;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function syncActivity(data: UserData) {
  const session = integrationSession();
  if (!session) return false;
  const response = await fetch('/api/account/schedule', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessToken}` },
    body: JSON.stringify(buildActivitySnapshot(data)),
  });
  if (response.status === 401) localStorage.removeItem(SESSION_KEY);
  return response.ok;
}

export function signOutIntegration() {
  localStorage.removeItem(SESSION_KEY);
}
