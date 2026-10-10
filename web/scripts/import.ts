// Import an inventory JSON into the accounts-api, encrypting every email address on the way.
//
//   node --env-file=<web.env> scripts/import.ts <inventory.json> [--dry-run]
//
// Needs ACCOUNTS_API_URL, ACCOUNTS_API_TOKEN and ACCOUNTS_WEB_FIELD_KEY in the environment. The inventory
// holds real addresses, so it lives outside the repository (owner-only file). Records are matched by
// their natural key (identity slug, domain name, mailbox address hash, account platform+handle) and
// created only when missing, so a re-run is safe. References use those keys:
//   identity: "<slug>", domain: "<name>", mailbox: "<address>", account admin: "<platform>:<handle>".

import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { addressHint, encryptAddress, hashAddress } from '../lib/crypto.ts';

type Rec = Record<string, any>;
const [file, flag] = process.argv.slice(2);
const dryRun = flag === '--dry-run';
const env = process.env;
const tenant = env.ACCOUNTS_TENANT ?? 'owner';
const base = new URL(env.ACCOUNTS_API_URL ?? '').origin;
if (!file || !env.ACCOUNTS_API_TOKEN) throw new Error('usage: import.ts <inventory.json> (needs ACCOUNTS_API_TOKEN)');
const inventory = JSON.parse(readFileSync(file, 'utf8')) as Record<string, Rec[]>;

async function call(method: string, path: string, body?: unknown) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { Authorization: `Bearer ${env.ACCOUNTS_API_TOKEN}`, 'X-Empire-Channel': 'cli', 'Content-Type': 'application/json',
      ...(method === 'POST' ? { 'Idempotency-Key': randomUUID() } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`${method} ${path} -> ${response.status} ${JSON.stringify(data?.detail ?? data)}`);
  return data;
}

async function all(plural: string): Promise<Rec[]> {
  return (await call('GET', `/v1/${plural}?limit=1000`)).items;
}

const ids = { identity: new Map<string, number>(), domain: new Map<string, number>(), mailbox: new Map<string, number>(),
  account: new Map<string, number>() };
for (const r of await all('identities')) ids.identity.set(r.slug, r.id);
for (const r of await all('domains')) ids.domain.set(r.name, r.id);
for (const r of await all('mailboxes')) ids.mailbox.set(r.address_hash, r.id);
for (const r of await all('accounts')) ids.account.set(`${r.platform}:${r.handle ?? ''}`, r.id);

function ref(kind: keyof typeof ids, key: string | undefined | null): number | null {
  if (!key) return null;
  const lookup = kind === 'mailbox' ? hashAddress(key, tenant, env) : key;
  const id = ids[kind].get(lookup);
  if (id === undefined && !dryRun) throw new Error(`unknown ${kind} ${kind === 'mailbox' ? addressHint(key) : key}`);
  return id ?? -1;
}

let created = 0;
async function ensure(kind: keyof typeof ids, plural: string, key: string, body: Rec, label: string) {
  if (ids[kind].has(key)) return;
  if (!dryRun) ids[kind].set(key, (await call('POST', `/v1/${plural}`, body)).id);
  else ids[kind].set(key, -1);
  created += 1;
  console.log(`${dryRun ? 'would create' : 'created'} ${kind} ${label}`);
}

for (const r of inventory.identities ?? []) await ensure('identity', 'identities', r.slug, r, r.slug);
for (const r of inventory.domains ?? []) {
  await ensure('domain', 'domains', r.name, { ...r, identity: undefined, identity_id: ref('identity', r.identity) }, r.name);
}
// Mailboxes in two passes: create without mailbox references, then set recovery and forwarding.
const mailboxes = inventory.mailboxes ?? [];
for (const r of mailboxes) {
  const { address, identity, domain, recovery, forwards_to, ...rest } = r;
  await ensure('mailbox', 'mailboxes', hashAddress(address, tenant, env), {
    ...rest, identity_id: ref('identity', identity), domain_id: ref('domain', domain),
    address_ciphertext: encryptAddress(address, tenant, env), address_hash: hashAddress(address, tenant, env),
    address_hint: addressHint(address),
  }, addressHint(address));
}
if (!dryRun) {
  const current = new Map((await all('mailboxes')).map((r) => [r.id, r]));
  for (const r of mailboxes) {
    const id = ref('mailbox', r.address)!;
    const row = current.get(id)!;
    const want = { recovery_mailbox_id: ref('mailbox', r.recovery), forwards_to_id: ref('mailbox', r.forwards_to) };
    if (row.recovery_mailbox_id !== want.recovery_mailbox_id || row.forwards_to_id !== want.forwards_to_id) {
      await call('PATCH', `/v1/mailboxes/${id}`, { ...want, expected_version: row.version });
      console.log(`linked mailbox ${addressHint(r.address)}`);
    }
  }
}
for (const r of inventory.accounts ?? []) {
  const { identity, login, admin, ...rest } = r;
  await ensure('account', 'accounts', `${r.platform}:${r.handle ?? ''}`, {
    ...rest, identity_id: ref('identity', identity), login_mailbox_id: ref('mailbox', login),
    admin_account_id: ref('account', admin),
  }, `${r.platform}:${r.handle ?? ''}`);
}
console.log(`${dryRun ? 'would create' : 'created'} ${created} record(s)`);
