import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui";
import { ASPIRATION_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { maskName } from "@/lib/privacy";

export const metadata: Metadata = {
  title: "Lacak Aspirasi",
  description: "Lacak status aspirasi yang dikirim ke DPD KNPI Kabupaten Morowali.",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default async function LacakAspirasiPage({
  searchParams,
}: {
  searchParams: Promise<{ kode?: string }>;
}) {
  const params = await searchParams;
  const raw = (params.kode ?? "").trim().toUpperCase().slice(0, 30);
  const code = /^ASP-\d{4}-\d{4}$/.test(raw) ? raw : "";
  const hasQuery = raw.length > 0;

  const aspiration = code
    ? await prisma.aspiration.findUnique({
        where: { trackingCode: code },
        select: {
          trackingCode: true,
          name: true,
          subject: true,
          category: true,
          status: true,
          response: true,
          createdAt: true,
          respondedAt: true,
        },
      })
    : null;

  return (
    <div className="bg-canvas py-12">
      <div className="container-page max-w-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Search className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-navy">Lacak aspirasi</h1>
          <p className="mt-2 text-sm text-muted">
            Masukkan kode pelacakan yang Anda terima saat mengirim aspirasi.
          </p>
        </div>

        <form method="get" className="surface mt-8 p-6">
          <label htmlFor="kode" className="label">Kode pelacakan</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="kode"
              name="kode"
              className="input font-mono uppercase"
              placeholder="ASP-2026-0001"
              defaultValue={raw}
              maxLength={30}
              required
            />
            <button type="submit" className="btn-primary sm:w-36">Lacak</button>
          </div>
        </form>

        {hasQuery ? (
          aspiration ? (
            <div className="surface mt-6 p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs text-muted">{aspiration.trackingCode}</span>
                <Badge
                  tone={
                    aspiration.status === "RESOLVED"
                      ? "success"
                      : aspiration.status === "REJECTED"
                        ? "danger"
                        : aspiration.status === "IN_PROGRESS"
                          ? "brand"
                          : "warning"
                  }
                >
                  {ASPIRATION_STATUS_LABELS[aspiration.status]}
                </Badge>
              </div>
              <h2 className="mt-3 text-lg font-extrabold text-navy">{aspiration.subject}</h2>
              <div className="mt-1 text-xs text-muted">
                {aspiration.category} · Dikirim {formatDate(aspiration.createdAt)} · {maskName(aspiration.name)}
              </div>

              <div className="mt-5 border-t border-line pt-4">
                <div className="text-xs font-bold uppercase tracking-wide text-brand-600">Tanggapan KNPI</div>
                {aspiration.response ? (
                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-navy">{aspiration.response}</p>
                ) : (
                  <p className="mt-2 text-sm text-muted">
                    Aspirasi sedang ditinjau. Tanggapan akan tampil di sini setelah diproses pengurus.
                  </p>
                )}
                {aspiration.respondedAt ? (
                  <p className="mt-2 text-xs text-muted">
                    Diperbarui {formatDate(aspiration.respondedAt)}
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="surface mt-6 p-6 text-sm text-muted">
              <div className="font-bold text-navy">Kode tidak ditemukan</div>
              <p className="mt-1">
                Periksa kembali kode pelacakan. Kode berbentuk <span className="font-mono">ASP-TAHUN-NOMOR</span>.
              </p>
            </div>
          )
        ) : null}

        <p className="mt-6 text-center text-sm text-muted">
          Belum mengirim aspirasi?{" "}
          <Link href="/aspirasi" className="font-bold text-brand-600 hover:underline">
            Kirim sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
