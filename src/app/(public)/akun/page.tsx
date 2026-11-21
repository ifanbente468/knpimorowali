import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, BadgeCheck, Clock3, LayoutDashboard, LogOut, Mail, MapPin, Phone, ShieldCheck, XCircle } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logoutAction, updateProfileAction, changePasswordAction } from "@/actions/auth";
import { ActionForm } from "@/components/action-form";
import { MemberCard } from "@/components/member-card";
import { Alert, Badge } from "@/components/ui";
import { MEMBER_STATUS_LABELS, ROLE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { maskNik } from "@/lib/privacy";

export const metadata: Metadata = {
  title: "Akun Saya",
  robots: { index: false, follow: false },
};

export default async function AkunPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const member = await prisma.member.findUnique({ where: { userId: user.id } });

  const verifyUrl = member?.memberNo
    ? `${process.env.APP_URL ?? "http://localhost:3000"}/anggota/cek?no=${encodeURIComponent(member.memberNo)}`
    : "";

  return (
    <div className="bg-canvas py-10">
      <div className="container-page max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Akun</div>
            <h1 className="mt-1 text-2xl font-extrabold text-navy">Halo, {user.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone="brand">{ROLE_LABELS[user.role]}</Badge>
              {member ? (
                <Badge
                  tone={
                    member.status === "ACTIVE"
                      ? "success"
                      : member.status === "PENDING"
                        ? "warning"
                        : "danger"
                  }
                >
                  {MEMBER_STATUS_LABELS[member.status]}
                </Badge>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.role !== "MEMBER" ? (
              <Link href="/admin" className="btn-outline">
                <LayoutDashboard className="h-4 w-4" aria-hidden />
                Panel admin
              </Link>
            ) : null}
            <form action={logoutAction}>
              <button type="submit" className="btn-outline">
                <LogOut className="h-4 w-4" aria-hidden />
                Keluar
              </button>
            </form>
          </div>
        </div>

        {params.status === "registered" ? (
          <div className="mb-6 print:hidden">
            <Alert tone="success">
              Pendaftaran berhasil. Akun Anda menunggu verifikasi pengurus. Kartu anggota aktif
              setelah disetujui.
            </Alert>
          </div>
        ) : null}

        {member?.status === "PENDING" ? (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 print:hidden">
            <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden />
            <div>
              <div className="font-bold text-warning">Menunggu verifikasi</div>
              <p className="mt-1 text-sm text-warning/90">
                Data Anda sedang ditinjau pengurus. Proses verifikasi maksimal 3 hari kerja.
              </p>
            </div>
          </div>
        ) : null}

        {member?.status === "REJECTED" ? (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 print:hidden">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden />
            <div>
              <div className="font-bold text-danger">Pendaftaran ditolak</div>
              {member.rejectionReason ? (
                <p className="mt-1 text-sm text-danger/90">Alasan: {member.rejectionReason}</p>
              ) : null}
              <p className="mt-1 text-sm text-danger/90">
                Perbaiki data atau hubungi sekretariat KNPI Morowali.
              </p>
            </div>
          </div>
        ) : null}

        {member?.status === "SUSPENDED" ? (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 print:hidden">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden />
            <div>
              <div className="font-bold text-warning">Keanggotaan ditangguhkan</div>
              <p className="mt-1 text-sm text-warning/90">
                Hubungi sekretariat DPD KNPI Kabupaten Morowali untuk informasi lebih lanjut.
              </p>
            </div>
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-6 print:hidden">
            <section className="surface p-6">
              <h2 className="text-lg font-extrabold text-navy">Data profil</h2>
              <p className="mt-1 text-sm text-muted">Perbarui kontak dan alamat domisili Anda.</p>
              <ActionForm action={updateProfileAction} submitLabel="Simpan profil" className="mt-5">
                <div>
                  <label htmlFor="name" className="label">Nama lengkap</label>
                  <input id="name" name="name" className="input" defaultValue={user.name} required maxLength={100} />
                </div>
                <div>
                  <label htmlFor="phone" className="label">Nomor WhatsApp</label>
                  <input id="phone" name="phone" className="input" defaultValue={user.phone ?? ""} required maxLength={20} />
                </div>
                <div>
                  <label htmlFor="address" className="label">Alamat</label>
                  <textarea
                    id="address"
                    name="address"
                    className="textarea"
                    defaultValue={member?.address ?? ""}
                    required
                    maxLength={300}
                  />
                </div>
                <div>
                  <label htmlFor="occupation" className="label">Pekerjaan / status</label>
                  <input
                    id="occupation"
                    name="occupation"
                    className="input"
                    defaultValue={member?.occupation ?? ""}
                    maxLength={120}
                  />
                </div>
                <div className="rounded-xl bg-canvas p-3 text-xs text-muted">
                  <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" aria-hidden /> {user.email}</div>
                  {member ? (
                    <div className="mt-1 flex items-center gap-2"><MapPin className="h-3.5 w-3.5" aria-hidden /> {member.district} · NIK {maskNik(member.nik)}</div>
                  ) : null}
                </div>
              </ActionForm>
            </section>

            <section className="surface p-6">
              <h2 className="text-lg font-extrabold text-navy">Ubah kata sandi</h2>
              <p className="mt-1 text-sm text-muted">Gunakan kata sandi kuat dan unik.</p>
              <ActionForm action={changePasswordAction} submitLabel="Ubah kata sandi" className="mt-5">
                <div>
                  <label htmlFor="currentPassword" className="label">Kata sandi saat ini</label>
                  <input id="currentPassword" name="currentPassword" type="password" className="input" required autoComplete="current-password" />
                </div>
                <div>
                  <label htmlFor="newPassword" className="label">Kata sandi baru</label>
                  <input id="newPassword" name="newPassword" type="password" className="input" required autoComplete="new-password" minLength={8} maxLength={72} />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="label">Ulangi kata sandi baru</label>
                  <input id="confirmPassword" name="confirmPassword" type="password" className="input" required autoComplete="new-password" minLength={8} maxLength={72} />
                </div>
              </ActionForm>
            </section>
          </div>

          <div className="space-y-6">
            <section className="surface p-6 print:border-0 print:p-0 print:shadow-none">
              <div className="mb-4 flex items-center justify-between gap-3 print:hidden">
                <div>
                  <h2 className="text-lg font-extrabold text-navy">Kartu anggota digital</h2>
                  <p className="text-sm text-muted">Tunjukkan QR untuk verifikasi.</p>
                </div>
                <ShieldCheck className="h-5 w-5 text-success" aria-hidden />
              </div>

              {member?.status === "ACTIVE" && member.memberNo ? (
                <MemberCard
                  name={user.name}
                  memberNo={member.memberNo}
                  district={member.district}
                  okp={member.okp}
                  joinedAt={member.joinedAt}
                  verifyUrl={verifyUrl}
                />
              ) : (
                <div className="rounded-xl border border-dashed border-field bg-canvas p-6 text-center text-sm text-muted print:hidden">
                  <BadgeCheck className="mx-auto h-8 w-8 text-muted/60" aria-hidden />
                  <p className="mt-2 font-semibold text-navy">Kartu belum tersedia</p>
                  <p className="mt-1 text-xs">
                    Kartu digital diterbitkan setelah keanggotaan diverifikasi.
                  </p>
                </div>
              )}
            </section>

            {member ? (
              <section className="surface p-6 print:hidden">
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-navy">Ringkasan keanggotaan</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Nomor anggota</dt>
                    <dd className="font-mono font-semibold text-navy">{member.memberNo ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Kecamatan</dt>
                    <dd className="font-semibold text-navy">{member.district}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">OKP / komunitas</dt>
                    <dd className="text-right font-semibold text-navy">{member.okp ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Terdaftar</dt>
                    <dd className="font-semibold text-navy">{formatDate(member.joinedAt)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Diverifikasi</dt>
                    <dd className="font-semibold text-navy">
                      {member.verifiedAt ? formatDate(member.verifiedAt) : "—"}
                    </dd>
                  </div>
                </dl>
              </section>
            ) : (
              <section className="surface p-6 print:hidden">
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-navy">Akun staf</h2>
                <p className="mt-2 text-sm text-muted">
                  Akun ini tidak memiliki profil keanggotaan. Kelola konten melalui panel admin.
                </p>
                <Link href="/admin" className="btn-primary mt-4 w-full">
                  <LayoutDashboard className="h-4 w-4" aria-hidden />
                  Buka panel admin
                </Link>
              </section>
            )}

            <section className="surface p-6 print:hidden">
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-navy">Bantuan</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Kendala akun atau verifikasi? Hubungi sekretariat DPD KNPI Kabupaten Morowali.
              </p>
              <div className="mt-3 space-y-1 text-sm">
                <a href="mailto:sekretariat@knpi-morowali.or.id" className="flex items-center gap-2 font-semibold text-brand-600 hover:underline">
                  <Mail className="h-4 w-4" aria-hidden />
                  sekretariat@knpi-morowali.or.id
                </a>
                <a href="tel:+62461000000" className="flex items-center gap-2 font-semibold text-brand-600 hover:underline">
                  <Phone className="h-4 w-4" aria-hidden />
                  +62 461 000 000
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
