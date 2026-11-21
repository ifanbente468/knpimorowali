import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Galeri",
  description: "Dokumentasi kegiatan pemuda dan organisasi kepemudaan Kabupaten Morowali.",
};

export default async function GaleriPage({
  searchParams,
}: {
  searchParams: Promise<{ album?: string }>;
}) {
  const params = await searchParams;
  const album = (params.album ?? "").trim().slice(0, 80);

  const [albums, items] = await Promise.all([
    prisma.galleryItem.groupBy({ by: ["album"], _count: { _all: true }, orderBy: { album: "asc" } }),
    prisma.galleryItem.findMany({
      where: album ? { album } : {},
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 120,
    }),
  ]);

  return (
    <>
      <section className="border-b border-line bg-canvas py-12">
        <div className="container-page">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Dokumentasi</div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">Galeri kegiatan</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Momen kaderisasi, aksi sosial, dan kolaborasi pemuda Morowali.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/galeri"
              className={`rounded-full px-4 py-2 text-xs font-bold ${
                album ? "border border-field bg-white text-navy" : "bg-brand-600 text-white"
              }`}
            >
              Semua
            </Link>
            {albums.map((item) => (
              <Link
                key={item.album}
                href={`/galeri?album=${encodeURIComponent(item.album)}`}
                className={`rounded-full px-4 py-2 text-xs font-bold ${
                  album === item.album ? "bg-brand-600 text-white" : "border border-field bg-white text-navy"
                }`}
              >
                {item.album} ({item._count._all})
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="container-page py-12">
        {items.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <figure key={item.id} className="surface group overflow-hidden">
                <div className="relative aspect-[4/3] bg-canvas">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <figcaption className="p-4">
                  <div className="text-sm font-bold text-navy">{item.title}</div>
                  {item.caption ? <p className="mt-1 line-clamp-2 text-xs text-muted">{item.caption}</p> : null}
                  <div className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-brand-600">
                    {item.album}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <EmptyState title="Belum ada foto" description="Dokumentasi kegiatan akan tampil di sini." />
        )}
      </div>
    </>
  );
}
