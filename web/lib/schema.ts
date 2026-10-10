// What the forms and tables know about each resource of the accounts-api (mirrors cell.yaml).
// `address` on mailboxes is a virtual field: the server turns it into ciphertext, hash and hint.

export type FieldKind = 'text' | 'textarea' | 'enum' | 'ref' | 'bool' | 'int' | 'date' | 'address';
export interface FieldDef {
  name: string; label: string; kind: FieldKind; required?: boolean; values?: readonly string[];
  to?: ResourceName; list?: boolean; help?: string;
}
export type ResourceName = 'identities' | 'domains' | 'mailboxes' | 'accounts';
export interface ResourceDef { name: ResourceName; title: string; singular: string; fields: FieldDef[] }

const MFA = ['passkey', 'security-key', 'totp', 'sms', 'none', 'unknown'] as const;

export const RESOURCES: Record<ResourceName, ResourceDef> = {
  identities: {
    name: 'identities', title: 'ตัวตน', singular: 'ตัวตน',
    fields: [
      { name: 'slug', label: 'Slug', kind: 'text', required: true, list: true },
      { name: 'display_name', label: 'ชื่อที่แสดง', kind: 'text', required: true, list: true },
      { name: 'trust_zone', label: 'Trust zone', kind: 'enum', required: true, list: true,
        values: ['z0-root', 'z1-public', 'z2-business', 'z2-separated'],
        help: 'Z3 (persona แยกเข้มงวด) ไม่รับในระบบนี้ ให้เก็บใน vault ของ persona นั้นเท่านั้น' },
      { name: 'isolation_group', label: 'กลุ่มการแยก', kind: 'text', list: true },
      { name: 'relation', label: 'ความสัมพันธ์', kind: 'enum', values: ['self', 'family', 'work', 'client'], list: true },
      { name: 'status', label: 'สถานะ', kind: 'enum', values: ['planned', 'active', 'paused', 'retired'], list: true },
      { name: 'notes', label: 'โน้ต', kind: 'textarea' },
    ],
  },
  domains: {
    name: 'domains', title: 'โดเมน', singular: 'โดเมน',
    fields: [
      { name: 'name', label: 'โดเมน', kind: 'text', required: true, list: true },
      { name: 'identity_id', label: 'ตัวตน', kind: 'ref', to: 'identities', list: true },
      { name: 'registrar', label: 'Registrar', kind: 'text', list: true },
      { name: 'dns_provider', label: 'DNS', kind: 'text' },
      { name: 'mail_provider', label: 'ผู้ให้บริการเมล', kind: 'text', list: true },
      { name: 'auto_renew', label: 'ต่ออายุอัตโนมัติ', kind: 'bool', list: true },
      { name: 'renews_on', label: 'วันต่ออายุ', kind: 'date', list: true },
      { name: 'status', label: 'สถานะ', kind: 'enum', values: ['active', 'parked', 'releasing', 'released'], list: true },
      { name: 'notes', label: 'โน้ต', kind: 'textarea' },
    ],
  },
  mailboxes: {
    name: 'mailboxes', title: 'อีเมล', singular: 'อีเมล',
    fields: [
      { name: 'address', label: 'ที่อยู่อีเมล', kind: 'address', required: true, list: true,
        help: 'เข้ารหัสก่อนส่งไปเก็บ ฐานข้อมูลไม่เห็นที่อยู่จริง' },
      { name: 'identity_id', label: 'ตัวตน', kind: 'ref', to: 'identities', required: true, list: true },
      { name: 'provider', label: 'ผู้ให้บริการ', kind: 'text', required: true, list: true },
      { name: 'kind', label: 'ชนิด', kind: 'enum', values: ['mailbox', 'alias', 'forward'], list: true },
      { name: 'domain_id', label: 'โดเมน', kind: 'ref', to: 'domains' },
      { name: 'forwards_to_id', label: 'ส่งต่อไปที่', kind: 'ref', to: 'mailboxes' },
      { name: 'recovery_mailbox_id', label: 'อีเมลกู้คืน', kind: 'ref', to: 'mailboxes', list: true },
      { name: 'mfa_method', label: 'MFA', kind: 'enum', values: MFA, list: true },
      { name: 'security_keys', label: 'Security keys', kind: 'int', list: true },
      { name: 'recovery_phone', label: 'มีเบอร์กู้คืน', kind: 'bool' },
      { name: 'status', label: 'สถานะ', kind: 'enum', values: ['active', 'unverified', 'dormant', 'to-delete', 'deleted'], list: true },
      { name: 'last_reviewed_on', label: 'ตรวจล่าสุด', kind: 'date' },
      { name: 'notes', label: 'โน้ต', kind: 'textarea' },
    ],
  },
  accounts: {
    name: 'accounts', title: 'บัญชี', singular: 'บัญชี',
    fields: [
      { name: 'platform', label: 'แพลตฟอร์ม', kind: 'text', required: true, list: true },
      { name: 'handle', label: 'Handle', kind: 'text', list: true },
      { name: 'identity_id', label: 'ตัวตน', kind: 'ref', to: 'identities', required: true, list: true },
      { name: 'kind', label: 'ชนิด', kind: 'enum', values: ['profile', 'page', 'channel', 'organization', 'business', 'service'], list: true },
      { name: 'public_url', label: 'URL สาธารณะ', kind: 'text' },
      { name: 'login_mailbox_id', label: 'เมลที่ใช้ล็อกอิน', kind: 'ref', to: 'mailboxes', list: true },
      { name: 'admin_account_id', label: 'ดูแลโดยบัญชี', kind: 'ref', to: 'accounts' },
      { name: 'social_login', label: 'Social login', kind: 'enum', values: ['none', 'google', 'apple', 'facebook', 'other'] },
      { name: 'mfa_primary', label: 'MFA หลัก', kind: 'enum', values: MFA, list: true },
      { name: 'mfa_backup', label: 'MFA สำรอง', kind: 'enum', values: [...MFA.slice(0, 4), 'offline-codes', 'none', 'unknown'] },
      { name: 'phone_bound', label: 'ผูกเบอร์โทร', kind: 'bool' },
      { name: 'vault_ref', label: 'Vault ref', kind: 'text', help: 'ชื่อรายการใน password manager ห้ามใส่รหัสผ่าน' },
      { name: 'environment', label: 'Browser profile / VM', kind: 'text' },
      { name: 'status', label: 'สถานะ', kind: 'enum', values: ['planned', 'setup', 'active', 'paused', 'retired'], list: true },
      { name: 'last_verified_on', label: 'ยืนยันล่าสุด', kind: 'date' },
      { name: 'notes', label: 'โน้ต', kind: 'textarea' },
    ],
  },
};

export function resourceDef(name: string): ResourceDef | null {
  return Object.hasOwn(RESOURCES, name) ? RESOURCES[name as ResourceName] : null;
}
