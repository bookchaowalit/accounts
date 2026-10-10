'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { formToBody } from '@/lib/form';
import { resourceDef } from '@/lib/schema';
import { requireSession } from '@/lib/session';

export interface ActionState { error?: string; saved?: number }

function explain(error: unknown): string {
  if (error instanceof ApiError) {
    const detail = (error.detail as { detail?: { error?: string; fields?: string[] } })?.detail;
    if (error.status === 409) return `ซ้ำหรือถูกอ้างอิงอยู่ (${detail?.error ?? 'conflict'})`;
    if (error.status === 422) return `ข้อมูลไม่ถูกต้อง: ${(detail?.fields ?? []).join(', ') || detail?.error || 'invalid'}`;
    if (error.status === 403) return 'ไม่มีสิทธิ์';
    if (error.status === 503) return 'ระบบปลายทางยังไม่พร้อม ลองอีกครั้ง';
    return `accounts-api ตอบ ${error.status}`;
  }
  const code = error instanceof Error ? error.message : 'unknown';
  if (code === 'invalid_address') return 'รูปแบบอีเมลไม่ถูกต้อง';
  if (code.startsWith('invalid_')) return `ค่าไม่ถูกต้อง: ${code.replace(/^invalid_/, '')}`;
  if (code.endsWith('_required')) return `ต้องกรอก ${code.replace(/_required$/, '')}`;
  return 'บันทึกไม่สำเร็จ';
}

export async function createRecord(resource: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  const session = await requireSession();
  const def = resourceDef(resource);
  if (!def) return { error: 'ไม่รู้จักประเภทข้อมูล' };
  try {
    const body = formToBody(def, form, session.tenant, process.env);
    await api('POST', `/v1/${def.name}`, body, { 'Idempotency-Key': randomUUID() });
  } catch (error) { return { error: explain(error) }; }
  revalidatePath(`/${def.name}`);
  revalidatePath('/');
  return { saved: Date.now() };
}

export async function updateRecord(resource: string, id: number, version: number, _prev: ActionState,
  form: FormData): Promise<ActionState> {
  const session = await requireSession();
  const def = resourceDef(resource);
  if (!def || !Number.isSafeInteger(id)) return { error: 'ไม่รู้จักรายการ' };
  try {
    const body = formToBody(def, form, session.tenant, process.env, true);
    await api('PATCH', `/v1/${def.name}/${id}`, { ...body, expected_version: version });
  } catch (error) { return { error: explain(error) }; }
  revalidatePath(`/${def.name}`);
  redirect(`/${def.name}`);
}

export async function deleteRecord(resource: string, id: number): Promise<void> {
  await requireSession();
  const def = resourceDef(resource);
  if (!def || !Number.isSafeInteger(id)) return;
  try { await api('DELETE', `/v1/${def.name}/${id}`); } catch (error) {
    redirect(`/${def.name}/${id}?error=${encodeURIComponent(explain(error))}`);
  }
  revalidatePath(`/${def.name}`);
  redirect(`/${def.name}`);
}
