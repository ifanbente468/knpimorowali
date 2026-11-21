import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/db";
import { Badge, EmptyState, PageHeader, Pagination } from "@/components/ui";
import { AdminNotice } from "@/components/admin-notice";
import { MEMBER_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;
const STATUSES = ["PENDING", "ACTIVE", "REJECTED", "SUSPENDED"] as const;
type MemberStatus = (typeof STATUSES)[number];

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string; notice?: string; error?: string }>;
}) {
  const params = await searchParams;
  const query = (params.q ?? "").trim().slice(0, 100);
  const status = STATUSES.find((item) => item === params.status);
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const where = {
    ...(status ? { status: status as MemberStatus } : {}),
    ...(query
      ? {
          OR: [
            { user: { name: { contains: query } } },
            { user: { email: { contains: query } } },
            { memberNo: { contains: query } },
            { nik: { contains: query } },
          ],
        }
      : {}),
  };

  const [total, items, counts] = await Promise.all([
    prisma.member.count({ where }),
    prisma.member.findMany({
      where,
      include: { user: { select: { name: true, email: true, phone: true } } },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.member.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countFor = (value: string) => counts.find((item) => item.status === value)?._count._all ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (nextPage: number) => {
    const search = new URLSearchParams();
    if (query) search.set("q", query);
    if (status) search.set("status", status);
    if (nextPage > 1) search.set("page", String(nextPage));
    const suffix = search.toString();
    return suffix ? `/admin/anggota?${suffix}` : "/admin/anggota";
  };

  return (
    <>
      <PageHeader
        title="Anggota"
        description="Verifikasi pendaftar dan kelola data keanggotaan."
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/anggota?status=PENDING" className="btn-outline">Menunggu ({countFor("PENDING")})</Link>
            <Link href="/admin/anggota" className="btn-outline">Semua</Link>
          </div>
        }
      />
      <AdminNotice notice={params.notice} error={params.error} />

      <div className="mb-4 grid gap-2 sm:grid-cols-4">
        {STATUSES.map((item) => (
          <Link
            key={item}
            href={`/admin/anggota?status=${item}`}
            className={`rounded-xl border px-4 py-3 text-sm ${
              status === item ? "border-brand-600 bg-brand-50" : "border-line bg-white hover:border-brand-200"
            }`}
          >
            <div className="text-xs text-muted">{MEMBER_STATUS_LABELS[item]}</div>
            <div className="mt-0.5 text-lg font-extrabold text-navy">{countFor(item)}</div>
          </Link>
        ))}
      </div>

      <form method="get" className="mb-4 flex flex-col gap-2 sm:flex-row">
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <input name="q" defaultValue={query} placeholder="Cari nama, email, NIK, atau nomor anggota…" className="input pl-10" aria-label="Cari anggota" />
        </div>
        <button type="submit" className="btn-primary sm:w-32">Cari</button>
      </form>

      {items.length ? (
        <div className="table-wrap">
          <table className="table-base">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Nomor anggota</th>
                <th>Wilayah</th>
                <th>Terdaftar</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div className="font-semibold text-navy">{member.user.name}</div>
                    <div className="text-xs text-muted">{member.user.email}</div>
                  </td>
                  <td className="font-mono text-xs text-muted">{member.memberNo ?? "—"}</td>
                  <td className="text-muted">{member.district}</td>
                  <td className="whitespace-nowrap text-muted">{formatDate(member.createdAt)}</td>
                  <td>
                    <Badge
                      tone={
                        member.status === "ACTIVE"
                          ? "success"
                          : member.status === "PENDING"
                            ? "warning"
                            : member.status === "REJECTED"
                              ? "danger"
                              : "neutral"
                      }
                    >
                      {MEMBER_STATUS_LABELS[member.status]}
                    </Badge>
                  </td>
                  <td>
                    <Link href={`/admin/anggota/${member.id}`} className="btn-outline min-h-9 px-3 text-xs">
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="Tidak ada data anggota" description="Ubah filter atau kata kunci pencarian." />
      )}

      <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
    </>
  );
}
