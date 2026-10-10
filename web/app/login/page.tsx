import { authReadiness } from '@/lib/auth';

const ERRORS: Record<string, string> = {
  configuration: 'ระบบล็อกอินยังตั้งค่าไม่ครบ',
  unavailable: 'ติดต่อผู้ให้บริการล็อกอินไม่ได้ ลองอีกครั้ง',
  denied: 'บัญชีนี้ไม่ได้รับอนุญาต หรือการล็อกอินหมดอายุ',
};

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const error = (await searchParams).error;
  const readiness = authReadiness(process.env);
  return (
    <div className="panel" style={{ maxWidth: 440, margin: '40px auto' }}>
      <h1>เข้าสู่ระบบ</h1>
      <p className="muted">เฉพาะเจ้าของเท่านั้น</p>
      {error && <p className="error" role="alert">{ERRORS[error] ?? 'เข้าสู่ระบบไม่สำเร็จ'}</p>}
      {readiness.ready
        ? <a href="/auth/login"><button type="button">เข้าสู่ระบบด้วยบัญชีของคุณ</button></a>
        : <p className="muted">ยังขาดค่า: {Object.entries(readiness.checks).filter(([, ok]) => !ok).map(([name]) => name).join(', ')}</p>}
    </div>
  );
}
