export interface AnalyticsSummary {
  totals: {
    installations: number;
    downloads: number;
    successful_updates: number;
    inactive_30d: number;
    active_1d: number;
    active_7d: number;
    active_30d: number;
  };
  platforms: Array<{ platform: string; installations: number }>;
  versions: Array<{ app_version: string; installations: number }>;
  daily: Array<{ activity_date: string; active: number }>;
  newInstallations: Array<{ install_date: string; installations: number }>;
  retention: {
    eligible_d1: number;
    retained_d1: number;
    eligible_d7: number;
    retained_d7: number;
    eligible_d30: number;
    retained_d30: number;
  };
  versionChanges: Array<{
    from_version: string;
    to_version: string;
    updates: number;
    last_update_at: string;
  }>;
}

export async function checkAdminSession() {
  const response = await fetch('/api/analytics/session', { cache: 'no-store' });
  return response.ok;
}

export async function loginToAnalytics(password: string) {
  const response = await fetch('/api/analytics/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? 'invalid-password'
        : response.status === 429
          ? 'too-many-attempts'
          : 'login-failed',
    );
  }
}

export async function logoutFromAnalytics() {
  await fetch('/api/analytics/session', { method: 'DELETE' });
}

export async function loadAnalyticsSummary(): Promise<AnalyticsSummary> {
  const response = await fetch('/api/analytics/summary', { cache: 'no-store' });
  if (!response.ok) throw new Error(response.status === 401 ? 'unauthorized' : 'load-failed');
  return response.json() as Promise<AnalyticsSummary>;
}
