import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Badge, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Agenda",
  description: "Jadwal kegiatan DPD KNPI Kabupaten Morowali dan organisasi mitra.",
};

export default async function AgendaPage() {
  const now = new Date();
  const [upcoming, past] = await Promise.all([
    prisma.agenda.findMany({
      where: { isPublished: true, startsAt: { gte: now }, status: "SCHEDULED" },
      orderBy: { startsAt: "asc" },
    }),
    prisma.agenda.findMany({
      where: {
        isPublished: true,
        OR: [{ startsAt: { lt: now } }, { status: { in: ["COMPLETED", "CANCELLED"] } }],
      },
      orderBy: { startsAt: "desc" },
      take: 12,
    }),
  ]);

  return (
    <>
      <section className="border-b border-line bg-canvas py-12">
        <div className="container-page">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Jadwal</div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
            Agenda kegiatan
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Ikuti kegiatan kaderisasi, pelatihan, dan aksi sosial KNPI Morowali bersama OKP mitra.
          </p>
        </div>
      </section>

      <div className="container-page space-y-12 py-12">
        <section>
          <h2 className="mb-4 text-xl font-extrabold text-navy">Kegiatan mendatang</h2>
          {upcoming.length ? (
            <div className="space-y-3">
              {upcoming.map((agenda) => {
                const start = new Date(agenda.startsAt);
                return (
                  <Link
                    key={agenda.id}
                    href={`/agenda/${agenda.slug}`}
                    className="surface flex flex-col gap-4 p-5 transition hover:border-brand-200 sm:flex-row sm:items-center"
                  >
                    <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-brand-600 text-white">
                      <span className="text-2xl font-extrabold leading-none">{start.getDate()}</span>
                      <span className="mt-1 text-[11px] font-bold uppercase">
                        {new Intl.DateTimeFormat("id-ID", { month: "short" }).format(start)}
                      </span>
                      <span className="text-[10px] text-brand-100">{start.getFullYear()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="success">Terjadwal</Badge>
                        {agenda.capacity ? (
                          <span className="flex items-center gap-1 text-xs text-muted">
                            <Users className="h-3.5 w-3.5" aria-hidden />
                            {agenda.capacity} peserta
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-2 text-lg font-extrabold text-navy">{agenda.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted">{agenda.description}</p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" aria-hidden />
                          {agenda.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" aria-hidden />
                          {new Intl.DateTimeFormat("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "Asia/Makassar",
                          }).format(start)}{" "}
                          WITA
                        </span>
                      </div>
                    </div>
                    <span className="btn-outline shrink-0">Detail</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="Belum ada agenda mendatang"
              description="Pantau terus halaman ini untuk informasi kegiatan berikutnya."
            />
          )}
        </section>

        {past.length ? (
          <section>
            <h2 className="mb-4 text-xl font-extrabold text-navy">Agenda sebelumnya</h2>
            <div className="table-wrap">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Kegiatan</th>
                    <th>Tanggal</th>
                    <th>Lokasi</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {past.map((agenda) => (
                    <tr key={agenda.id}>
                      <td className="font-semibold">
                        <Link href={`/agenda/${agenda.slug}`} className="hover:text-brand-600">
                          {agenda.title}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap text-muted">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                          {formatDate(agenda.startsAt)}
                        </span>
                      </td>
                      <td className="text-muted">{agenda.location}</td>
                      <td>
                        <Badge tone={agenda.status === "CANCELLED" ? "danger" : "neutral"}>
                          {agenda.status === "CANCELLED" ? "Dibatalkan" : "Selesai"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
