import { describe, expect, it } from 'vitest';
import { checkPasswordLogin, hashPassword, newTotpSecret, totp, verifyPassword, verifyTotp } from '@/lib/password';

describe('owner password', () => {
  const hash = hashPassword('correct horse battery');
  it('verifies the right password only', () => {
    expect(verifyPassword(hash, 'correct horse battery')).toBe(true);
    expect(verifyPassword(hash, 'correct horse batterY')).toBe(false);
    expect(verifyPassword('plain', 'x')).toBe(false);
    expect(() => hashPassword('short')).toThrow('password_too_short');
  });
  it('matches the RFC 6238 SHA-1 test vector', () => {
    // secret "12345678901234567890" in base32; T = 59 s -> step 1 -> 94287082 (8 digits) -> 287082
    expect(totp('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ', 1)).toBe('287082');
  });
  it('accepts the current step and its neighbours, nothing else', () => {
    const secret = newTotpSecret();
    const now = 1_800_000_000_000;
    const step = Math.floor(now / 30_000);
    expect(verifyTotp(secret, totp(secret, step), now)).toBe(true);
    expect(verifyTotp(secret, totp(secret, step + 1), now)).toBe(true);
    expect(verifyTotp(secret, totp(secret, step + 3), now)).toBe(false);
    expect(verifyTotp(secret, 'abcdef', now)).toBe(false);
  });
  it('needs both factors and a configuration', () => {
    const secret = newTotpSecret();
    const env = { ACCOUNTS_WEB_PASSWORD_HASH: hash, ACCOUNTS_WEB_TOTP_SECRET: secret };
    const code = totp(secret, Math.floor(Date.now() / 30_000));
    expect(checkPasswordLogin('correct horse battery', code, env)).toBe(true);
    expect(checkPasswordLogin('wrong password here', code, env)).toBe(false);
    expect(checkPasswordLogin('correct horse battery', '000000' === code ? '111111' : '000000', env)).toBe(false);
    expect(checkPasswordLogin('correct horse battery', code, {})).toBe(false);
  });
});
