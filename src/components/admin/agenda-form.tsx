import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import type { ActionState } from "@/lib/form";
import { toDateTimeInput } from "@/lib/utils";

export function AgendaForm({
  action,
  agenda,
  submitLabel,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  agenda?: {
    id: string;
    title: string;
    description: string;
    location: string;
    startsAt: Date;
    endsAt: Date | null;
    capacity: number | null;
    status: string;
    isPublished: boolean;
  };
  submitLabel: string;
}) {
  return (
    <ActionForm action={action} submitLabel={submitLabel} className="surface p-6">
      {agenda ? <input type="hidden" name="id" value={agenda.id} /> : null}
      <div>
        <label htmlFor="title" className="label">Nama kegiatan</label>
        <input id="title" name="title" className="input" defaultValue={agenda?.title} required maxLength={160} />
      </div>
      <div>
        <label htmlFor="description" className="label">Deskripsi (Markdown)</label>
        <textarea id="description" name="description" className="textarea min-h-40" defaultValue={agenda?.description} required maxLength={5000} />
      </div>
      <div>
        <label htmlFor="location" className="label">Lokasi</label>
        <input id="location" name="location" className="input" defaultValue={agenda?.location} required maxLength={200} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="startsAt" className="label">Mulai</label>
          <input id="startsAt" name="startsAt" type="datetime-local" className="input" defaultValue={toDateTimeInput(agenda?.startsAt)} required />
        </div>
        <div>
          <label htmlFor="endsAt" className="label">Selesai (opsional)</label>
          <input id="endsAt" name="endsAt" type="datetime-local" className="input" defaultValue={toDateTimeInput(agenda?.endsAt)} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="capacity" className="label">Kapasitas peserta (opsional)</label>
          <input id="capacity" name="capacity" type="number" min={1} className="input" defaultValue={agenda?.capacity ?? ""} />
        </div>
        <div>
          <label htmlFor="status" className="label">Status</label>
          <select id="status" name="status" className="select" defaultValue={agenda?.status ?? "SCHEDULED"}>
            <option value="SCHEDULED">Terjadwal</option>
            <option value="COMPLETED">Selesai</option>
            <option value="CANCELLED">Dibatalkan</option>
          </select>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold text-navy">
        <input type="checkbox" name="isPublished" defaultChecked={agenda?.isPublished ?? true} className="h-4 w-4 rounded border-field" />
        Tampilkan di situs publik
      </label>
      <div className="flex gap-2 border-t border-line pt-4">
        <Link href="/admin/agenda" className="btn-outline">Batal</Link>
      </div>
    </ActionForm>
  );
}
