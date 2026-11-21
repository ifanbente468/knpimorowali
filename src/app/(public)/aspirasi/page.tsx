import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock3, MessageSquareText, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/db";
import { submitAspirationAction } from "@/actions/public";
import { ActionForm } from "@/components/action-form";
import { EmptyState } from "@/components/ui";
import { ASPIRATION_CATEGORIES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Aspirasi",
  description:
    "Sampaikan aspirasi pemuda Kabupaten Morowali langsung ke DPD KNPI Morowali.",
};

export const dynamic = "force-dynamic";

export default async function AspirasiPage() {
  const resolved = await prisma.aspiration.findMany({
    where: { isPublic: true, status: "RESOLVED" },
    orderBy: { respondedAt: "desc" },
    take: 4,
    select: {
      trackingCode: true,
      subject: true,
      category: true,
      response: true,
      respondedAt: true,
    },
  });

  return (
    <>
      <section className="bg-navy py-14 text-white">
        <div className="container-page max-w-3xl">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Suara pemuda</div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Kirim aspirasi ke KNPI Morowali
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Setiap aspirasi dicatat dengan kode pelacakan dan ditindaklanjuti pengurus. Identitas
            Anda hanya dipakai untuk komunikasi dan tidak dipublikasikan tanpa izin.
          </p>
        </div>
      </section>

      <div className="container-page grid gap-8 py-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="surface p-6 sm:p-8">
          <h2 className="text-xl font-extrabold text-navy">Formulir aspirasi</h2>
          <p className="mt-1 text-sm text-muted">
            Isi data dengan jelas agar pengurus dapat menindaklanjuti.
          </p>
          <ActionForm action={submitAspirationAction} submitLabel="Kirim aspirasi" pendingLabel="Mengirim…" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="label">Nama / komunitas</label>
                <input id="name" name="name" className="input" required maxLength={100} />
              </div>
              <div>
                <label htmlFor="category" className="label">Kategori</label>
                <select id="category" name="category" className="select" required defaultValue="">
                  <option value="" disabled>Pilih kategori</option>
                  {ASPIRATION_CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="email" className="label">Email (opsional)</label>
                <input id="email" name="email" type="email" className="input" maxLength={160} />
              </div>
              <div>
                <label htmlFor="phone" className="label">Nomor WhatsApp (opsional)</label>
                <input id="phone" name="phone" type="tel" className="input" maxLength={20} />
              </div>
            </div>
            <div>
              <label htmlFor="subject" className="label">Subjek</label>
              <input id="subject" name="subject" className="input" required maxLength={140} />
            </div>
            <div>
              <label htmlFor="message" className="label">Uraian aspirasi</label>
              <textarea id="message" name="message" className="textarea min-h-40" required maxLength={4000} />
            </div>
            <div className="flex items-start gap-2">
              <input id="isPublic" name="isPublic" type="checkbox" className="mt-1 h-4 w-4 rounded border-field" />
              <label htmlFor="isPublic" className="text-sm text-muted">
                Izinkan aspirasi ini ditampilkan sebagai contoh publik setelah ditanggapi.
              </label>
            </div>
            <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
              <label htmlFor="website">Website</label>
              <input id="website" name="website" tabIndex={-1} autoComplete="off" />
            </div>
            <p className="text-xs leading-5 text-muted">
              Dengan mengirim, Anda menyetujui data diproses untuk keperluan advokasi aspirasi
              pemuda KNPI Morowali.
            </p>
          </ActionForm>
        </div>

        <aside className="space-y-4">
          <div className="surface p-5">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-navy">Cara kerja</h2>
            <ol className="mt-4 space-y-4 text-sm">
              {[
                { icon: MessageSquareText, title: "Kirim aspirasi", text: "Isi formulir, sistem memberi kode pelacakan." },
                { icon: Clock3, title: "Verifikasi & proses", text: "Pengurus meninjau dan meneruskan ke bidang terkait." },
                { icon: CheckCircle2, title: "Tindak lanjut", text: "Anda dihubungi melalui kontak yang dicantumkan." },
              ].map((item) => (
                <li key={item.title} className="flex gap-3">
                  <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                  <div>
                    <div className="font-bold text-navy">{item.title}</div>
                    <div className="text-xs leading-5 text-muted">{item.text}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="surface p-5 text-sm">
            <div className="font-bold text-navy">Sudah pernah mengirim?</div>
            <p className="mt-1 text-xs leading-5 text-muted">
              Lacak status aspirasi dengan kode pelacakan Anda.
            </p>
            <Link href="/aspirasi/lacak" className="btn-outline mt-3 w-full text-xs">
              Lacak aspirasi
            </Link>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-success">
            <div className="flex items-center gap-2 font-bold">
              <ShieldCheck className="h-4 w-4" aria-hidden />
              Data Anda terlindungi
            </div>
            <p className="mt-2 text-xs leading-5">
              Kontak hanya dapat diakses pengurus berwenang dan tidak ditampilkan ke publik.
            </p>
          </div>
        </aside>
      </div>

      <section className="bg-canvas py-12">
        <div className="container-page">
          <h2 className="text-xl font-extrabold text-navy">Aspirasi yang sudah ditindaklanjuti</h2>
          <p className="mt-1 text-sm text-muted">
            Ditampilkan atas izin pengirim sebagai transparansi layanan.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {resolved.length ? (
              resolved.map((item) => (
                <article key={item.trackingCode} className="surface p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="badge bg-brand-50 text-brand-700">{item.category}</span>
                    <span className="text-xs text-muted">
                      {item.respondedAt ? formatDate(item.respondedAt) : ""}
                    </span>
                  </div>
                  <h3 className="mt-3 font-bold text-navy">{item.subject}</h3>
                  {item.response ? (
                    <div className="mt-3 rounded-xl bg-canvas p-3 text-sm leading-6 text-muted">
                      <div className="mb-1 text-xs font-bold uppercase tracking-wide text-brand-600">
                        Tanggapan KNPI
                      </div>
                      {item.response}
                    </div>
                  ) : null}
                  <div className="mt-3 font-mono text-[11px] text-muted">{item.trackingCode}</div>
                </article>
              ))
            ) : (
              <div className="md:col-span-2">
                <EmptyState
                  title="Belum ada aspirasi publik"
                  description="Aspirasi yang telah selesai dan diizinkan akan tampil di sini."
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
