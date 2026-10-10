'use client';

import { useActionState, useEffect, useRef } from 'react';
import type { ActionState } from '@/app/actions';
import type { FieldDef } from '@/lib/schema';

export interface Option { value: number; label: string }

export function RecordForm({ fields, action, options, initial, submitLabel, resetOnSuccess = false }: {
  fields: FieldDef[];
  action: (prev: ActionState, form: FormData) => Promise<ActionState>;
  options: Record<string, Option[]>;
  initial?: Record<string, any>;
  submitLabel: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => { if (resetOnSuccess && state.saved) form.current?.reset(); }, [state.saved, resetOnSuccess]);
  return (
    <form action={formAction} className="record-form" ref={form}>
      {fields.map((f) => (
        <label key={f.name} className={f.kind === 'textarea' ? 'wide' : ''}>
          <span>{f.label}{f.required && f.kind !== 'address' ? ' *' : ''}{f.kind === 'address' && !initial ? ' *' : ''}</span>
          <Input field={f} options={options[f.name] ?? []} value={initial?.[f.name]} editing={!!initial} />
          {f.help && <small>{f.help}</small>}
        </label>
      ))}
      <div className="form-actions wide">
        <button type="submit" disabled={pending}>{pending ? 'กำลังบันทึก…' : submitLabel}</button>
        {state.error && <p className="error" role="alert">{state.error}</p>}
        {state.saved && !state.error && <p className="muted" role="status">บันทึกแล้ว</p>}
      </div>
    </form>
  );
}

function Input({ field, options, value, editing }: { field: FieldDef; options: Option[]; value: any; editing: boolean }) {
  const name = field.name;
  switch (field.kind) {
    case 'textarea':
      return <textarea name={name} defaultValue={value ?? ''} rows={3} maxLength={4000} />;
    case 'enum':
      return (
        <select name={name} defaultValue={value ?? ''} required={field.required}>
          {!field.required && <option value="">(ค่าเริ่มต้น)</option>}
          {field.values!.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      );
    case 'ref':
      return (
        <select name={name} defaultValue={value ?? ''} required={field.required}>
          <option value="">—</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    case 'bool':
      return <input type="checkbox" name={name} defaultChecked={!!value} />;
    case 'int':
      return <input type="number" name={name} min={0} max={20} defaultValue={value ?? 0} />;
    case 'date':
      return <input type="date" name={name} defaultValue={value ?? ''} />;
    case 'address':
      return <input type="email" name={name} autoComplete="off" required={!editing}
        placeholder={editing ? `${value ?? ''} (เว้นว่างถ้าไม่เปลี่ยน)` : 'name@example.com'} />;
    default:
      return <input type="text" name={name} defaultValue={value ?? ''} required={field.required} maxLength={1000} />;
  }
}
