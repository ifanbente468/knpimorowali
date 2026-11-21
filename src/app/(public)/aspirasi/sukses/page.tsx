import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { CopyButton } from "@/components/copy-button";

export const metadata: Metadata = {
  title: "Aspirasi terkirim",
  robots: { index: false, follow: false },
};

export default async function AspirasiSuksesPage({
  searchParams,
}: {
  searchParams: Promise<{ kode?: string }>;
}) {
  const params = await searchParams;
  const code = /^ASP-\d{4}-\d{4}$/.test(params.kode ?? "") ? params.kode : null;

  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-16">
      <div className="surface w-full max-w-lg p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-success">
          <CheckCircle2 className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-navy">Aspirasi berhasil dikirim</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Terima kasih. Pengurus DPD KNPI Kabupaten Morowali akan meninjau aspirasi Anda.
        </p>
        {code ? (
          <div className="mt-6 rounded-xl border border-line bg-canvas p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Kode pelacakan</div>
            <div className="mt-1 font-mono text-xl font-bold text-brand-600">{code}</div>
            <div className="mt-3 flex justify-center">
              <CopyButton value={code} label="Salin kode" />
            </div>
            <p className="mt-2 text-xs text-muted">Simpan kode ini untuk menanyakan status aspirasi.</p>
          </div>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/aspirasi" className="btn-outline">Kirim aspirasi lain</Link>
          <Link href="/" className="btn-primary">Kembali ke beranda</Link>
        </div>
      </div>
    </div>
  );
}
