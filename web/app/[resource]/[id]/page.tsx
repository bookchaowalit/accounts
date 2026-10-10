import Link from 'next/link';
import { notFound } from 'next/navigation';
import { deleteRecord, updateRecord } from '@/app/actions';
import { RecordForm } from '@/components/RecordForm';
import { formValues, loadAll, refOptions } from '@/lib/records';
import { resourceDef } from '@/lib/schema';
import { requireSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function ResourceEdit({ params, searchParams }: {
  params: Promise<{ resource: string; id: string }>; searchParams: Promise<{ error?: string }>;
}) {
  const session = await requireSession();
  const { resource, id } = await params;
  const def = resourceDef(resource);
  const recordId = Number.parseInt(id, 10);
  if (!def || !Number.isSafeInteger(recordId)) notFound();
  const { rows, lookup } = await loadAll(session.tenant);
  const row = rows[def.name].find((r) => r.id === recordId);
  if (!row) notFound();
  const options = refOptions(def.fields, lookup);
  // A record must not point at itself (recovery, forwarding, admin).
  for (const field of def.fields) {
    if (field.kind === 'ref' && field.to === def.name) options[field.name] = options[field.name].filter((o) => o.value !== row.id);
  }
  const error = (await searchParams).error;
  return (
    <>
      <p><Link href={`/${def.name}`}>← {def.title}</Link></p>
      <h1>แก้ไข{def.singular} <span className="muted">#{row.id}</span></h1>
      <RecordForm fields={def.fields} action={updateRecord.bind(null, def.name, row.id, row.version)} options={options}
        initial={formValues(def, row)} submitLabel="บันทึก" />
      <h2>ลบ</h2>
      <form action={deleteRecord.bind(null, def.name, row.id)} className="form-actions">
        <button className="danger" type="submit">ลบ{def.singular}นี้</button>
        {error && <p className="error" role="alert">{error}</p>}
      </form>
    </>
  );
}
