import { NextRequest, NextResponse } from 'next/server';
import { authReadiness, cookieOptions, createSession, finishLogin, PASSWORD_SUBJECT, SESSION_COOKIE, startLogin, TRANSACTION_COOKIE } from './auth';
import { checkPasswordLogin } from './password';
import { guardRequest, requestOrigin } from './request-guard';

function failure(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status, headers: { 'Cache-Control': 'no-store' } });
}

function redirect(path: string | URL, origin: string) {
  const response = NextResponse.redirect(new URL(path, origin), 303);
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('Referrer-Policy', 'no-referrer');
  return response;
}

export async function login(request: NextRequest) {
  const guard = guardRequest(request, process.env);
  if (!guard.ok) return failure(guard.status, guard.code, guard.message);
  const origin = requestOrigin(request, process.env)!;
  if (!authReadiness(process.env).methods.oidc) return redirect('/login?error=configuration', origin);
  try {
    const { url, transaction } = await startLogin(origin, process.env);
    const response = redirect(url, origin);
    response.cookies.set(TRANSACTION_COOKIE, transaction, { ...cookieOptions, maxAge: 600 });
    return response;
  } catch { return redirect('/login?error=unavailable', origin); }
}

export async function callback(request: NextRequest) {
  const guard = guardRequest(request, process.env);
  if (!guard.ok) return failure(guard.status, guard.code, guard.message);
  const origin = requestOrigin(request, process.env)!;
  let response: NextResponse;
  try {
    const callbackUrl = new URL(`/auth/callback${request.nextUrl.search}`, origin);
    const result = await finishLogin(callbackUrl, request.cookies.get(TRANSACTION_COOKIE)?.value, origin, process.env);
    response = redirect('/', origin);
    response.cookies.set(SESSION_COOKIE, result.value, { ...cookieOptions, maxAge: result.maxAge });
  } catch {
    response = redirect('/login?error=denied', origin);
    response.cookies.set(SESSION_COOKIE, '', { ...cookieOptions, maxAge: 0 });
  }
  response.cookies.set(TRANSACTION_COOKIE, '', { ...cookieOptions, maxAge: 0 });
  return response;
}

// Failed attempts per client, per warm instance. The TOTP code is the real brute-force barrier; this only
// slows a burst. Each failure also waits, so a wrong guess costs the caller time.
const failures = new Map<string, { count: number; until: number }>();
const MAX_FAILURES = 5;
const LOCK_MS = 15 * 60_000;

function client(request: NextRequest): string {
  return (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
}

export async function passwordLogin(request: NextRequest) {
  const guard = guardRequest(request, process.env, 3623, false);
  if (!guard.ok) return failure(guard.status, guard.code, guard.message);
  const origin = requestOrigin(request, process.env)!;
  if (!authReadiness(process.env).methods.password) return redirect('/login?error=configuration', origin);
  const who = client(request);
  const state = failures.get(who);
  if (state && state.count >= MAX_FAILURES && state.until > Date.now()) return redirect('/login?error=locked', origin);
  const form = await request.formData().catch(() => null);
  const password = String(form?.get('password') ?? '');
  const code = String(form?.get('code') ?? '').replace(/\s/g, '');
  if (password.length > 1024 || !checkPasswordLogin(password, code, process.env)) {
    const count = (state && state.until > Date.now() ? state.count : 0) + 1;
    failures.set(who, { count, until: Date.now() + LOCK_MS });
    await new Promise((resolve) => setTimeout(resolve, 600));
    return redirect('/login?error=password', origin);
  }
  failures.delete(who);
  const session = await createSession(PASSWORD_SUBJECT, origin, process.env);
  const response = redirect('/', origin);
  response.cookies.set(SESSION_COOKIE, session.value, { ...cookieOptions, maxAge: session.maxAge });
  return response;
}

export async function logout(request: NextRequest) {
  const guard = guardRequest(request, process.env, 3623, false);
  if (!guard.ok) return failure(guard.status, guard.code, guard.message);
  const response = redirect('/login', requestOrigin(request, process.env)!);
  response.cookies.set(SESSION_COOKIE, '', { ...cookieOptions, maxAge: 0 });
  response.cookies.set(TRANSACTION_COOKIE, '', { ...cookieOptions, maxAge: 0 });
  return response;
}
