import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

// Owner password sign-in: a scrypt password hash plus a TOTP code (RFC 6238, SHA-1, 6 digits, 30 s)
// from an authenticator app. Both live only in server variables:
//   ACCOUNTS_WEB_PASSWORD_HASH = scrypt$<N>$<r>$<p>$<salt b64url>$<hash b64url>
//   ACCOUNTS_WEB_TOTP_SECRET   = base32 secret (scripts/set-password.ts makes both)

type Env = Record<string, string | undefined>;
const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const SCRYPT = { N: 1 << 15, r: 8, p: 1 };

export function hashPassword(password: string): string {
  if (password.length < 12) throw new Error('password_too_short');
  const salt = randomBytes(16);
  const hash = scryptSync(password.normalize('NFKC'), salt, 32, { ...SCRYPT, maxmem: 64 * 1024 * 1024 });
  return ['scrypt', SCRYPT.N, SCRYPT.r, SCRYPT.p, salt.toString('base64url'), hash.toString('base64url')].join('$');
}

export function verifyPassword(stored: string | undefined, password: string): boolean {
  const parts = (stored ?? '').split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [N, r, p] = parts.slice(1, 4).map(Number);
  if (![N, r, p].every(Number.isSafeInteger) || N < 1 << 14) return false;
  const expected = Buffer.from(parts[5], 'base64url');
  if (expected.length !== 32) return false;
  const actual = scryptSync(password.normalize('NFKC'), Buffer.from(parts[4], 'base64url'), 32,
    { N, r, p, maxmem: 64 * 1024 * 1024 });
  return timingSafeEqual(actual, expected);
}

export function newTotpSecret(): string {
  return [...randomBytes(20)].map((b) => BASE32[b & 31]).join('');
}

function decodeBase32(text: string): Buffer | null {
  const clean = text.replace(/=+$/, '').toUpperCase();
  if (!/^[A-Z2-7]{16,}$/.test(clean)) return null;
  let bits = '';
  for (const c of clean) bits += BASE32.indexOf(c).toString(2).padStart(5, '0');
  return Buffer.from(bits.match(/.{8}/g)!.map((b) => Number.parseInt(b, 2)));
}

export function totp(secret: string, step: number): string {
  const key = decodeBase32(secret);
  if (!key) throw new Error('totp_secret_invalid');
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const mac = createHmac('sha1', key).update(counter).digest();
  const offset = mac[mac.length - 1] & 15;
  return String((mac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000).padStart(6, '0');
}

/** Accepts the current 30-second step and one on either side (clock drift). */
export function verifyTotp(secret: string | undefined, code: string, now = Date.now()): boolean {
  if (!secret || !/^\d{6}$/.test(code) || !decodeBase32(secret)) return false;
  const step = Math.floor(now / 30_000);
  return [step - 1, step, step + 1].some((s) => timingSafeEqual(Buffer.from(totp(secret, s)), Buffer.from(code)));
}

export function passwordConfigured(env: Env): boolean {
  return (env.ACCOUNTS_WEB_PASSWORD_HASH ?? '').startsWith('scrypt$') && !!decodeBase32(env.ACCOUNTS_WEB_TOTP_SECRET ?? '');
}

export function checkPasswordLogin(password: string, code: string, env: Env): boolean {
  if (!passwordConfigured(env)) return false;
  const passwordOk = verifyPassword(env.ACCOUNTS_WEB_PASSWORD_HASH, password); // always run: same time either way
  return verifyTotp(env.ACCOUNTS_WEB_TOTP_SECRET, code) && passwordOk;
}
