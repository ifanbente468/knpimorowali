import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { updateGalleryAction } from "@/actions/content";
import { GalleryForm } from "@/components/admin/gallery-form";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function EditGalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.galleryItem.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div className="max-w-2xl">
      <Link href="/admin/galeri" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Galeri
      </Link>
      <PageHeader title="Edit foto" description={item.title} />
      <div className="surface p-6">
        <GalleryForm
          action={updateGalleryAction}
          submitLabel="Simpan perubahan"
          item={{
            id: item.id,
            title: item.title,
            album: item.album,
            imageUrl: item.imageUrl,
            caption: item.caption,
            sortOrder: item.sortOrder,
          }}
        />
      </div>
    </div>
  );
}
