import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, IdCard, ShieldCheck, UserCheck } from "lucide-react";
import { registerAction } from "@/actions/auth";
import { ActionForm } from "@/components/action-form";
import { DISTRICTS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Daftar Anggota",
  description:
    "Daftar menjadi anggota KNPI Kabupaten Morowali. Gratis, dapatkan kartu anggota digital.",
};

export default function DaftarAnggotaPage() {
  return (
    <div className="bg-canvas py-10">
      <div className="container-page grid max-w-5xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="space-y-4">
          <div className="rounded-2xl bg-navy p-6 text-white">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Keanggotaan</div>
            <h1 className="mt-2 text-2xl font-extrabold">Bergabung dengan KNPI Morowali</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Jadilah bagian dari jaringan pemuda Kabupaten Morowali. Pendaftaran gratis dan
              diverifikasi oleh pengurus.
            </p>
            <ul className="mt-5 space-y-3 text-sm text-slate-200">
              {[
                { icon: IdCard, text: "Kartu anggota digital dengan QR verifikasi" },
                { icon: UserCheck, text: "Akses kegiatan dan pelatihan kaderisasi" },
                { icon: ShieldCheck, text: "Data pribadi dilindungi dan tidak dipublikasikan" },
                { icon: CheckCircle2, text: "Terhubung dengan OKP dan komunitas pemuda" },
              ].map((item) => (
                <li key={item.text} className="flex gap-2">
                  <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
          <div className="surface p-5 text-sm text-muted">
            <p className="font-bold text-navy">Sudah punya akun?</p>
            <p className="mt-1 text-xs">Masuk untuk melihat status keanggotaan dan kartu digital.</p>
            <Link href="/masuk" className="btn-outline mt-3 w-full">Masuk</Link>
          </div>
        </aside>

        <div className="surface p-6 sm:p-8">
          <h2 className="text-xl font-extrabold text-navy">Formulir pendaftaran</h2>
          <p className="mt-1 text-sm text-muted">Data harus sesuai identitas resmi.</p>

          <ActionForm action={registerAction} submitLabel="Daftar sekarang" pendingLabel="Memproses pendaftaran…" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="label">Nama lengkap</label>
                <input id="name" name="name" className="input" required autoComplete="name" maxLength={100} />
              </div>
              <div>
                <label htmlFor="nik" className="label">NIK (16 digit)</label>
                <input id="nik" name="nik" className="input" required inputMode="numeric" pattern="\d{16}" maxLength={16} />
              </div>
              <div>
                <label htmlFor="email" className="label">Email</label>
                <input id="email" name="email" type="email" className="input" required autoComplete="email" maxLength={160} />
              </div>
              <div>
                <label htmlFor="phone" className="label">Nomor WhatsApp</label>
                <input id="phone" name="phone" type="tel" className="input" required autoComplete="tel" maxLength={20} />
              </div>
              <div>
                <label htmlFor="birthDate" className="label">Tanggal lahir</label>
                <input id="birthDate" name="birthDate" type="date" className="input" required />
              </div>
              <div>
                <label htmlFor="gender" className="label">Jenis kelamin</label>
                <select id="gender" name="gender" className="select" required defaultValue="">
                  <option value="" disabled>Pilih</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
              <div>
                <label htmlFor="district" className="label">Kecamatan</label>
                <select id="district" name="district" className="select" required defaultValue="">
                  <option value="" disabled>Pilih kecamatan</option>
                  {DISTRICTS.map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="okp" className="label">OKP / komunitas (opsional)</label>
                <input id="okp" name="okp" className="input" maxLength={120} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="address" className="label">Alamat domisili</label>
                <textarea id="address" name="address" className="textarea" required maxLength={300} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="occupation" className="label">Pekerjaan / status (opsional)</label>
                <input id="occupation" name="occupation" className="input" maxLength={120} />
              </div>
              <div>
                <label htmlFor="password" className="label">Kata sandi</label>
                <input id="password" name="password" type="password" className="input" required autoComplete="new-password" minLength={8} maxLength={72} />
                <p className="mt-1 text-xs text-muted">Minimal 8 karakter, memuat huruf dan angka.</p>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="label">Ulangi kata sandi</label>
                <input id="confirmPassword" name="confirmPassword" type="password" className="input" required autoComplete="new-password" minLength={8} maxLength={72} />
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input id="agree" name="agree" type="checkbox" required className="mt-1 h-4 w-4 rounded border-field" />
              <label htmlFor="agree" className="text-sm leading-6 text-muted">
                Saya menyetujui data saya diverifikasi dan digunakan untuk keperluan keanggotaan
                KNPI Kabupaten Morowali.
              </label>
            </div>

            <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
              <label htmlFor="website">Website</label>
              <input id="website" name="website" tabIndex={-1} autoComplete="off" />
            </div>
          </ActionForm>
        </div>
      </div>
    </div>
  );
}
