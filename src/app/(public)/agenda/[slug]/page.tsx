import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ChevronLeft, Clock, MapPin, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui";
import { RichText } from "@/components/rich-text";

export const revalidate = 60;

async function getAgenda(slug: string) {
  return prisma.agenda.findFirst({ where: { slug, isPublished: true } });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const agenda = await getAgenda(slug);
  if (!agenda) return { title: "Agenda tidak ditemukan" };
  return { title: agenda.title, description: agenda.description.slice(0, 160) };
}

export default async function AgendaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agenda = await getAgenda(slug);
  if (!agenda) notFound();

  const statusLabel =
    agenda.status === "CANCELLED" ? "Dibatalkan" : agenda.status === "COMPLETED" ? "Selesai" : "Terjadwal";
  const statusTone = agenda.status === "CANCELLED" ? "danger" : agenda.status === "COMPLETED" ? "neutral" : "success";

  return (
    <>
      <section className="border-b border-line bg-canvas py-10">
        <div className="container-page max-w-3xl">
          <Link href="/agenda" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Semua agenda
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge tone={statusTone}>{statusLabel}</Badge>
            {agenda.capacity ? (
              <span className="flex items-center gap-1 text-xs text-muted">
                <Users className="h-3.5 w-3.5" aria-hidden />
                Kapasitas {agenda.capacity} peserta
              </span>
            ) : null}
          </div>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-navy sm:text-4xl">
            {agenda.title}
          </h1>
        </div>
      </section>

      <div className="container-page grid max-w-5xl gap-8 py-10 lg:grid-cols-[1fr_320px]">
        <div>
          <RichText content={agenda.description} />
        </div>
        <aside className="space-y-4">
          <div className="surface p-5">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-navy">Detail acara</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex gap-2">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                <div>
                  <dt className="text-xs text-muted">Tanggal</dt>
                  <dd className="font-semibold text-navy">{formatDate(agenda.startsAt)}</dd>
                </div>
              </div>
              <div className="flex gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                <div>
                  <dt className="text-xs text-muted">Waktu</dt>
                  <dd className="font-semibold text-navy">
                    {formatDateTime(agenda.startsAt)} WITA
                    {agenda.endsAt ? ` — ${new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Makassar" }).format(agenda.endsAt)} WITA` : ""}
                  </dd>
                </div>
              </div>
              <div className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                <div>
                  <dt className="text-xs text-muted">Lokasi</dt>
                  <dd className="font-semibold text-navy">{agenda.location}</dd>
                </div>
              </div>
            </dl>
            <Link href="/aspirasi" className="btn-primary mt-5 w-full">
              Hubungi panitia
            </Link>
          </div>
          <div className="rounded-2xl bg-brand-50 p-5 text-sm text-brand-800">
            <p className="font-bold">Informasi pendaftaran</p>
            <p className="mt-2 leading-6">
              Konfirmasi keikutsertaan melalui sekretariat DPD KNPI Kabupaten Morowali atau
              hubungi pengurus kecamatan setempat.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
