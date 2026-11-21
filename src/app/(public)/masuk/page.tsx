import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogIn } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { loginAction } from "@/actions/auth";
import { ActionForm } from "@/components/action-form";
import { safeNextPath } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke akun KNPI Morowali untuk mengelola keanggotaan dan layanan.",
};

export default async function MasukPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const next = safeNextPath(params.next ?? null, user?.role === "MEMBER" ? "/akun" : "/admin");

  if (user) {
    redirect(user.role === "MEMBER" ? "/akun" : "/admin");
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="surface p-7 sm:p-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <LogIn className="h-5 w-5" aria-hidden />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-navy">Masuk ke akun</h1>
          <p className="mt-1 text-sm text-muted">
            Gunakan email dan kata sandi yang terdaftar.
          </p>

          <ActionForm action={loginAction} submitLabel="Masuk" pendingLabel="Memeriksa…" className="mt-6">
            <input type="hidden" name="next" value={next} />
            <input type="hidden" name="website" value="" />
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className="input"
                required
                autoComplete="email"
                maxLength={160}
              />
            </div>
            <div>
              <label htmlFor="password" className="label">Kata sandi</label>
              <input
                id="password"
                name="password"
                type="password"
                className="input"
                required
                autoComplete="current-password"
                maxLength={72}
              />
            </div>
          </ActionForm>

          <p className="mt-4 text-center text-xs text-muted">
            Lupa kata sandi? Hubungi sekretariat untuk reset aman oleh administrator.
          </p>
          <div className="mt-5 border-t border-line pt-5 text-center text-sm text-muted">
            Belum punya akun?{" "}
            <Link href="/anggota/daftar" className="font-bold text-brand-600 hover:underline">
              Daftar anggota
            </Link>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50 p-4 text-xs leading-5 text-brand-800">
          <strong>Catatan keamanan:</strong> Jangan bagikan kata sandi. Keluar dari akun setelah
          memakai perangkat publik.
        </div>
      </div>
    </div>
  );
}
