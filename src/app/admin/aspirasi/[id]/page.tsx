import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { prisma } from "@/lib/db";
import { updateAspirationAction } from "@/actions/content";
import { ActionForm } from "@/components/action-form";
import { Badge, PageHeader } from "@/components/ui";
import { ASPIRATION_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminAspirationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const aspiration = await prisma.aspiration.findUnique({
    where: { id },
    include: { respondedBy: { select: { name: true } } },
  });

  if (!aspiration) notFound();

  return (
    <div className="max-w-5xl">
      <Link href="/admin/aspirasi" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Daftar aspirasi
      </Link>
      <PageHeader
        title={aspiration.subject}
        description={`${aspiration.trackingCode} · ${formatDateTime(aspiration.createdAt)}`}
        action={
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
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <section className="surface p-6">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-navy">Isi aspirasi</h2>
            <div className="mt-3 whitespace-pre-line text-sm leading-7 text-navy">{aspiration.message}</div>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4 text-xs text-muted">
              <Badge tone="brand">{aspiration.category}</Badge>
              {aspiration.isPublic ? <Badge tone="success">Disetujui publik</Badge> : <Badge>Privat</Badge>}
            </div>
          </section>

          {aspiration.response ? (
            <section className="surface p-6">
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-navy">Tanggapan tersimpan</h2>
              <div className="mt-3 whitespace-pre-line rounded-xl bg-canvas p-4 text-sm leading-6 text-navy">
                {aspiration.response}
              </div>
              <p className="mt-2 text-xs text-muted">
                {aspiration.respondedBy?.name ? `Oleh ${aspiration.respondedBy.name}` : ""}
                {aspiration.respondedAt ? ` · ${formatDateTime(aspiration.respondedAt)}` : ""}
              </p>
            </section>
          ) : null}
        </div>

        <div className="space-y-5">
          <section className="surface p-6">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-navy">Pengirim</h2>
            <div className="mt-3 space-y-2 text-sm">
              <p className="font-semibold text-navy">{aspiration.name}</p>
              {aspiration.email ? (
                <p className="flex items-center gap-2 text-muted">
                  <Mail className="h-4 w-4" aria-hidden />
                  <a href={`mailto:${aspiration.email}`} className="hover:text-brand-600">{aspiration.email}</a>
                </p>
              ) : null}
              {aspiration.phone ? (
                <p className="flex items-center gap-2 text-muted">
                  <Phone className="h-4 w-4" aria-hidden />
                  <a href={`https://wa.me/${aspiration.phone.replace(/\D/g, "").replace(/^0/, "62")}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600">
                    {aspiration.phone}
                  </a>
                </p>
              ) : null}
              {!aspiration.email && !aspiration.phone ? (
                <p className="text-xs text-muted">Pengirim tidak mencantumkan kontak.</p>
              ) : null}
            </div>
          </section>

          <section className="surface p-6">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-navy">Tanggapan</h2>
            <ActionForm action={updateAspirationAction} submitLabel="Simpan tanggapan" className="mt-4" submitClassName="btn-primary w-full">
              <input type="hidden" name="id" value={aspiration.id} />
              <div>
                <label htmlFor="status" className="label">Status</label>
                <select id="status" name="status" className="select" defaultValue={aspiration.status}>
                  <option value="NEW">Baru</option>
                  <option value="IN_PROGRESS">Diproses</option>
                  <option value="RESOLVED">Selesai</option>
                  <option value="REJECTED">Ditolak</option>
                </select>
              </div>
              <div>
                <label htmlFor="response" className="label">Tanggapan / tindak lanjut</label>
                <textarea id="response" name="response" className="textarea" defaultValue={aspiration.response ?? ""} maxLength={4000} />
                <p className="mt-1 text-xs text-muted">Wajib diisi untuk menandai selesai.</p>
              </div>
              <label className="flex items-start gap-2 text-sm text-muted">
                <input type="checkbox" name="isPublic" defaultChecked={aspiration.isPublic} className="mt-0.5 h-4 w-4 rounded border-field" />
                Tampilkan sebagai contoh publik setelah selesai.
              </label>
            </ActionForm>
          </section>
        </div>
      </div>
    </div>
  );
}
