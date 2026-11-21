import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { deleteAgendaAction } from "@/actions/content";
import { AdminNotice } from "@/components/admin-notice";
import { Badge, EmptyState, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminAgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const params = await searchParams;
  const agendas = await prisma.agenda.findMany({ orderBy: { startsAt: "desc" }, take: 100 });

  return (
    <>
      <PageHeader
        title="Agenda"
        description="Jadwal kegiatan DPD KNPI Kabupaten Morowali."
        action={
          <Link href="/admin/agenda/baru" className="btn-primary">
            <PlusCircle className="h-4 w-4" aria-hidden />
            Tambah agenda
          </Link>
        }
      />
      <AdminNotice notice={params.notice} error={params.error} />

      {agendas.length ? (
        <div className="table-wrap">
          <table className="table-base">
            <thead>
              <tr>
                <th>Kegiatan</th>
                <th>Waktu</th>
                <th>Lokasi</th>
                <th>Status</th>
                <th>Publikasi</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {agendas.map((agenda) => (
                <tr key={agenda.id}>
                  <td className="font-semibold text-navy">{agenda.title}</td>
                  <td className="whitespace-nowrap text-muted">{formatDateTime(agenda.startsAt)}</td>
                  <td className="text-muted">{agenda.location}</td>
                  <td>
                    <Badge tone={agenda.status === "CANCELLED" ? "danger" : agenda.status === "COMPLETED" ? "neutral" : "success"}>
                      {agenda.status === "CANCELLED" ? "Dibatalkan" : agenda.status === "COMPLETED" ? "Selesai" : "Terjadwal"}
                    </Badge>
                  </td>
                  <td>
                    <Badge tone={agenda.isPublished ? "brand" : "warning"}>
                      {agenda.isPublished ? "Tampil" : "Disembunyikan"}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Link href={`/admin/agenda/${agenda.id}`} className="btn-outline min-h-9 px-3 text-xs">Edit</Link>
                      <form action={deleteAgendaAction}>
                        <input type="hidden" name="id" value={agenda.id} />
                        <button type="submit" className="btn-ghost min-h-9 px-3 text-xs text-danger hover:bg-red-50">Hapus</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="Belum ada agenda" action={<Link href="/admin/agenda/baru" className="btn-primary">Tambah agenda</Link>} />
      )}
    </>
  );
}
