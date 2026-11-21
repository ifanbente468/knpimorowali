import Link from "next/link";
import { prisma } from "@/lib/db";
import { AdminNotice } from "@/components/admin-notice";
import { Badge, EmptyState, PageHeader } from "@/components/ui";
import { ASPIRATION_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUSES = ["NEW", "IN_PROGRESS", "RESOLVED", "REJECTED"] as const;

export default async function AdminAspirationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; notice?: string; error?: string }>;
}) {
  const params = await searchParams;
  const status = STATUSES.find((item) => item === params.status);

  const [items, counts] = await Promise.all([
    prisma.aspiration.findMany({
      where: status ? { status } : {},
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 100,
    }),
    prisma.aspiration.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countFor = (value: string) => counts.find((item) => item.status === value)?._count._all ?? 0;

  return (
    <>
      <PageHeader title="Aspirasi" description="Tinjau dan tanggapi aspirasi pemuda Morowali." />
      <AdminNotice notice={params.notice} error={params.error} />

      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/admin/aspirasi" className={`rounded-full px-4 py-2 text-xs font-bold ${!status ? "bg-brand-600 text-white" : "border border-field bg-white text-navy"}`}>
          Semua
        </Link>
        {STATUSES.map((item) => (
          <Link
            key={item}
            href={`/admin/aspirasi?status=${item}`}
            className={`rounded-full px-4 py-2 text-xs font-bold ${status === item ? "bg-brand-600 text-white" : "border border-field bg-white text-navy"}`}
          >
            {ASPIRATION_STATUS_LABELS[item]} ({countFor(item)})
          </Link>
        ))}
      </div>

      {items.length ? (
        <div className="table-wrap">
          <table className="table-base">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Subjek</th>
                <th>Pengirim</th>
                <th>Kategori</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((aspiration) => (
                <tr key={aspiration.id}>
                  <td className="whitespace-nowrap font-mono text-xs text-muted">{aspiration.trackingCode}</td>
                  <td>
                    <Link href={`/admin/aspirasi/${aspiration.id}`} className="font-semibold text-navy hover:text-brand-600">
                      {aspiration.subject}
                    </Link>
                  </td>
                  <td className="text-muted">{aspiration.name}</td>
                  <td className="text-muted">{aspiration.category}</td>
                  <td className="whitespace-nowrap text-muted">{formatDate(aspiration.createdAt)}</td>
                  <td>
                    <Badge
                      tone={
                        aspiration.status === "NEW"
                          ? "warning"
                          : aspiration.status === "RESOLVED"
                            ? "success"
                            : aspiration.status === "REJECTED"
                              ? "danger"
                              : "brand"
                      }
                    >
                      {ASPIRATION_STATUS_LABELS[aspiration.status]}
                    </Badge>
                  </td>
                  <td>
                    <Link href={`/admin/aspirasi/${aspiration.id}`} className="btn-outline min-h-9 px-3 text-xs">Tanggapi</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="Tidak ada aspirasi" description="Belum ada aspirasi pada filter ini." />
      )}
    </>
  );
}
