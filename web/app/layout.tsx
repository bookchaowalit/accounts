import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Accounts',
  description: 'ทะเบียนตัวตน อีเมล บัญชี และโดเมน พร้อมรายงานความเสี่ยง',
  robots: { index: false, follow: false },
};

const NAV = [
  ['/', 'ภาพรวม'], ['/identities', 'ตัวตน'], ['/mailboxes', 'อีเมล'], ['/accounts', 'บัญชี'], ['/domains', 'โดเมน'],
] as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <header className="top">
          <Link href="/" className="brand">Accounts</Link>
          <nav>{NAV.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}</nav>
          <form action="/auth/logout" method="post"><button className="link">ออกจากระบบ</button></form>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
