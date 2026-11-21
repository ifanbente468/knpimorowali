import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { ImageUpload } from "@/components/image-upload";
import type { ActionState } from "@/lib/form";

export function GalleryForm({
  action,
  item,
  submitLabel,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  item?: {
    id: string;
    title: string;
    album: string;
    imageUrl: string;
    caption: string | null;
    sortOrder: number;
  };
  submitLabel: string;
}) {
  return (
    <ActionForm action={action} submitLabel={submitLabel}>
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <div>
        <label htmlFor="title" className="label">Judul foto</label>
        <input id="title" name="title" className="input" defaultValue={item?.title} required maxLength={140} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="album" className="label">Album</label>
          <input id="album" name="album" className="input" defaultValue={item?.album ?? "Kegiatan"} required maxLength={80} />
        </div>
        <div>
          <label htmlFor="sortOrder" className="label">Urutan</label>
          <input id="sortOrder" name="sortOrder" type="number" min={0} max={9999} className="input" defaultValue={item?.sortOrder ?? 0} />
        </div>
      </div>
      <ImageUpload name="imageUrl" initialValue={item?.imageUrl} label="Foto" />
      <div>
        <label htmlFor="caption" className="label">Keterangan (opsional)</label>
        <textarea id="caption" name="caption" className="textarea min-h-20" defaultValue={item?.caption ?? ""} maxLength={300} />
      </div>
      <div className="flex gap-2 border-t border-line pt-4">
        <Link href="/admin/galeri" className="btn-outline">Batal</Link>
      </div>
    </ActionForm>
  );
}
