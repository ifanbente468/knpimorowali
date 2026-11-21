import Link from "next/link";
import { PlusCircle, Search } from "lucide-react";
import { prisma } from "@/lib/db";
import { deleteNewsAction } from "@/actions/content";
import { AdminNotice } from "@/components/admin-notice";
import { Badge, EmptyState, PageHeader, Pagination } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string; notice?: string; error?: string }>;
}) {
  const params = await searchParams;
  const query = (params.q ?? "").trim().slice(0, 100);
  const status = ["DRAFT", "PUBLISHED", "ARCHIVED"].find((item) => item === params.status);
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const where = {
    ...(status ? { status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED" } : {}),
    ...(query ? { OR: [{ title: { contains: query } }, { excerpt: { contains: query } }] } : {}),
  };

  const [total, items] = await Promise.all([
    prisma.news.count({ where }),
    prisma.news.findMany({
      where,
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const buildHref = (nextPage: number) => {
    const search = new URLSearchParams();
    if (query) search.set("q", query);
    if (status) search.set("status", status);
    if (nextPage > 1) search.set("page", String(nextPage));
    const suffix = search.toString();
    return suffix ? `/admin/berita?${suffix}` : "/admin/berita";
  };

  return (
    <>
      <PageHeader
        title="Berita"
        description="Kelola berita, pengumuman, dan pernyataan organisasi."
        action={
          <Link href="/admin/berita/baru" className="btn-primary">
            <PlusCircle className="h-4 w-4" aria-hidden />
            Tulis berita
          </Link>
        }
      />
      <AdminNotice notice={params.notice} error={params.error} />

      <form method="get" className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <input name="q" defaultValue={query} placeholder="Cari judul berita…" className="input pl-10" aria-label="Cari berita" />
        </div>
        <select name="status" defaultValue={status ?? ""} className="select sm:w-44" aria-label="Filter status">
          <option value="">Semua status</option>
          <option value="PUBLISHED">Terbit</option>
          <option value="DRAFT">Draf</option>
          <option value="ARCHIVED">Arsip</option>
        </select>
        <button type="submit" className="btn-primary sm:w-32">Cari</button>
      </form>

      {items.length ? (
        <div className="table-wrap">
          <table className="table-base">
            <thead>
              <tr>
                <th>Judul</th>
                <th>Kategori</th>
                <th>Status</th>
                <th>Tanggal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((news) => (
                <tr key={news.id}>
                  <td>
                    <Link href={`/admin/berita/${news.id}`} className="font-semibold text-navy hover:text-brand-600">
                      {news.title}
                    </Link>
                    <div className="text-xs text-muted">Oleh {news.author.name}</div>
                  </td>
                  <td className="text-muted">{news.category}</td>
                  <td>
                    <Badge tone={news.status === "PUBLISHED" ? "success" : news.status === "DRAFT" ? "warning" : "neutral"}>
                      {news.status === "PUBLISHED" ? "Terbit" : news.status === "DRAFT" ? "Draf" : "Arsip"}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap text-muted">
                    {formatDate(news.publishedAt ?? news.createdAt)}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/berita/${news.id}`} className="btn-outline min-h-9 px-3 text-xs">Edit</Link>
                      <form action={deleteNewsAction}>
                        <input type="hidden" name="id" value={news.id} />
                        <button type="submit" className="btn-ghost min-h-9 px-3 text-xs text-danger hover:bg-red-50">
                          Hapus
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="Belum ada berita" action={<Link href="/admin/berita/baru" className="btn-primary">Tulis berita pertama</Link>} />
      )}

      <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
    </>
  );
}
