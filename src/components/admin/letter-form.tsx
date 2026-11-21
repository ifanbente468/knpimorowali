import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import type { ActionState } from "@/lib/form";
import { toDateInput } from "@/lib/utils";

export function LetterForm({
  action,
  letter,
  submitLabel,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  letter?: {
    id: string;
    number: string;
    type: string;
    subject: string;
    sender: string;
    recipient: string;
    date: Date;
    fileUrl: string | null;
    status: string;
    notes: string | null;
  };
  submitLabel: string;
}) {
  return (
    <ActionForm action={action} submitLabel={submitLabel}>
      {letter ? <input type="hidden" name="id" value={letter.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="number" className="label">Nomor surat</label>
          <input id="number" name="number" className="input font-mono text-xs" defaultValue={letter?.number} required maxLength={120} />
        </div>
        <div>
          <label htmlFor="type" className="label">Jenis</label>
          <select id="type" name="type" className="select" defaultValue={letter?.type ?? "INCOMING"}>
            <option value="INCOMING">Surat masuk</option>
            <option value="OUTGOING">Surat keluar</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="subject" className="label">Perihal</label>
        <input id="subject" name="subject" className="input" defaultValue={letter?.subject} required maxLength={200} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="sender" className="label">Pengirim</label>
          <input id="sender" name="sender" className="input" defaultValue={letter?.sender} required maxLength={160} />
        </div>
        <div>
          <label htmlFor="recipient" className="label">Penerima</label>
          <input id="recipient" name="recipient" className="input" defaultValue={letter?.recipient} required maxLength={160} />
        </div>
        <div>
          <label htmlFor="date" className="label">Tanggal surat</label>
          <input id="date" name="date" type="date" className="input" defaultValue={toDateInput(letter?.date)} required />
        </div>
        <div>
          <label htmlFor="status" className="label">Status</label>
          <select id="status" name="status" className="select" defaultValue={letter?.status ?? "RECEIVED"}>
            <option value="RECEIVED">Diterima</option>
            <option value="PROCESSED">Diproses</option>
            <option value="ARCHIVED">Diarsipkan</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="fileUrl" className="label">Tautan berkas (opsional)</label>
        <input id="fileUrl" name="fileUrl" className="input" defaultValue={letter?.fileUrl ?? ""} maxLength={500} placeholder="https://…" />
      </div>
      <div>
        <label htmlFor="notes" className="label">Catatan (opsional)</label>
        <textarea id="notes" name="notes" className="textarea min-h-20" defaultValue={letter?.notes ?? ""} maxLength={1000} />
      </div>
      <div className="flex gap-2 border-t border-line pt-4">
        <Link href="/admin/persuratan" className="btn-outline">Batal</Link>
      </div>
    </ActionForm>
  );
}
