import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createRecord } from '@/app/actions';
import { RecordForm } from '@/components/RecordForm';
import { display, listFields, loadAll, refOptions } from '@/lib/records';
import { resourceDef } from '@/lib/schema';
import { requireSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function ResourceList({ params }: { params: Promise<{ resource: string }> }) {
  const session = await requireSession();
  const def = resourceDef((await params).resource);
  if (!def) notFound();
  const { rows, lookup } = await loadAll(session.tenant);
  const columns = listFields(def);
  const items = rows[def.name];
  return (
    <>
      <h1>{def.title} <span className="muted">({items.length})</span></h1>
      <div className="table-wrap">
        <table>
          <thead><tr>{columns.map((f) => <th key={f.name}>{f.label}</th>)}<th /></tr></thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id}>
                {columns.map((f) => <td key={f.name}>{display(f, row, lookup)}</td>)}
                <td><Link href={`/${def.name}/${row.id}`}>แก้ไข</Link></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={columns.length + 1} className="muted">ยังไม่มีข้อมูล</td></tr>}
          </tbody>
        </table>
      </div>
      <h2>เพิ่ม{def.singular}</h2>
      <RecordForm fields={def.fields} action={createRecord.bind(null, def.name)} options={refOptions(def.fields, lookup)}
        submitLabel="เพิ่ม" resetOnSuccess />
    </>
  );
}
