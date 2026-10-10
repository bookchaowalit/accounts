import 'server-only';
import { listAll } from './api';
import { decryptAddress } from './crypto';
import { RESOURCES, type FieldDef, type ResourceDef, type ResourceName } from './schema';

export type Row = Record<string, any> & { id: number; version: number };
export type Lookup = Record<ResourceName, Map<number, string>>;

/** Everything in the workspace (small inventories), with readable labels for references. */
export async function loadAll(tenant: string) {
  const [identities, domains, mailboxes, accounts] = await Promise.all(
    (['identities', 'domains', 'mailboxes', 'accounts'] as const).map((name) => listAll<Row>(name)));
  for (const row of mailboxes) row.address = decryptAddress(row.address_ciphertext, tenant, process.env) ?? row.address_hint;
  const lookup: Lookup = {
    identities: new Map(identities.map((r) => [r.id, r.slug])),
    domains: new Map(domains.map((r) => [r.id, r.name])),
    mailboxes: new Map(mailboxes.map((r) => [r.id, r.address])),
    accounts: new Map(accounts.map((r) => [r.id, `${r.platform}${r.handle ? ':' + r.handle : ''}`])),
  };
  return { rows: { identities, domains, mailboxes, accounts }, lookup };
}

export function display(field: FieldDef, row: Row, lookup: Lookup): string {
  const value = row[field.name];
  if (value === null || value === undefined || value === '') return '—';
  if (field.kind === 'ref') return lookup[field.to!].get(value) ?? `#${value}`;
  if (field.kind === 'bool') return value ? 'ใช่' : 'ไม่';
  return String(value);
}

export function listFields(def: ResourceDef): FieldDef[] {
  return def.fields.filter((f) => f.list);
}

export function refOptions(fields: FieldDef[], lookup: Lookup): Record<string, { value: number; label: string }[]> {
  return Object.fromEntries(fields.filter((f) => f.kind === 'ref').map((f) => [f.name,
    [...lookup[f.to!].entries()].map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label))]));
}

export { RESOURCES };
