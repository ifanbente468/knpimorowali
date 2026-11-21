import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, IdCard, SearchX, ShieldAlert } from "lucide-react";
import { prisma } from "@/lib/db";
import { MEMBER_STATUS_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui";
import { maskNik } from "@/lib/privacy";

export const metadata: Metadata = {
  title: "Cek Kartu Anggota",
  description: "Verifikasi keaslian kartu anggota KNPI Kabupaten Morowali.",
};

export const dynamic = "force-dynamic";

export default async function CekKartuPage({
  searchParams,
}: {
  searchParams: Promise<{ no?: string; nik?: string }>;
}) {
  const params = await searchParams;
  const memberNo = (params.no ?? "").trim().toUpperCase().slice(0, 40);
  const nik = (params.nik ?? "").trim().replace(/\D/g, "").slice(0, 16);
  const hasQuery = Boolean(memberNo || nik);

  const member =
    hasQuery && (memberNo || nik)
      ? await prisma.member.findFirst({
          where: {
            ...(memberNo ? { memberNo } : {}),
            ...(nik ? { nik } : {}),
          },
          include: { user: { select: { name: true } } },
        })
      : null;

  return (
    <div className="bg-canvas py-12">
      <div className="container-page max-w-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <IdCard className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-navy">Cek kartu anggota</h1>
          <p className="mt-2 text-sm text-muted">
            Masukkan nomor anggota atau NIK untuk memverifikasi keaslian kartu.
          </p>
        </div>

        <form method="get" className="surface mt-8 space-y-4 p-6">
          <div>
            <label htmlFor="no" className="label">Nomor anggota</label>
            <input
              id="no"
              name="no"
              className="input font-mono"
              placeholder="KNPI-MOR-2026-00001"
              defaultValue={memberNo}
              maxLength={40}
            />
          </div>
          <div className="text-center text-xs font-semibold uppercase tracking-wider text-muted">atau</div>
          <div>
            <label htmlFor="nik" className="label">NIK</label>
            <input
              id="nik"
              name="nik"
              inputMode="numeric"
              className="input font-mono"
              placeholder="16 digit NIK"
              defaultValue={nik}
              maxLength={16}
            />
          </div>
          <button type="submit" className="btn-primary w-full">Verifikasi</button>
          <p className="text-center text-xs leading-5 text-muted">
            Demi privasi, NIK lengkap tidak ditampilkan pada hasil verifikasi.
          </p>
        </form>

        {hasQuery ? (
          member ? (
            <div className="surface mt-6 overflow-hidden">
              <div className="flex items-center gap-2 border-b border-line bg-emerald-50 px-5 py-3 text-sm font-bold text-success">
                <BadgeCheck className="h-5 w-5" aria-hidden />
                Data anggota ditemukan
              </div>
              <dl className="grid gap-4 p-5 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted">Nama</dt>
                  <dd className="font-bold text-navy">{member.user.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Nomor anggota</dt>
                  <dd className="font-mono font-bold text-brand-600">
                    {member.memberNo ?? "Belum diterbitkan"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">NIK</dt>
                  <dd className="font-mono text-navy">{maskNik(member.nik)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Kecamatan</dt>
                  <dd className="text-navy">{member.district}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Status keanggotaan</dt>
                  <dd className="mt-1">
                    <Badge tone={member.status === "ACTIVE" ? "success" : "warning"}>
                      {MEMBER_STATUS_LABELS[member.status]}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Terdaftar</dt>
                  <dd className="text-navy">
                    {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(member.joinedAt)}
                  </dd>
                </div>
              </dl>
              {member.status !== "ACTIVE" ? (
                <div className="flex items-start gap-2 border-t border-line bg-amber-50 px-5 py-3 text-xs text-warning">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  Kartu belum aktif. Hubungi sekretariat KNPI Morowali untuk informasi lebih lanjut.
                </div>
              ) : null}
            </div>
          ) : (
            <div className="surface mt-6 flex items-start gap-3 p-6">
              <SearchX className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden />
              <div>
                <div className="font-bold text-navy">Data tidak ditemukan</div>
                <p className="mt-1 text-sm text-muted">
                  Periksa kembali nomor anggota/NIK. Jika masih bermasalah, hubungi sekretariat
                  KNPI Morowali.
                </p>
              </div>
            </div>
          )
        ) : null}

        <p className="mt-6 text-center text-sm text-muted">
          Belum terdaftar?{" "}
          <Link href="/anggota/daftar" className="font-bold text-brand-600 hover:underline">
            Daftar jadi anggota
          </Link>
        </p>
      </div>
    </div>
  );
}
