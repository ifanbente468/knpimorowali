import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { ImageUpload } from "@/components/image-upload";
import type { ActionState } from "@/lib/form";
import { NEWS_CATEGORIES } from "@/lib/constants";

export function NewsForm({
  action,
  news,
  submitLabel,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  news?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    coverImage: string | null;
    status: string;
  };
  submitLabel: string;
}) {
  return (
    <ActionForm action={action} submitLabel={submitLabel} className="surface p-6">
      {news ? <input type="hidden" name="id" value={news.id} /> : null}
      <div>
        <label htmlFor="title" className="label">Judul berita</label>
        <input id="title" name="title" className="input" defaultValue={news?.title} required maxLength={160} />
      </div>
      <div>
        <label htmlFor="slug" className="label">Slug (opsional)</label>
        <input id="slug" name="slug" className="input font-mono text-xs" defaultValue={news?.slug} maxLength={100} placeholder="dibuat otomatis dari judul" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="label">Kategori</label>
          <select id="category" name="category" className="select" defaultValue={news?.category ?? "KEGIATAN"}>
            {NEWS_CATEGORIES.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" className="label">Status</label>
          <select id="status" name="status" className="select" defaultValue={news?.status ?? "DRAFT"}>
            <option value="DRAFT">Draf</option>
            <option value="PUBLISHED">Terbit</option>
            <option value="ARCHIVED">Arsip</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="excerpt" className="label">Ringkasan</label>
        <textarea id="excerpt" name="excerpt" className="textarea min-h-20" defaultValue={news?.excerpt} required maxLength={300} />
      </div>
      <div>
        <label htmlFor="content" className="label">Isi berita (Markdown)</label>
        <textarea id="content" name="content" className="textarea min-h-72 font-mono text-xs" defaultValue={news?.content} required maxLength={20000} />
        <p className="mt-1 text-xs text-muted">Mendukung Markdown: **tebal**, *miring*, daftar, tautan, dan kutipan.</p>
      </div>
      <ImageUpload name="coverImage" initialValue={news?.coverImage} label="Gambar sampul" />
      <div className="flex flex-wrap gap-2 border-t border-line pt-4">
        <Link href="/admin/berita" className="btn-outline">Batal</Link>
        {news ? (
          <Link href={`/berita/${news.slug}`} target="_blank" className="btn-ghost text-xs">
            Lihat di situs ↗
          </Link>
        ) : null}
      </div>
    </ActionForm>
  );
}
