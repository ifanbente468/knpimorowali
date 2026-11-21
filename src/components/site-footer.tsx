import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { getSettings } from "@/lib/settings";

export async function SiteFooter() {
  const settings = await getSettings();
  const socials = [
    { label: "Instagram", href: settings.instagram },
    { label: "Facebook", href: settings.facebook },
    { label: "YouTube", href: settings.youtube },
  ].filter((item) => item.href);

  return (
    <footer className="mt-16 bg-navy text-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="text-lg font-extrabold">{settings.fullName}</div>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">
            {settings.tagline} Wadah berhimpun pemuda dan organisasi kepemudaan
            Kabupaten Morowali.
          </p>
          <div className="mt-5 space-y-2 text-sm text-slate-300">
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
              <span>{settings.address}</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-accent" aria-hidden />
              <a href={`mailto:${settings.email}`} className="hover:underline">
                {settings.email}
              </a>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-accent" aria-hidden />
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:underline">
                {settings.phone}
              </a>
            </p>
          </div>
        </div>

        <div>
          <div className="text-sm font-bold uppercase tracking-wider text-accent">Tautan</div>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li><Link href="/profil" className="hover:text-white">Profil DPD</Link></li>
            <li><Link href="/organisasi" className="hover:text-white">OKP &amp; Sayap</Link></li>
            <li><Link href="/berita" className="hover:text-white">Berita</Link></li>
            <li><Link href="/agenda" className="hover:text-white">Agenda</Link></li>
            <li><Link href="/galeri" className="hover:text-white">Galeri</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-sm font-bold uppercase tracking-wider text-accent">Layanan</div>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li><Link href="/anggota/daftar" className="hover:text-white">Pendaftaran Anggota</Link></li>
            <li><Link href="/anggota/cek" className="hover:text-white">Cek Kartu Anggota</Link></li>
            <li><Link href="/aspirasi" className="hover:text-white">Kirim Aspirasi</Link></li>
            <li><Link href="/masuk" className="hover:text-white">Masuk / Akun</Link></li>
          </ul>
          {socials.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold hover:border-accent hover:text-accent"
                >
                  {social.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-wrap items-center justify-between gap-2 py-5 text-xs text-slate-400">
          <span>© {new Date().getFullYear()} {settings.fullName}. Seluruh hak dilindungi.</span>
          <span>Dibangun untuk pemuda Morowali.</span>
        </div>
      </div>
    </footer>
  );
}
