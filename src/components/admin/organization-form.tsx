import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { ImageUpload } from "@/components/image-upload";
import type { ActionState } from "@/lib/form";

export function OrganizationForm({
  action,
  organization,
  submitLabel,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  organization?: {
    id: string;
    name: string;
    type: string;
    leader: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    logoUrl: string | null;
    description: string | null;
    sortOrder: number;
    isActive: boolean;
  };
  submitLabel: string;
}) {
  return (
    <ActionForm action={action} submitLabel={submitLabel}>
      {organization ? <input type="hidden" name="id" value={organization.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="label">Nama organisasi</label>
          <input id="name" name="name" className="input" defaultValue={organization?.name} required maxLength={140} />
        </div>
        <div>
          <label htmlFor="type" className="label">Tipe</label>
          <select id="type" name="type" className="select" defaultValue={organization?.type ?? "OKP"}>
            <option value="DPD">DPD</option>
            <option value="OKP">OKP</option>
            <option value="SAYAP">Sayap</option>
          </select>
        </div>
        <div>
          <label htmlFor="leader" className="label">Ketua</label>
          <input id="leader" name="leader" className="input" defaultValue={organization?.leader ?? ""} maxLength={140} />
        </div>
        <div>
          <label htmlFor="phone" className="label">Telepon</label>
          <input id="phone" name="phone" className="input" defaultValue={organization?.phone ?? ""} maxLength={20} />
        </div>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" name="email" type="email" className="input" defaultValue={organization?.email ?? ""} maxLength={160} />
        </div>
        <div>
          <label htmlFor="website" className="label">Website</label>
          <input id="website" name="website" className="input" defaultValue={organization?.website ?? ""} maxLength={500} />
        </div>
      </div>
      <div>
        <label htmlFor="address" className="label">Alamat</label>
        <input id="address" name="address" className="input" defaultValue={organization?.address ?? ""} maxLength={300} />
      </div>
      <div>
        <label htmlFor="description" className="label">Deskripsi</label>
        <textarea id="description" name="description" className="textarea min-h-20" defaultValue={organization?.description ?? ""} maxLength={1000} />
      </div>
      <ImageUpload name="logoUrl" initialValue={organization?.logoUrl} label="Logo (opsional)" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="sortOrder" className="label">Urutan</label>
          <input id="sortOrder" name="sortOrder" type="number" min={0} max={9999} className="input" defaultValue={organization?.sortOrder ?? 0} />
        </div>
        <label className="flex items-end gap-2 pb-3 text-sm font-semibold text-navy">
          <input type="checkbox" name="isActive" defaultChecked={organization?.isActive ?? true} className="h-4 w-4 rounded border-field" />
          Tampilkan di situs
        </label>
      </div>
      <div className="flex gap-2 border-t border-line pt-4">
        <Link href="/admin/organisasi" className="btn-outline">Batal</Link>
      </div>
    </ActionForm>
  );
}
