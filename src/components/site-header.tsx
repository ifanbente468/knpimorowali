import Link from "next/link";
import Image from "next/image";
import { getSettings } from "@/lib/settings";
import { SiteNav } from "@/components/site-nav";

export async function SiteHeader() {
  const settings = await getSettings();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="container-page flex h-[76px] items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label={`${settings.siteName} beranda`}>
          <span className="flex h-12 w-[72px] items-center justify-center rounded-lg border border-line bg-white p-1">
            <Image
              src="/images/logo.jpg"
              alt="Logo KNPI"
              width={120}
              height={72}
              className="h-full w-full object-contain"
              priority
            />
          </span>
          <span className="hidden sm:block">
            <span className="block text-sm font-extrabold leading-tight text-navy">
              {settings.siteName}
            </span>
            <span className="block text-[11px] font-medium text-muted">Komite Nasional Pemuda Indonesia</span>
          </span>
        </Link>

        <SiteNav />

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/masuk" className="btn-ghost">
            Masuk
          </Link>
          <Link href="/anggota/daftar" className="btn-accent">
            Daftar Anggota
          </Link>
        </div>
      </div>
    </header>
  );
}
