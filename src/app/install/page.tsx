import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Check, Database, KeyRound, ShieldCheck, X } from "lucide-react";
import { installAction } from "@/actions/install";
import { ActionForm } from "@/components/action-form";
import { getInstallStatus } from "@/lib/installer";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Instalasi",
  description: "Instalasi awal platform KNPI Morowali.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function InstallPage() {
  const status = await getInstallStatus();
  const blocked = status.missingEnv.length > 0;
  const ready = status.tablesReady;

  return (
    <main id="konten" className="container-page py-10 sm:py-14">
      <div className="mx-auto w-full max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <ShieldCheck className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-navy">Instalasi {SITE.name}</h1>
            <p className="text-sm text-muted">
              Halaman satu kali pakai. Terkunci otomatis setelah berhasil.
            </p>
          </div>
        </div>

        {status.installed ? (
          <div className="surface mt-7 p-7">
            <div className="flex items-center gap-2 text-success">
              <Check className="h-5 w-5" aria-hidden />
              <p className="font-bold">Aplikasi sudah terpasang</p>
            </div>
            <p className="mt-2 text-sm text-muted">
              Halaman instalasi dikunci. Masuk lewat halaman login untuk mengelola konten.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/masuk" className="btn-primary">
                Masuk ke akun
              </Link>
              <Link href="/" className="btn-outline">
                Buka beranda
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="surface mt-7 p-6">
              <h2 className="flex items-center gap-2 text-sm font-bold text-navy">
                <Database className="h-4 w-4 text-brand-600" aria-hidden />
                Status server
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                {status.env.map((item) => (
                  <li key={item.key} className="flex items-start gap-2">
                    {item.ok ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                    ) : (
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
                    )}
                    <span className="text-navy">
                      <code className="text-xs font-bold">{item.key}</code>{" "}
                      <span className="text-muted">— {item.hint}</span>
                    </span>
                  </li>
                ))}
                <li className="flex items-start gap-2">
                  {ready ? (
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                  )}
                  <span className="text-navy">
                    Tabel database <span className="text-muted">— dibuat otomatis saat instalasi</span>
                  </span>
                </li>
              </ul>

              {blocked ? (
                <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
                  <p className="font-semibold">
                    Environment variable belum lengkap: {status.missingEnv.join(", ")}.
                  </p>
                  <p className="mt-1">
                    Buka cPanel → Setup Node.js App → Environment Variables, isi nilainya, lalu Restart
                    aplikasi. Muat ulang halaman ini setelahnya.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="surface mt-5 p-6 sm:p-7">
              <h2 className="flex items-center gap-2 text-base font-bold text-navy">
                <KeyRound className="h-4 w-4 text-brand-600" aria-hidden />
                Buat akun administrator
              </h2>
              <p className="mt-1 text-sm text-muted">
                Akun ini dipakai untuk mengelola berita, agenda, anggota, dan pengaturan situs.
              </p>

              <ActionForm
                action={installAction}
                submitLabel={blocked ? "Lengkapi environment dulu" : "Instal sekarang"}
                pendingLabel="Memasang…"
                className="mt-5"
                submitClassName={blocked ? "btn-outline pointer-events-none" : "btn-primary"}
              >
                <input type="hidden" name="website" value="" />
                {process.env.INSTALL_TOKEN ? (
                  <div>
                    <label htmlFor="installToken" className="label">
                      Token instalasi
                    </label>
                    <input
                      id="installToken"
                      name="installToken"
                      type="password"
                      className="input"
                      required
                      autoComplete="off"
                    />
                  </div>
                ) : null}
                <div>
                  <label htmlFor="siteName" className="label">
                    Nama situs
                  </label>
                  <input
                    id="siteName"
                    name="siteName"
                    type="text"
                    className="input"
                    defaultValue={SITE.name}
                    required
                    maxLength={80}
                  />
                </div>
                <div>
                  <label htmlFor="adminName" className="label">
                    Nama administrator
                  </label>
                  <input
                    id="adminName"
                    name="adminName"
                    type="text"
                    className="input"
                    defaultValue="Administrator KNPI Morowali"
                    required
                    maxLength={100}
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="label">
                    Email administrator
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="input"
                    required
                    maxLength={160}
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="label">
                    Kata sandi
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className="input"
                    required
                    minLength={8}
                    maxLength={72}
                    autoComplete="new-password"
                  />
                  <p className="mt-1 text-xs text-muted">
                    Minimal 8 karakter, memuat huruf dan angka.
                  </p>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="label">
                    Ulangi kata sandi
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    className="input"
                    required
                    minLength={8}
                    maxLength={72}
                    autoComplete="new-password"
                  />
                </div>
              </ActionForm>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
