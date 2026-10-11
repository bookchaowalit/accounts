import { authReadiness } from '@/lib/auth';

const ERRORS: Record<string, string> = {
  configuration: 'วิธีล็อกอินนี้ยังตั้งค่าไม่ครบ',
  unavailable: 'ติดต่อผู้ให้บริการล็อกอินไม่ได้ ลองอีกครั้ง',
  denied: 'บัญชีนี้ไม่ได้รับอนุญาต หรือการล็อกอินหมดอายุ',
  password: 'รหัสผ่านหรือรหัส 6 หลักไม่ถูกต้อง',
  locked: 'ลองผิดหลายครั้ง รอ 15 นาทีแล้วลองใหม่',
};

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const error = (await searchParams).error;
  const { ready, methods } = authReadiness(process.env);
  return (
    <div className="panel login">
      <h1>เข้าสู่ระบบ</h1>
      <p className="muted">เฉพาะเจ้าของเท่านั้น</p>
      {error && <p className="error" role="alert">{ERRORS[error] ?? 'เข้าสู่ระบบไม่สำเร็จ'}</p>}
      {methods.password && (
        <form action="/auth/password" method="post" className="login-form">
          <label><span>รหัสผ่าน</span>
            <input type="password" name="password" autoComplete="current-password" required maxLength={1024} /></label>
          <label><span>รหัส 6 หลักจากแอป Authenticator</span>
            <input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" required /></label>
          <button type="submit">เข้าสู่ระบบ</button>
        </form>
      )}
      {methods.oidc && <p><a href="/auth/login"><button type="button" className="secondary">เข้าสู่ระบบด้วย Google</button></a></p>}
      {!ready && <p className="muted">ระบบล็อกอินยังตั้งค่าไม่ครบ</p>}
    </div>
  );
}
