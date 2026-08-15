import { createHash, randomBytes } from 'node:crypto';
import type { VercelRequest } from '@vercel/node';
import { OAuth2Client } from 'google-auth-library';
import { analyticsDb } from './analytics.js';

export const ACTIVITY_SCOPE = 'activity:read';
const google = new OAuth2Client();
let schemaReady: Promise<void> | null = null;

export interface IntegrationClient {
  id: string;
  name: string;
  redirectUris: string[];
}

export interface GoogleIdentity {
  subject: string;
  email: string;
  name: string | null;
  picture: string | null;
}

export async function ensureIntegrationSchema() {
  schemaReady ??= createSchema();
  await schemaReady;
}

async function createSchema() {
  const sql = analyticsDb();
  await sql`
    CREATE TABLE IF NOT EXISTS integration_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      google_subject TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      display_name TEXT,
      picture_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS integration_sessions (
      token_hash TEXT PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES integration_users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS integration_schedule_snapshots (
      user_id UUID PRIMARY KEY REFERENCES integration_users(id) ON DELETE CASCADE,
      timezone TEXT NOT NULL,
      payload JSONB NOT NULL,
      data_version TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS integration_authorization_codes (
      code_hash TEXT PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES integration_users(id) ON DELETE CASCADE,
      client_id TEXT NOT NULL,
      redirect_uri TEXT NOT NULL,
      scope TEXT NOT NULL,
      code_challenge TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      consumed_at TIMESTAMPTZ
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS integration_tokens (
      token_hash TEXT PRIMARY KEY,
      refresh_token_hash TEXT UNIQUE,
      user_id UUID NOT NULL REFERENCES integration_users(id) ON DELETE CASCADE,
      client_id TEXT NOT NULL,
      scope TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      revoked_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS integration_tokens_refresh_idx ON integration_tokens(refresh_token_hash)`;
}

export async function verifyGoogleCredential(credential: string): Promise<GoogleIdentity> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error('Google Sign-In is not configured');
  const ticket = await google.verifyIdToken({ idToken: credential, audience: clientId });
  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email || payload.email_verified !== true) {
    throw new Error('Google account does not have a verified email');
  }
  return {
    subject: payload.sub,
    email: payload.email,
    name: payload.name ?? null,
    picture: payload.picture ?? null,
  };
}

export async function upsertUser(identity: GoogleIdentity): Promise<string> {
  await ensureIntegrationSchema();
  const sql = analyticsDb();
  const rows = await sql`
    INSERT INTO integration_users (google_subject, email, display_name, picture_url)
    VALUES (${identity.subject}, ${identity.email}, ${identity.name}, ${identity.picture})
    ON CONFLICT (google_subject) DO UPDATE SET
      email = EXCLUDED.email,
      display_name = EXCLUDED.display_name,
      picture_url = EXCLUDED.picture_url,
      updated_at = NOW()
    RETURNING id
  `;
  return String(rows[0]?.id);
}

export async function createSession(userId: string) {
  const token = opaqueToken('mys_session');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1_000);
  const sql = analyticsDb();
  await sql`
    INSERT INTO integration_sessions (token_hash, user_id, expires_at)
    VALUES (${hashToken(token)}, ${userId}, ${expiresAt.toISOString()})
  `;
  return { token, expiresAt: expiresAt.toISOString() };
}

export async function requireSession(request: VercelRequest): Promise<string | null> {
  await ensureIntegrationSchema();
  const token = bearerToken(request);
  if (!token) return null;
  const sql = analyticsDb();
  const rows = await sql`
    SELECT user_id FROM integration_sessions
    WHERE token_hash = ${hashToken(token)} AND expires_at > NOW()
  `;
  return rows[0]?.user_id ? String(rows[0].user_id) : null;
}

export async function requireActivityToken(request: VercelRequest) {
  await ensureIntegrationSchema();
  const token = bearerToken(request);
  if (!token) return null;
  const sql = analyticsDb();
  const rows = await sql`
    SELECT user_id, client_id, scope FROM integration_tokens
    WHERE token_hash = ${hashToken(token)} AND expires_at > NOW() AND revoked_at IS NULL
  `;
  const row = rows[0];
  if (!row || !String(row.scope).split(' ').includes(ACTIVITY_SCOPE)) return null;
  return { userId: String(row.user_id), clientId: String(row.client_id) };
}

export function integrationClient(clientId: string): IntegrationClient | null {
  try {
    const clients = JSON.parse(process.env.INTEGRATION_CLIENTS_JSON ?? '[]') as unknown;
    if (!Array.isArray(clients)) return null;
    const match = clients.find(
      (item): item is IntegrationClient =>
        typeof item === 'object' && item !== null && (item as IntegrationClient).id === clientId,
    );
    return match && Array.isArray(match.redirectUris) ? match : null;
  } catch {
    return null;
  }
}

export function opaqueToken(prefix: string) {
  return `${prefix}_${randomBytes(32).toString('base64url')}`;
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function pkceChallenge(verifier: string) {
  return createHash('sha256').update(verifier).digest('base64url');
}

function bearerToken(request: VercelRequest) {
  const value = request.headers.authorization;
  return typeof value === 'string' ? value.match(/^Bearer\s+(.+)$/i)?.[1] ?? null : null;
}
