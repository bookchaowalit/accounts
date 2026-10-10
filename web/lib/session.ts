import 'server-only';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { authorize, SESSION_COOKIE, type Session } from './auth';

/** Pages and server actions: the signed-in owner, or a redirect to /login. */
export async function requireSession(): Promise<Session> {
  const session = await authorize({ method: 'GET', headers: new Headers(await headers()) },
    (await cookies()).get(SESSION_COOKIE)?.value, process.env);
  if (!session) redirect('/login');
  return session;
}
