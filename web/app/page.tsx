import Link from 'next/link';
import { api } from '@/lib/api';
import { requireSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

interface Finding {
  severity: 'high' | 'medium' | 'low' | 'info'; code: string; message: string;
  subject: { type: 'identity' | 'domain' | 'mailbox' | 'account'; id: number; label: string };
}
interface Report { counts: Record<string, number>; totals: Record<string, number>; findings: Finding[] }

const PATH = { identity: 'identities', domain: 'domains', mailbox: 'mailboxes', account: 'accounts' } as const;
const LEVELS = [['high', 'สูง'], ['medium', 'กลาง'], ['low', 'ต่ำ'], ['info', 'ข้อมูล']] as const;

export default async function Overview() {
  await requireSession();
  let report: Report | null = null;
  try { report = await api<Report>('GET', '/v1/risk-report'); } catch { report = null; }
  if (!report) return <><h1>ภาพรวม</h1><p className="error">ติดต่อ accounts-api ไม่ได้ ลองรีเฟรชอีกครั้ง</p></>;
  return (
    <>
      <h1>ภาพรวม</h1>
      <div className="counts">
        {Object.entries(PATH).map(([kind, path]) => (
          <Link key={kind} href={`/${path}`} className="count">
            <span className="muted">{kind}</span><strong>{report.totals[kind] ?? 0}</strong>
          </Link>
        ))}
      </div>
      <h2>ความเสี่ยง</h2>
      <div className="counts">
        {LEVELS.map(([level, label]) => (
          <div key={level} className="count"><span className={`sev-${level}`}>{label}</span>
            <strong>{report.counts[level] ?? 0}</strong></div>
        ))}
      </div>
      {report.findings.length === 0
        ? <p className="muted">ไม่พบความเสี่ยง</p>
        : (
          <ul className="findings">
            {report.findings.map((f, i) => (
              <li key={i}>
                <span className={`badge sev-${f.severity}`}>{f.severity}</span>
                <Link href={`/${PATH[f.subject.type]}/${f.subject.id}`}>{f.subject.label}</Link>
                {' — '}{f.message} <span className="muted">({f.code})</span>
              </li>
            ))}
          </ul>
        )}
    </>
  );
}
