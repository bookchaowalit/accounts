import { NextRequest, NextResponse } from 'next/server';
import { authReadiness, cookieOptions, finishLogin, SESSION_COOKIE, startLogin, TRANSACTION_COOKIE } from './auth';
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
  if (!authReadiness(process.env).ready) return redirect('/login?error=configuration', origin);
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

export async function logout(request: NextRequest) {
  const guard = guardRequest(request, process.env, 3623, false);
  if (!guard.ok) return failure(guard.status, guard.code, guard.message);
  const response = redirect('/login', requestOrigin(request, process.env)!);
  response.cookies.set(SESSION_COOKIE, '', { ...cookieOptions, maxAge: 0 });
  response.cookies.set(TRANSACTION_COOKIE, '', { ...cookieOptions, maxAge: 0 });
  return response;
}
