import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  MapPin,
  Megaphone,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { formatDate, formatNumber } from "@/lib/utils";
import { Badge, SectionTitle } from "@/components/ui";
import { DISTRICTS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getSettings();
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [
    memberCount,
    okpCount,
    eventCount,
    news,
    agendas,
    organizations,
    galleryItems,
  ] = await Promise.all([
    prisma.member.count({ where: { status: "ACTIVE" } }),
    prisma.organization.count({ where: { isActive: true, type: { in: ["OKP", "SAYAP"] } } }),
    prisma.agenda.count({ where: { createdAt: { gte: startOfYear } } }),
    prisma.news.findMany({
      where: { status: "PUBLISHED", publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: {
        slug: true,
        title: true,
        excerpt: true,
        category: true,
        coverImage: true,
        publishedAt: true,
      },
    }),
    prisma.agenda.findMany({
      where: { isPublished: true, startsAt: { gte: now }, status: "SCHEDULED" },
      orderBy: { startsAt: "asc" },
      take: 3,
    }),
    prisma.organization.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      take: 6,
    }),
    prisma.galleryItem.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], take: 4 }),
  ]);

  const [featured, ...rest] = news;

  return (
    <>
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(58,99,214,0.55),transparent_45%),radial-gradient(circle_at_85%_10%,rgba(255,210,31,0.18),transparent_40%)]" />
        <div className="container-page relative grid gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/85">
              <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
              DPD KNPI Kabupaten Morowali
            </div>
            <h1 className="mt-5 max-w-2xl text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-[56px]">
              {settings.tagline.split(",").map((part, index, array) => (
                <span key={part} className={index === array.length - 1 ? "text-accent" : undefined}>
                  {part}
                  {index < array.length - 1 ? "," : ""}
                </span>
              ))}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
              Wadah berhimpun pemuda dan organisasi kepemudaan Kabupaten Morowali. Daftar anggota,
              ikuti kegiatan, dan sampaikan aspirasi dalam satu platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/anggota/daftar" className="btn-accent px-6">
                Daftar Jadi Anggota
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/anggota/cek"
                className="btn border border-white/25 bg-white/5 px-6 text-white hover:bg-white/10"
              >
                Cek Kartu Anggota
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-accent" aria-hidden />
                Pendaftaran gratis
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-accent" aria-hidden />
                Kartu anggota digital
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-accent" aria-hidden />
                Aspirasi ditindaklanjuti
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-3 rounded-[28px] bg-accent/15 blur-xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[24px] border border-white/15 bg-white/5 p-2 shadow-2xl">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] sm:aspect-[5/4] lg:aspect-[4/5]">
                <Image
                  src={settings.heroImage}
                  alt="Pengurus DPD KNPI Kabupaten Morowali"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover object-top"
                  priority
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/95 via-navy/40 to-transparent p-5 pt-16">
                  <div className="text-base font-extrabold">{settings.chairmanName}</div>
                  <div className="text-xs text-slate-300">{settings.chairmanTitle}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-8 pb-4">
        <div className="container-page grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: memberCount, label: "Anggota terdaftar" },
            { value: DISTRICTS.length, label: "Kecamatan terjangkau" },
            { value: okpCount, label: "OKP & sayap anggota" },
            { value: eventCount, label: "Kegiatan tahun ini" },
          ].map((item) => (
            <div key={item.label} className="surface px-5 py-5">
              <div className="text-3xl font-extrabold tracking-tight text-brand-600">
                {formatNumber(item.value)}
              </div>
              <div className="mt-1 text-sm text-muted">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-14">
        <SectionTitle
          eyebrow="Kabar terbaru"
          title="Berita & kegiatan pemuda"
          description="Informasi resmi kegiatan, pernyataan organisasi, dan capaian pemuda Morowali."
          action={
            <Link href="/berita" className="btn-outline">
              Lihat semua
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          }
        />

        {featured ? (
          <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
            <Link
              href={`/berita/${featured.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-navy text-white shadow-card"
            >
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={featured.coverImage ?? "/images/hero.jpg"}
                  alt={featured.title}
                  fill
                  sizes="(min-width: 1024px) 65vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/55 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <Badge tone="accent">{featured.category}</Badge>
                <h3 className="mt-3 text-2xl font-extrabold leading-snug sm:text-3xl">
                  {featured.title}
                </h3>
                <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-slate-300">{featured.excerpt}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-300">
                  <CalendarDays className="h-4 w-4" aria-hidden />
                  {featured.publishedAt ? formatDate(featured.publishedAt) : ""}
                </div>
              </div>
            </Link>

            <div className="grid gap-4">
              {rest.length ? (
                rest.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/berita/${item.slug}`}
                    className="surface group flex gap-4 p-4 transition hover:border-brand-200"
                  >
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                      <Image
                        src={item.coverImage ?? "/images/hero.jpg"}
                        alt=""
                        fill
                        sizes="96px"
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold uppercase tracking-wide text-brand-600">
                        {item.category}
                      </div>
                      <h3 className="mt-1 line-clamp-3 text-sm font-bold leading-snug text-navy group-hover:text-brand-600">
                        {item.title}
                      </h3>
                      <div className="mt-2 text-xs text-muted">
                        {item.publishedAt ? formatDate(item.publishedAt) : ""}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="surface flex h-full items-center justify-center p-8 text-sm text-muted">
                  Belum ada berita lain.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="surface p-10 text-center text-sm text-muted">Belum ada berita terbit.</div>
        )}
      </section>

      <section className="bg-canvas py-14">
        <div className="container-page grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <SectionTitle
              eyebrow="Agenda"
              title="Kegiatan terdekat"
              action={
                <Link href="/agenda" className="text-sm font-bold text-brand-600 hover:underline">
                  Semua agenda
                </Link>
              }
            />
            <div className="space-y-3">
              {agendas.length ? (
                agendas.map((agenda) => {
                  const start = new Date(agenda.startsAt);
                  return (
                    <Link
                      key={agenda.id}
                      href={`/agenda/${agenda.slug}`}
                      className="surface flex items-center gap-4 p-4 transition hover:border-brand-200"
                    >
                      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                        <span className="text-xl font-extrabold leading-none">{start.getDate()}</span>
                        <span className="mt-1 text-[11px] font-bold uppercase">
                          {new Intl.DateTimeFormat("id-ID", { month: "short" }).format(start)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-bold text-navy">{agenda.title}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" aria-hidden />
                            {agenda.location}
                          </span>
                          <span>
                            {new Intl.DateTimeFormat("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: "Asia/Makassar",
                            }).format(start)}{" "}
                            WITA
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="surface p-8 text-center text-sm text-muted">
                  Belum ada agenda terjadwal.
                </div>
              )}
            </div>
          </div>

          <div>
            <SectionTitle
              eyebrow="Organisasi"
              title="OKP & sayap KNPI"
              action={
                <Link href="/organisasi" className="text-sm font-bold text-brand-600 hover:underline">
                  Semua OKP
                </Link>
              }
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {organizations.map((organization) => (
                <div key={organization.id} className="surface p-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                      <Users className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-navy">{organization.name}</div>
                      <div className="text-[11px] text-muted">
                        {organization.type === "OKP" ? "OKP" : organization.type === "SAYAP" ? "Sayap" : "DPD"}
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">
                    {organization.description ?? "Organisasi kepemudaan mitra KNPI Morowali."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {galleryItems.length ? (
        <section className="container-page py-14">
          <SectionTitle
            eyebrow="Galeri"
            title="Potret kegiatan"
            action={
              <Link href="/galeri" className="btn-outline">
                Buka galeri
              </Link>
            }
          />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {galleryItems.map((item) => (
              <div key={item.id} className="group relative aspect-square overflow-hidden rounded-2xl bg-canvas">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/85 to-transparent p-3 pt-10">
                  <div className="line-clamp-1 text-xs font-semibold text-white">{item.title}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="container-page pb-6">
        <div className="relative overflow-hidden rounded-2xl bg-brand-600 px-6 py-10 text-white sm:px-10">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/20 blur-2xl" aria-hidden />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent">
                <Megaphone className="h-4 w-4" aria-hidden />
                Suara pemuda
              </div>
              <h2 className="mt-2 max-w-2xl text-2xl font-extrabold sm:text-3xl">
                Punya aspirasi untuk pemuda Morowali?
              </h2>
              <p className="mt-2 max-w-xl text-sm text-brand-100">
                Sampaikan langsung ke DPD KNPI Kabupaten Morowali. Setiap aspirasi dicatat dan
                ditindaklanjuti oleh pengurus.
              </p>
            </div>
            <Link href="/aspirasi" className="btn-accent px-6">
              Kirim Aspirasi
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
