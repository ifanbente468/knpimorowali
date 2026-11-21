"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Beranda" },
  { href: "/profil", label: "Profil" },
  { href: "/organisasi", label: "Organisasi" },
  { href: "/berita", label: "Berita" },
  { href: "/agenda", label: "Agenda" },
  { href: "/galeri", label: "Galeri" },
  { href: "/aspirasi", label: "Aspirasi" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <nav aria-label="Navigasi utama" className="hidden items-center gap-1 lg:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-semibold transition",
              isActive(link.href)
                ? "bg-brand-50 text-brand-700"
                : "text-navy hover:bg-canvas hover:text-brand-600",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        className="btn-outline lg:hidden"
        aria-expanded={open}
        aria-controls="menu-mobile"
        aria-label={open ? "Tutup menu" : "Buka menu"}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open ? (
        <div id="menu-mobile" className="absolute inset-x-0 top-full border-b border-line bg-white p-4 shadow-lg lg:hidden">
          <nav aria-label="Navigasi seluler" className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-3 text-sm font-semibold",
                  isActive(link.href) ? "bg-brand-50 text-brand-700" : "text-navy",
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-line pt-3">
              <Link href="/masuk" onClick={() => setOpen(false)} className="btn-outline">
                Masuk
              </Link>
              <Link href="/anggota/daftar" onClick={() => setOpen(false)} className="btn-accent">
                Daftar
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </>
  );
}
