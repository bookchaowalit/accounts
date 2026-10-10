import { randomBytes } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { addressHint, decryptAddress, encryptAddress, hashAddress } from '@/lib/crypto';
import { formToBody } from '@/lib/form';
import { RESOURCES } from '@/lib/schema';

const env = { ACCOUNTS_WEB_FIELD_KEY: randomBytes(32).toString('base64url') };

describe('address encryption', () => {
  it('round-trips, normalizes, and never contains "@"', () => {
    const sealed = encryptAddress('  Book@Example.com ', 'owner', env);
    expect(sealed.startsWith('v1:')).toBe(true);
    expect(sealed).not.toContain('@');
    expect(decryptAddress(sealed, 'owner', env)).toBe('book@example.com');
  });
  it('is bound to the tenant and detects tampering', () => {
    const sealed = encryptAddress('a@example.com', 'owner', env);
    expect(decryptAddress(sealed, 'other', env)).toBeNull();
    const parts = sealed.split(':');
    parts[2] = Buffer.from('x').toString('base64url');
    expect(decryptAddress(parts.join(':'), 'owner', env)).toBeNull();
    expect(decryptAddress(sealed, 'owner', { ACCOUNTS_WEB_FIELD_KEY: randomBytes(32).toString('base64url') })).toBeNull();
  });
  it('hashes per tenant, case-insensitively', () => {
    expect(hashAddress('A@Example.com', 'owner', env)).toBe(hashAddress('a@example.com', 'owner', env));
    expect(hashAddress('a@example.com', 'owner', env)).not.toBe(hashAddress('a@example.com', 'other', env));
    expect(hashAddress('a@example.com', 'owner', env)).toMatch(/^[0-9a-f]{64}$/);
  });
  it('refuses a missing key and bad addresses', () => {
    expect(() => encryptAddress('a@example.com', 'owner', {})).toThrow('field_key_not_configured');
    expect(() => encryptAddress('not-an-email', 'owner', env)).toThrow('invalid_address');
    expect(addressHint('Book@Example.com')).toBe('b***@example.com');
  });
});

describe('form bodies', () => {
  it('turns the address into ciphertext, hash and hint and drops empties on create', () => {
    const form = new FormData();
    form.set('address', 'me@example.com'); form.set('identity_id', '1000000'); form.set('provider', 'gmail');
    form.set('security_keys', '2'); form.set('recovery_phone', 'on'); form.set('notes', '');
    const body = formToBody(RESOURCES.mailboxes, form, 'owner', env);
    expect(body).not.toHaveProperty('address');
    expect(JSON.stringify(body)).not.toContain('me@example.com');
    expect(body.address_hint).toBe('m***@example.com');
    expect(body).toMatchObject({ identity_id: 1000000, provider: 'gmail', security_keys: 2, recovery_phone: true });
    expect(body).not.toHaveProperty('notes');
  });
  it('keeps the stored address on an edit with an empty address and clears optional fields', () => {
    const form = new FormData();
    form.set('identity_id', '1000000'); form.set('provider', 'gmail'); form.set('recovery_mailbox_id', '');
    const body = formToBody(RESOURCES.mailboxes, form, 'owner', env, true);
    expect(body).not.toHaveProperty('address_ciphertext');
    expect(body.recovery_mailbox_id).toBeNull();
  });
  it('requires required fields', () => {
    expect(() => formToBody(RESOURCES.identities, new FormData(), 'owner', env)).toThrow('_required');
  });
});
