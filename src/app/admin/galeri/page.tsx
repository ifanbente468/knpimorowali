import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { createGalleryAction, deleteGalleryAction } from "@/actions/content";
import { AdminNotice } from "@/components/admin-notice";
import { GalleryForm } from "@/components/admin/gallery-form";
import { EmptyState, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const params = await searchParams;
  const items = await prisma.galleryItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: 200,
  });

  return (
    <>
      <PageHeader title="Galeri" description="Dokumentasi kegiatan dalam bentuk foto." />
      <AdminNotice notice={params.notice} error={params.error} />

      <details className="surface mb-6 p-5">
        <summary className="cursor-pointer text-sm font-bold text-brand-600">
          <PlusCircle className="mr-1 inline h-4 w-4" aria-hidden />
          Tambah foto baru
        </summary>
        <div className="mt-5 border-t border-line pt-5">
          <GalleryForm action={createGalleryAction} submitLabel="Tambah foto" />
        </div>
      </details>

      {items.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <figure key={item.id} className="surface overflow-hidden">
              <div className="relative aspect-[4/3] bg-canvas">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
              </div>
              <figcaption className="p-4">
                <div className="line-clamp-1 text-sm font-bold text-navy">{item.title}</div>
                <div className="mt-0.5 text-xs text-muted">{item.album} · urutan {item.sortOrder}</div>
                <div className="mt-3 flex gap-2">
                  <Link href={`/admin/galeri/${item.id}`} className="btn-outline min-h-9 px-3 text-xs">Edit</Link>
                  <form action={deleteGalleryAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <button type="submit" className="btn-ghost min-h-9 px-3 text-xs text-danger hover:bg-red-50">Hapus</button>
                  </form>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <EmptyState title="Belum ada foto" description="Tambahkan dokumentasi kegiatan pertama." />
      )}
    </>
  );
}
