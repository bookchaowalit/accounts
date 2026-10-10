import { addressHint, encryptAddress, hashAddress } from './crypto';
import type { ResourceDef } from './schema';

type Env = Record<string, string | undefined>;

/**
 * A form submission as an accounts-api body. On an edit (`partial`) an empty address keeps the stored
 * one; every other empty optional field is cleared (null) so a form can unset values.
 */
export function formToBody(def: ResourceDef, form: FormData, tenant: string, env: Env, partial = false) {
  const body: Record<string, unknown> = {};
  for (const field of def.fields) {
    const raw = form.get(field.name);
    const text = typeof raw === 'string' ? raw.trim() : '';
    switch (field.kind) {
      case 'address':
        if (!text) {
          if (!partial) throw new Error('address_required');
          break;
        }
        body.address_ciphertext = encryptAddress(text, tenant, env);
        body.address_hash = hashAddress(text, tenant, env);
        body.address_hint = addressHint(text);
        break;
      case 'bool':
        body[field.name] = raw === 'on' || raw === 'true';
        break;
      case 'int':
        body[field.name] = text ? Number(text) : 0;
        if (!Number.isSafeInteger(body[field.name])) throw new Error(`invalid_${field.name}`);
        break;
      case 'ref':
        body[field.name] = text ? Number(text) : null;
        if (text && !Number.isSafeInteger(body[field.name])) throw new Error(`invalid_${field.name}`);
        if (!text && field.required) throw new Error(`${field.name}_required`);
        break;
      case 'enum':
        if (text) body[field.name] = text;
        else if (field.required) throw new Error(`${field.name}_required`);
        break;
      default:
        if (text) body[field.name] = text;
        else if (field.required) throw new Error(`${field.name}_required`);
        else body[field.name] = null;
    }
  }
  if (!partial) for (const [key, value] of Object.entries(body)) if (value === null) delete body[key];
  return body;
}
