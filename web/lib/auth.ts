import { EncryptJWT, jwtDecrypt } from 'jose';
import * as oidc from 'openid-client';
import { httpsOrigin, localDemo, requestOrigin, type GuardedRequest } from './request-guard';

// Owner-only sign-in through any OIDC provider (Google today; Clerk or another IdP when this becomes a
// multi-tenant SaaS). A session maps one allow-listed subject to one tenant; `tenant` also scopes the
// address-encryption keys, so moving to per-customer tenants needs no data format change.

type Env = Record<string, string | undefined>;
export const SESSION_COOKIE = '__Host-accounts-session';
export const TRANSACTION_COOKIE = '__Host-accounts-oidc';
export const cookieOptions = { httpOnly: true, secure: true, sameSite: 'lax' as const, path: '/' };
export const SESSION_SECONDS = 8 * 3600;
export interface Session { sub: string; tenant: string; exp: number }

/** ACCOUNTS_WEB_OWNER_SUBJECTS: {"<oidc sub>": "<tenant>"}; today one owner mapped to "owner". */
export function subjects(env: Env): Record<string, string> {
  try {
    const value: unknown = JSON.parse(env.ACCOUNTS_WEB_OWNER_SUBJECTS ?? '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    const entries = Object.entries(value).filter(([sub, tenant]) =>
      sub.length > 0 && typeof tenant === 'string' && /^[a-z0-9-]{1,64}$/.test(tenant));
    return Object.fromEntries(entries) as Record<string, string>;
  } catch { return {}; }
}

function sessionKey(env: Env): Uint8Array | null {
  const text = env.ACCOUNTS_WEB_SESSION_KEY ?? '';
  if (!/^[A-Za-z0-9_-]{43}$/.test(text)) return null;
  const key = Buffer.from(text, 'base64url');
  return key.length === 32 && key.toString('base64url') === text ? key : null;
}

function issuer(env: Env): URL | null {
  try {
    const url = new URL(env.ACCOUNTS_WEB_OIDC_ISSUER ?? '');
    return httpsOrigin(url.origin) && !url.username && !url.password && !url.search && !url.hash ? url : null;
  } catch { return null; }
}

export function authReadiness(env: Env) {
  const checks = {
    ACCOUNTS_WEB_PUBLIC_ORIGIN: !!httpsOrigin(env.ACCOUNTS_WEB_PUBLIC_ORIGIN),
    ACCOUNTS_WEB_OIDC_ISSUER: !!issuer(env),
    ACCOUNTS_WEB_OIDC_CLIENT_ID: !!env.ACCOUNTS_WEB_OIDC_CLIENT_ID,
    ACCOUNTS_WEB_OIDC_CLIENT_SECRET: !!env.ACCOUNTS_WEB_OIDC_CLIENT_SECRET,
    ACCOUNTS_WEB_OWNER_SUBJECTS: Object.keys(subjects(env)).length > 0,
    ACCOUNTS_WEB_SESSION_KEY: !!sessionKey(env),
  };
  return { ready: Object.values(checks).every(Boolean), checks };
}

async function seal(payload: Record<string, unknown>, audience: string, origin: string, expiration: number, env: Env) {
  const key = sessionKey(env);
  if (!key) throw new Error('auth_not_configured');
  return new EncryptJWT(payload).setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuer(origin).setAudience(audience).setIssuedAt().setExpirationTime(expiration).encrypt(key);
}

async function unseal(value: string, audience: string, origin: string, env: Env) {
  const key = sessionKey(env);
  if (!key) throw new Error('auth_not_configured');
  return (await jwtDecrypt(value, key, {
    issuer: origin, audience, keyManagementAlgorithms: ['dir'], contentEncryptionAlgorithms: ['A256GCM'],
  })).payload;
}

export async function createSession(sub: string, origin: string, env: Env) {
  const tenant = subjects(env)[sub];
  if (!authReadiness(env).ready || !tenant) throw new Error('owner_not_allowed');
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  return { value: await seal({ sub, tenant }, 'accounts-session', origin, expires, env), maxAge: SESSION_SECONDS };
}

export async function readSession(value: string | undefined, origin: string, env: Env): Promise<Session | null> {
  if (!value || !authReadiness(env).ready) return null;
  try {
    const p = await unseal(value, 'accounts-session', origin, env);
    if (typeof p.sub !== 'string' || typeof p.tenant !== 'string' || typeof p.exp !== 'number') return null;
    return subjects(env)[p.sub] === p.tenant ? { sub: p.sub, tenant: p.tenant, exp: p.exp } : null;
  } catch { return null; }
}

export async function authorize(request: GuardedRequest, cookie: string | undefined, env: Env): Promise<Session | null> {
  const origin = requestOrigin(request, env);
  if (!origin) return null;
  if (localDemo(request, env)) return { sub: 'local-demo', tenant: 'owner', exp: Math.floor(Date.now() / 1000) + 60 };
  return readSession(cookie, origin, env);
}

// Cache only discovery metadata in a warm instance, never user or provider tokens.
const configurations = new Map<string, Promise<oidc.Configuration>>();
async function configuration(env: Env) {
  if (!authReadiness(env).ready) throw new Error('auth_not_configured');
  const key = JSON.stringify([env.ACCOUNTS_WEB_OIDC_ISSUER, env.ACCOUNTS_WEB_OIDC_CLIENT_ID]);
  if (!configurations.has(key)) {
    const pending = oidc.discovery(issuer(env)!, env.ACCOUNTS_WEB_OIDC_CLIENT_ID!, env.ACCOUNTS_WEB_OIDC_CLIENT_SECRET!,
      undefined, { timeout: 10 });
    configurations.set(key, pending);
    pending.catch(() => configurations.delete(key));
  }
  return configurations.get(key)!;
}

export async function startLogin(origin: string, env: Env) {
  const config = await configuration(env);
  const verifier = oidc.randomPKCECodeVerifier();
  const state = oidc.randomState();
  const nonce = oidc.randomNonce();
  const url = oidc.buildAuthorizationUrl(config, {
    redirect_uri: `${origin}/auth/callback`, response_type: 'code', scope: 'openid',
    code_challenge: await oidc.calculatePKCECodeChallenge(verifier), code_challenge_method: 'S256', state, nonce,
  });
  if (url.protocol !== 'https:') throw new Error('issuer_not_secure');
  const transaction = await seal({ verifier, state, nonce }, 'accounts-oidc', origin,
    Math.floor(Date.now() / 1000) + 600, env);
  return { url, transaction };
}

export async function finishLogin(callback: URL, transaction: string | undefined, origin: string, env: Env) {
  if (!transaction) throw new Error('transaction_missing');
  const p = await unseal(transaction, 'accounts-oidc', origin, env);
  if (typeof p.verifier !== 'string' || typeof p.state !== 'string' || typeof p.nonce !== 'string') {
    throw new Error('transaction_invalid');
  }
  const config = await configuration(env);
  const tokens = await oidc.authorizationCodeGrant(config, callback, {
    pkceCodeVerifier: p.verifier, expectedState: p.state, expectedNonce: p.nonce, idTokenExpected: true,
  });
  const claims = tokens.claims(); // signature, issuer, audience, nonce, expiry, state and PKCE are verified
  if (!claims || typeof claims.sub !== 'string') throw new Error('id_token_invalid');
  return createSession(claims.sub, origin, env);
}
