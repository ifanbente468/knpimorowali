import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Badge, EmptyState, Pagination, SectionTitle } from "@/components/ui";
import { NEWS_CATEGORIES } from "@/lib/constants";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Berita",
  description: "Berita, kegiatan, pernyataan, dan prestasi pemuda Kabupaten Morowali.",
};

const PAGE_SIZE = 9;

export default async function BeritaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kategori?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = (params.q ?? "").trim().slice(0, 100);
  const category = NEWS_CATEGORIES.find((item) => item === params.kategori);
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const where = {
    status: "PUBLISHED" as const,
    publishedAt: { not: null },
    ...(category ? { category } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query } },
            { excerpt: { contains: query } },
            { content: { contains: query } },
          ],
        }
      : {}),
  };

  const [total, items] = await Promise.all([
    prisma.news.count({ where }),
    prisma.news.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        category: true,
        coverImage: true,
        publishedAt: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (nextPage: number) => {
    const search = new URLSearchParams();
    if (query) search.set("q", query);
    if (category) search.set("kategori", category);
    if (nextPage > 1) search.set("page", String(nextPage));
    const suffix = search.toString();
    return suffix ? `/berita?${suffix}` : "/berita";
  };

  return (
    <>
      <section className="border-b border-line bg-canvas py-12">
        <div className="container-page">
          <SectionTitle
            eyebrow="Informasi"
            title="Berita & kegiatan"
            description="Kabar resmi DPD KNPI Kabupaten Morowali dan organisasi mitra."
          />
          <form method="get" className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Cari berita…"
                aria-label="Cari berita"
                className="input pl-10"
              />
            </div>
            <select name="kategori" defaultValue={category ?? ""} aria-label="Kategori berita" className="select sm:w-56">
              <option value="">Semua kategori</option>
              {NEWS_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <button type="submit" className="btn-primary sm:w-32">
              Cari
            </button>
          </form>
        </div>
      </section>

      <div className="container-page py-12">
        {items.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <article key={item.id} className="surface group flex flex-col overflow-hidden">
                <Link href={`/berita/${item.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-canvas">
                  <Image
                    src={item.coverImage ?? "/images/hero.jpg"}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge tone="brand">{item.category}</Badge>
                    <span className="text-xs text-muted">
                      {item.publishedAt ? formatDate(item.publishedAt) : ""}
                    </span>
                  </div>
                  <h2 className="mt-3 line-clamp-2 text-lg font-extrabold leading-snug text-navy">
                    <Link href={`/berita/${item.slug}`} className="hover:text-brand-600">
                      {item.title}
                    </Link>
                  </h2>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-muted">{item.excerpt}</p>
                  <Link
                    href={`/berita/${item.slug}`}
                    className="mt-4 text-sm font-bold text-brand-600 hover:underline"
                  >
                    Baca selengkapnya →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Berita tidak ditemukan"
            description="Coba gunakan kata kunci lain atau pilih kategori yang berbeda."
          />
        )}

        <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
      </div>
    </>
  );
}
