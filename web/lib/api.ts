import 'server-only';

// Server-side client for the accounts-api. The bearer is the `accounts-web` automation token
// (delegated by the workspace owner, 30 days, read/write/delete on accounts.* only); it never
// reaches the browser.

type Env = Record<string, string | undefined>;
export class ApiError extends Error {
  constructor(public status: number, public detail: unknown) { super(`accounts-api ${status}`); }
}

function base(env: Env): string {
  const url = new URL(env.ACCOUNTS_API_URL ?? '');
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(url.hostname))) {
    throw new Error('api_url_not_secure');
  }
  return url.origin;
}

export async function api<T = any>(method: string, path: string, body?: unknown, extra: Record<string, string> = {},
  env: Env = process.env): Promise<T> {
  const token = env.ACCOUNTS_API_TOKEN;
  if (!token) throw new Error('api_token_not_configured');
  const response = await fetch(`${base(env)}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`, 'X-Empire-Channel': 'api', Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...extra,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
    signal: AbortSignal.timeout(20_000), // a sleeping Railway service needs a few seconds to wake
  });
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(response.status, data);
  return data as T;
}

export async function listAll<T = any>(plural: string, query = ''): Promise<T[]> {
  const out: T[] = [];
  let after = 0;
  for (;;) {
    const page = await api<{ items: T[] } | T[]>('GET', `/v1/${plural}?limit=1000&order=asc&after_id=${after}${query}`);
    const items = Array.isArray(page) ? page : page.items;
    out.push(...items);
    if (items.length < 1000) return out;
    after = (items[items.length - 1] as { id: number }).id;
  }
}
