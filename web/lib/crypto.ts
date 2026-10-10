import { createCipheriv, createDecipheriv, createHmac, hkdfSync, randomBytes } from 'node:crypto';

// Email addresses never reach the accounts-api in clear. This backend encrypts each one with
// AES-256-GCM under a key derived per tenant from ACCOUNTS_WEB_FIELD_KEY, and sends a keyed hash
// (HMAC-SHA256, its own derived key) so the API can still enforce uniqueness. Envelope:
//   v1:<iv b64url>:<ciphertext b64url>:<tag b64url>     (never contains "@"; the database checks that)

type Env = Record<string, string | undefined>;
const VERSION = 'v1';

function master(env: Env): Buffer {
  const text = env.ACCOUNTS_WEB_FIELD_KEY ?? '';
  const key = /^[A-Za-z0-9_-]{43}$/.test(text) ? Buffer.from(text, 'base64url') : Buffer.alloc(0);
  if (key.length !== 32) throw new Error('field_key_not_configured');
  return key;
}

function derive(env: Env, tenant: string, purpose: string): Buffer {
  return Buffer.from(hkdfSync('sha256', master(env), Buffer.from(`accounts:${tenant}`), Buffer.from(purpose), 32));
}

export function normalizeAddress(address: string): string {
  const value = address.trim().toLowerCase();
  if (!/^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/.test(value) || value.length > 254) throw new Error('invalid_address');
  return value;
}

export function encryptAddress(address: string, tenant: string, env: Env): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', derive(env, tenant, 'address-encryption'), iv);
  cipher.setAAD(Buffer.from(tenant));
  const body = Buffer.concat([cipher.update(normalizeAddress(address), 'utf8'), cipher.final()]);
  return [VERSION, iv.toString('base64url'), body.toString('base64url'), cipher.getAuthTag().toString('base64url')].join(':');
}

export function decryptAddress(envelope: string, tenant: string, env: Env): string | null {
  const parts = envelope.split(':');
  if (parts.length !== 4 || parts[0] !== VERSION) return null;
  try {
    const decipher = createDecipheriv('aes-256-gcm', derive(env, tenant, 'address-encryption'),
      Buffer.from(parts[1], 'base64url'));
    decipher.setAAD(Buffer.from(tenant));
    decipher.setAuthTag(Buffer.from(parts[3], 'base64url'));
    return Buffer.concat([decipher.update(Buffer.from(parts[2], 'base64url')), decipher.final()]).toString('utf8');
  } catch { return null; }
}

export function hashAddress(address: string, tenant: string, env: Env): string {
  return createHmac('sha256', derive(env, tenant, 'address-hash')).update(normalizeAddress(address)).digest('hex');
}

/** A short label that is safe to show and store: first letter, the domain, nothing else. */
export function addressHint(address: string): string {
  const [local, domain] = normalizeAddress(address).split('@');
  return `${local[0]}***@${domain}`;
}
