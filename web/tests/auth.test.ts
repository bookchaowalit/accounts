import { randomBytes } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { authReadiness, createSession, readSession, subjectFor, subjects } from '@/lib/auth';

const origin = 'https://accounts.example.com';
const env = {
  ACCOUNTS_WEB_PUBLIC_ORIGIN: origin, ACCOUNTS_WEB_OIDC_ISSUER: 'https://accounts.google.com',
  ACCOUNTS_WEB_OIDC_CLIENT_ID: 'id', ACCOUNTS_WEB_OIDC_CLIENT_SECRET: 'secret',
  ACCOUNTS_WEB_OWNER_SUBJECTS: JSON.stringify({ 'sub-1': 'owner' }),
  ACCOUNTS_WEB_SESSION_KEY: randomBytes(32).toString('base64url'),
};

describe('owner sessions', () => {
  it('is ready only with every variable', () => {
    expect(authReadiness(env).ready).toBe(true);
    expect(authReadiness({ ...env, ACCOUNTS_WEB_SESSION_KEY: 'short' }).ready).toBe(false);
  });
  it('accepts only allow-listed subjects with a valid tenant', () => {
    expect(subjects({ ACCOUNTS_WEB_OWNER_SUBJECTS: '{"a":"owner"}' })).toEqual({ a: 'owner' });
    expect(subjects({ ACCOUNTS_WEB_OWNER_SUBJECTS: '{"a":"Bad Tenant"}' })).toEqual({});
    // one workspace-wide API token: a second subject would share the owner's data, so nobody gets in
    expect(subjects({ ACCOUNTS_WEB_OWNER_SUBJECTS: '{"a":"owner","b":"owner"}' })).toEqual({});
    expect(subjects({ ACCOUNTS_WEB_OWNER_SUBJECTS: '["a"]' })).toEqual({});
  });
  it('seals a session that only this origin and key can read', async () => {
    const { value } = await createSession('sub-1', origin, env);
    expect(await readSession(value, origin, env)).toMatchObject({ sub: 'sub-1', tenant: 'owner' });
    expect(await readSession(value, 'https://other.example.com', env)).toBeNull();
    expect(await readSession(value, origin, { ...env, ACCOUNTS_WEB_SESSION_KEY: randomBytes(32).toString('base64url') })).toBeNull();
    expect(await readSession(value, origin, { ...env, ACCOUNTS_WEB_OWNER_SUBJECTS: '{}' })).toBeNull();
    await expect(createSession('stranger', origin, env)).rejects.toThrow('owner_not_allowed');
  });
  it('matches a verified email only', () => {
    const byEmail = { ...env, ACCOUNTS_WEB_OWNER_SUBJECTS: JSON.stringify({ 'email:owner@example.com': 'owner' }) };
    expect(subjectFor({ sub: '123', email: 'Owner@Example.com', email_verified: true }, byEmail)).toBe('email:owner@example.com');
    expect(subjectFor({ sub: '123', email: 'owner@example.com', email_verified: false }, byEmail)).toBe('123');
    expect(subjectFor({ sub: '123', email: 'owner@example.com' }, byEmail)).toBe('123');
  });
});
