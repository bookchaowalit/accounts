// Turn on owner password sign-in: asks for a password (hidden), makes a TOTP secret for an authenticator
// app, checks one code, then stores the scrypt hash and the secret in Vercel and redeploys.
//
//   cd web && node scripts/set-password.ts
//
// Run it yourself in a terminal: the password and the secret appear only there, never in a file or log.

import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';
import { hashPassword, newTotpSecret, verifyTotp } from '../lib/password.ts';

const SCOPE = 'chaowalit-greepokes-projects';
let muted = false;
const output = new Writable({ write(chunk, _enc, done) { if (!muted) process.stdout.write(chunk); done(); } });
const rl = createInterface({ input: process.stdin, output, terminal: true });

async function hidden(prompt: string): Promise<string> {
  process.stdout.write(prompt);
  muted = true;
  const value = await rl.question('');
  muted = false;
  process.stdout.write('\n');
  return value;
}

const password = await hidden('รหัสผ่านใหม่ (อย่างน้อย 12 ตัว): ');
if (password !== await hidden('พิมพ์อีกครั้ง: ')) throw new Error('รหัสผ่านไม่ตรงกัน');
const hash = hashPassword(password);
const secret = newTotpSecret();
const uri = `otpauth://totp/Accounts:owner?secret=${secret}&issuer=Accounts&algorithm=SHA1&digits=6&period=30`;
console.log('\nเพิ่มในแอป Authenticator (เช่น Google Authenticator, 1Password) ด้วย URI นี้ หรือพิมพ์ secret เอง:');
console.log(`  ${uri}\n  secret: ${secret}\n`);
const code = (await rl.question('รหัส 6 หลักที่แอปแสดงตอนนี้: ')).replace(/\s/g, '');
if (!verifyTotp(secret, code)) throw new Error('รหัสไม่ถูกต้อง ไม่ได้บันทึกอะไร ลองรันใหม่');
rl.close();

for (const [name, value] of [['ACCOUNTS_WEB_PASSWORD_HASH', hash], ['ACCOUNTS_WEB_TOTP_SECRET', secret]]) {
  const result = spawnSync('vercel', ['env', 'add', name, 'production', '--force', '--scope', SCOPE],
    { input: value, stdio: ['pipe', 'ignore', 'inherit'] });
  if (result.status !== 0) throw new Error(`ตั้ง ${name} ใน Vercel ไม่สำเร็จ`);
}
console.log('บันทึกใน Vercel แล้ว กำลัง deploy...');
const deploy = spawnSync('vercel', ['deploy', '--prod', '--yes', '--scope', SCOPE], { stdio: ['ignore', 'ignore', 'inherit'] });
if (deploy.status !== 0) throw new Error('deploy ไม่สำเร็จ');
console.log('เสร็จแล้ว: เข้า https://solo-accounts-web.vercel.app/login ด้วยรหัสผ่าน + รหัส 6 หลัก');
