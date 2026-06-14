import { neon } from '@neondatabase/serverless';

export type AnalyticsPlatform = 'android' | 'ios' | 'pwa' | 'web';

let schemaReady: Promise<void> | null = null;

function databaseUrl() {
  const value =
    process.env.DATABASE_URL ??
    process.env.DATABASE_POSTGRES_URL ??
    process.env.DATABASE_POSTGRES_URL_NON_POOLING;
  if (!value) throw new Error('Missing database connection URL');
  return value;
}

export function analyticsDb() {
  return neon(databaseUrl());
}

export async function ensureAnalyticsSchema() {
  schemaReady ??= createSchema();
  await schemaReady;
}

async function createSchema() {
  const sql = analyticsDb();
  await sql`
    CREATE TABLE IF NOT EXISTS app_installations (
      installation_id UUID PRIMARY KEY,
      platform TEXT NOT NULL,
      app_version TEXT NOT NULL,
      first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS app_activity (
      installation_id UUID NOT NULL REFERENCES app_installations(installation_id) ON DELETE CASCADE,
      activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
      platform TEXT NOT NULL,
      app_version TEXT NOT NULL,
      PRIMARY KEY (installation_id, activity_date)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS app_downloads (
      id BIGSERIAL PRIMARY KEY,
      release_version TEXT NOT NULL,
      platform TEXT NOT NULL DEFAULT 'android',
      downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS app_activity_date_idx ON app_activity(activity_date)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS app_downloads_date_idx ON app_downloads(downloaded_at)
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS admin_login_limits (
      key_hash TEXT PRIMARY KEY,
      attempt_count INTEGER NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL
    )
  `;
}

export function isAnalyticsPlatform(value: unknown): value is AnalyticsPlatform {
  return value === 'android' || value === 'ios' || value === 'pwa' || value === 'web';
}
