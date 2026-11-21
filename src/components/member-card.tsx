"use client";

import { QRCodeSVG } from "qrcode.react";
import { Printer, ShieldCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function MemberCard({
  name,
  memberNo,
  district,
  okp,
  joinedAt,
  verifyUrl,
}: {
  name: string;
  memberNo: string;
  district: string;
  okp: string | null;
  joinedAt: Date | string;
  verifyUrl: string;
}) {
  return (
    <div>
      <div
        id="kartu-anggota"
        className="relative mx-auto w-full max-w-xl overflow-hidden rounded-2xl bg-navy text-white shadow-xl print:shadow-none"
      >
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand-600/60 blur-2xl" aria-hidden />
        <div className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-accent/20 blur-2xl" aria-hidden />

        <div className="relative flex items-start justify-between gap-4 border-b border-white/10 p-5">
          <div>
            <div className="text-sm font-extrabold tracking-wide">KNPI MOROWALI</div>
            <div className="text-[10px] uppercase tracking-widest text-slate-300">
              Kartu Tanda Anggota
            </div>
          </div>
          <div className="rounded-lg bg-white p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.jpg" alt="Logo KNPI" className="h-9 w-14 object-contain" />
          </div>
        </div>

        <div className="relative grid grid-cols-[1fr_auto] gap-4 p-5">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-slate-400">Nama anggota</div>
            <div className="mt-0.5 truncate text-lg font-extrabold">{name}</div>
            <div className="mt-1 font-mono text-xs text-accent">{memberNo}</div>

            <dl className="mt-4 space-y-2 text-xs">
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-slate-400">Kecamatan</dt>
                <dd className="font-semibold">{district}</dd>
              </div>
              {okp ? (
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-slate-400">OKP</dt>
                  <dd className="font-semibold">{okp}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-slate-400">Bergabung</dt>
                <dd className="font-semibold">{formatDate(joinedAt)}</dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-col items-center justify-between gap-3">
            <div className="rounded-xl bg-white p-2">
              <QRCodeSVG value={verifyUrl} size={104} level="M" bgColor="#ffffff" fgColor="#14213D" />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              Terverifikasi
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-between border-t border-white/10 px-5 py-3 text-[10px] text-slate-400">
          <span>DPD KNPI Kabupaten Morowali</span>
          <span>Pindai QR untuk verifikasi</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2 print:hidden">
        <button type="button" onClick={() => window.print()} className="btn-outline">
          <Printer className="h-4 w-4" aria-hidden />
          Cetak / Simpan PDF
        </button>
      </div>
    </div>
  );
}
