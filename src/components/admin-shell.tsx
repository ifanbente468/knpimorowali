"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Banknote,
  Building2,
  CalendarDays,
  ExternalLink,
  FileText,
  Gauge,
  Images,
  LogOut,
  MailOpen,
  Menu,
  MessageSquareWarning,
  Newspaper,
  Settings,
  Users,
  UserSquare2,
  X,
} from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { logoutAction } from "@/actions/auth";
import { ROLE_LABELS } from "@/lib/constants";

const navigation = [
  { href: "/admin", label: "Ringkasan", icon: Gauge, exact: true },
  { href: "/admin/anggota", label: "Anggota", icon: Users },
  { href: "/admin/berita", label: "Berita", icon: Newspaper },
  { href: "/admin/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/admin/galeri", label: "Galeri", icon: Images },
  { href: "/admin/aspirasi", label: "Aspirasi", icon: MessageSquareWarning },
  { href: "/admin/persuratan", label: "Persuratan", icon: MailOpen, adminOnly: true },
  { href: "/admin/keuangan", label: "Keuangan", icon: Banknote, adminOnly: true },
  { href: "/admin/organisasi", label: "Organisasi", icon: Building2, adminOnly: true },
  { href: "/admin/pengguna", label: "Pengguna", icon: UserSquare2, adminOnly: true },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings, adminOnly: true },
];

export function AdminShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; role: "ADMIN" | "EDITOR" | "MEMBER" };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = navigation.filter((item) => !item.adminOnly || user.role === "ADMIN");

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="min-h-screen bg-canvas">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col bg-navy text-white transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Navigasi admin"
      >
        <div className="flex items-center justify-between gap-3 px-4 py-5">
          <Link href="/admin" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <span className="rounded-lg bg-white p-1">
              <Image src="/images/logo.jpg" alt="Logo KNPI" width={120} height={72} className="h-8 w-12 object-contain" />
            </span>
            <span>
              <span className="block text-sm font-extrabold leading-tight">KNPI Morowali</span>
              <span className="block text-[11px] text-slate-400">Panel Admin</span>
            </span>
          </Link>
          <button type="button" className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 lg:hidden" onClick={() => setOpen(false)} aria-label="Tutup menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                isActive(item.href, item.exact)
                  ? "bg-accent text-navy"
                  : "text-slate-300 hover:bg-white/10 hover:text-white",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="mb-2 flex items-center gap-2 px-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-xs font-extrabold text-navy">
              {initials(user.name)}
            </span>
            <div className="min-w-0">
              <div className="truncate text-xs font-bold">{user.name}</div>
              <div className="text-[10px] text-slate-400">{ROLE_LABELS[user.role]}</div>
            </div>
          </div>
          <Link href="/" target="_blank" className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-white/10">
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            Lihat situs publik
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-white/10">
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              Keluar
            </button>
          </form>
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          aria-label="Tutup menu"
          className="fixed inset-0 z-40 bg-navy/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="lg:pl-[250px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-white px-4 sm:px-6 print:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-field p-2 text-navy lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Buka menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="text-sm font-bold text-navy">Panel Administrasi</div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank" className="hidden text-xs font-bold text-brand-600 hover:underline sm:block">
              Situs publik ↗
            </Link>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-xs font-extrabold text-navy">
              {initials(user.name)}
            </div>
          </div>
        </header>
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
