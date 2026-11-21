import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, IdCard, Mail, MapPin, Phone } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { reviewMemberAction, updateMemberAction } from "@/actions/members";
import { ActionForm } from "@/components/action-form";
import { Badge, PageHeader } from "@/components/ui";
import { DISTRICTS, MEMBER_STATUS_LABELS } from "@/lib/constants";
import { formatDate, toDateInput } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminMemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const currentUser = await getCurrentUser();
  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      user: true,
      verifiedBy: { select: { name: true } },
    },
  });

  if (!member) notFound();

  return (
    <>
      <Link href="/admin/anggota" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Daftar anggota
      </Link>
      <PageHeader
        title={member.user.name}
        description={`Terdaftar ${formatDate(member.createdAt)}`}
        action={
          <Badge
            tone={
              member.status === "ACTIVE"
                ? "success"
                : member.status === "PENDING"
                  ? "warning"
                  : member.status === "REJECTED"
                    ? "danger"
                    : "neutral"
            }
          >
            {MEMBER_STATUS_LABELS[member.status]}
          </Badge>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-5">
          <section className="surface p-6">
            <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-navy">
              <IdCard className="h-4 w-4 text-brand-600" aria-hidden />
              Data keanggotaan
            </h2>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-muted">Nomor anggota</dt><dd className="mt-0.5 font-mono font-semibold text-navy">{member.memberNo ?? "Belum diterbitkan"}</dd></div>
              <div><dt className="text-xs text-muted">NIK</dt><dd className="mt-0.5 font-mono font-semibold text-navy">{member.nik}</dd></div>
              <div><dt className="text-xs text-muted">Jenis kelamin</dt><dd className="mt-0.5 text-navy">{member.gender}</dd></div>
              <div><dt className="text-xs text-muted">Tanggal lahir</dt><dd className="mt-0.5 text-navy">{formatDate(member.birthDate)}</dd></div>
              <div><dt className="text-xs text-muted">Kecamatan</dt><dd className="mt-0.5 text-navy">{member.district}</dd></div>
              <div><dt className="text-xs text-muted">OKP / komunitas</dt><dd className="mt-0.5 text-navy">{member.okp ?? "—"}</dd></div>
              <div><dt className="text-xs text-muted">Pekerjaan</dt><dd className="mt-0.5 text-navy">{member.occupation ?? "—"}</dd></div>
              <div><dt className="text-xs text-muted">Diverifikasi</dt><dd className="mt-0.5 text-navy">{member.verifiedAt ? formatDate(member.verifiedAt) : "—"}{member.verifiedBy ? ` · ${member.verifiedBy.name}` : ""}</dd></div>
              <div className="sm:col-span-2"><dt className="text-xs text-muted">Alamat</dt><dd className="mt-0.5 text-navy">{member.address}</dd></div>
              {member.rejectionReason ? (
                <div className="sm:col-span-2 rounded-xl bg-red-50 p-3 text-danger">
                  <dt className="text-xs font-bold">Alasan penolakan</dt>
                  <dd className="mt-0.5 text-sm">{member.rejectionReason}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          {currentUser?.role === "ADMIN" ? (
          <section className="surface p-6">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-navy">Edit data anggota</h2>
            <ActionForm action={updateMemberAction} submitLabel="Simpan data anggota" className="mt-4">
              <input type="hidden" name="memberId" value={member.id} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="label">Nama lengkap</label>
                  <input id="name" name="name" className="input" defaultValue={member.user.name} required maxLength={100} />
                </div>
                <div>
                  <label htmlFor="phone" className="label">Nomor WhatsApp</label>
                  <input id="phone" name="phone" className="input" defaultValue={member.user.phone ?? ""} required maxLength={20} />
                </div>
                <div>
                  <label htmlFor="nik" className="label">NIK</label>
                  <input id="nik" name="nik" className="input font-mono" defaultValue={member.nik} required maxLength={16} />
                </div>
                <div>
                  <label htmlFor="birthDate" className="label">Tanggal lahir</label>
                  <input id="birthDate" name="birthDate" type="date" className="input" defaultValue={toDateInput(member.birthDate)} required />
                </div>
                <div>
                  <label htmlFor="gender" className="label">Jenis kelamin</label>
                  <select id="gender" name="gender" className="select" defaultValue={member.gender}>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="district" className="label">Kecamatan</label>
                  <select id="district" name="district" className="select" defaultValue={member.district}>
                    {DISTRICTS.map((district) => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="okp" className="label">OKP / komunitas</label>
                  <input id="okp" name="okp" className="input" defaultValue={member.okp ?? ""} maxLength={120} />
                </div>
                <div>
                  <label htmlFor="occupation" className="label">Pekerjaan</label>
                  <input id="occupation" name="occupation" className="input" defaultValue={member.occupation ?? ""} maxLength={120} />
                </div>
              </div>
              <div>
                <label htmlFor="address" className="label">Alamat</label>
                <textarea id="address" name="address" className="textarea min-h-20" defaultValue={member.address} required maxLength={300} />
              </div>
            </ActionForm>
          </section>
          ) : null}

          <section className="surface p-6">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-navy">Kontak akun</h2>
            <div className="mt-3 space-y-2 text-sm">
              <p className="flex items-center gap-2 text-navy"><Mail className="h-4 w-4 text-muted" aria-hidden /> {member.user.email}</p>
              <p className="flex items-center gap-2 text-navy"><Phone className="h-4 w-4 text-muted" aria-hidden /> {member.user.phone ?? "—"}</p>
              <p className="flex items-center gap-2 text-navy"><MapPin className="h-4 w-4 text-muted" aria-hidden /> {member.district}</p>
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          {currentUser?.role === "ADMIN" ? (
          <section className="surface p-6">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-navy">Keputusan verifikasi</h2>
            <p className="mt-1 text-xs text-muted">
              Persetujuan menerbitkan nomor anggota dan kartu digital.
            </p>
            <ActionForm
              action={reviewMemberAction}
              submitLabel="Simpan keputusan"
              className="mt-4"
              submitClassName="btn-primary w-full"
            >
              <input type="hidden" name="memberId" value={member.id} />
              <div>
                <label htmlFor="action" className="label">Tindakan</label>
                <select id="action" name="action" className="select" defaultValue={member.status === "PENDING" ? "APPROVE" : "REACTIVATE"}>
                  <option value="APPROVE">Setujui &amp; terbitkan kartu</option>
                  <option value="REJECT">Tolak pendaftaran</option>
                  <option value="SUSPEND">Tangguhkan keanggotaan</option>
                  <option value="REACTIVATE">Aktifkan kembali</option>
                </select>
              </div>
              <div>
                <label htmlFor="reason" className="label">Catatan / alasan (wajib jika menolak)</label>
                <textarea id="reason" name="reason" className="textarea" maxLength={500} />
              </div>
            </ActionForm>
          </section>
          ) : (
            <section className="surface p-6 text-sm text-muted">
              Hanya administrator yang dapat memverifikasi atau mengubah status keanggotaan.
            </section>
          )}

          <section className="surface p-6 text-sm">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-navy">Informasi akun</h2>
            <dl className="mt-3 space-y-2">
              <div className="flex justify-between gap-3"><dt className="text-muted">Peran</dt><dd className="font-semibold text-navy">{member.user.role}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">Status akun</dt><dd className="font-semibold text-navy">{member.user.isActive ? "Aktif" : "Nonaktif"}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">Login terakhir</dt><dd className="font-semibold text-navy">{member.user.lastLoginAt ? formatDate(member.user.lastLoginAt) : "Belum pernah"}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">Verifikasi</dt><dd className="font-semibold text-navy">{member.verifiedAt ? formatDate(member.verifiedAt) : "—"}</dd></div>
            </dl>
            {member.memberNo ? (
              <Link href={`/anggota/cek?no=${encodeURIComponent(member.memberNo)}`} target="_blank" className="btn-outline mt-4 w-full text-xs">
                Lihat kartu publik
              </Link>
            ) : null}
          </section>
        </aside>
      </div>
    </>
  );
}
