import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Target, Eye, Flag, MapPin } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/db";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Profil",
  description:
    "Profil DPD KNPI Kabupaten Morowali: sejarah, visi, misi, dan komitmen untuk pemuda Morowali.",
};

const programs = [
  {
    title: "Kaderisasi & Kepemimpinan",
    description:
      "Pelatihan kepemimpinan, manajemen organisasi, dan pendampingan kader muda lintas kecamatan.",
  },
  {
    title: "Ekonomi Kreatif Pemuda",
    description:
      "Penguatan usaha muda, literasi digital, dan akses pasar bagi komunitas kreatif Morowali.",
  },
  {
    title: "Sosial & Relawan",
    description:
      "Aksi kemanusiaan, relawan siaga bencana, dan bakti sosial bersama OKP mitra.",
  },
  {
    title: "Aspirasi & Advokasi",
    description:
      "Menjembatani suara pemuda ke pemerintah daerah dan pemangku kepentingan.",
  },
];

export default async function ProfilPage() {
  const settings = await getSettings();
  const [memberCount, okpCount, districtCount] = await Promise.all([
    prisma.member.count({ where: { status: "ACTIVE" } }),
    prisma.organization.count({ where: { isActive: true } }),
    prisma.member.findMany({ where: { status: "ACTIVE" }, distinct: ["district"], select: { district: true } }),
  ]);

  return (
    <>
      <section className="bg-navy py-16 text-white">
        <div className="container-page grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Tentang kami</div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Rumah bersama pemuda Kabupaten Morowali
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              DPD KNPI Kabupaten Morowali adalah wadah berhimpun organisasi kepemudaan dan pemuda
              Morowali. Kami mendorong kolaborasi lintas organisasi untuk kaderisasi, karya nyata,
              dan kontribusi bagi masyarakat.
            </p>
            <div className="mt-8 grid max-w-lg grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-extrabold text-accent">{formatNumber(memberCount)}</div>
                <div className="text-xs text-slate-300">Anggota aktif</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-accent">{okpCount}</div>
                <div className="text-xs text-slate-300">OKP & sayap</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-accent">{districtCount.length || 11}</div>
                <div className="text-xs text-slate-300">Kecamatan</div>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/10">
            <div className="relative aspect-[4/3]">
              <Image
                src={settings.heroImage}
                alt="Pengurus KNPI Morowali"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="text-2xl font-extrabold text-navy">Sambutan Ketua</h2>
            <div className="prose-article mt-4">
              <p className="text-muted">
                {settings.chairmanMessage ||
                  "KNPI Morowali hadir sebagai rumah bersama pemuda. Mari bersinergi, berkarya nyata, dan memberi dampak bagi masyarakat Morowali."}
              </p>
              <p className="font-semibold text-navy">
                {settings.chairmanName}
                <br />
                <span className="text-sm font-normal text-muted">{settings.chairmanTitle}</span>
              </p>
            </div>
          </div>
          <div className="surface p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <MapPin className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <div className="font-bold text-navy">Sekretariat</div>
                <p className="mt-1 text-sm leading-6 text-muted">{settings.address}</p>
                <a href={settings.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold text-brand-600 hover:underline">
                  Lihat lokasi
                </a>
              </div>
            </div>
            <div className="mt-6 border-t border-line pt-5 text-sm text-muted">
              <p>Email: <a href={`mailto:${settings.email}`} className="font-semibold text-brand-600 hover:underline">{settings.email}</a></p>
              <p className="mt-1">Telepon: <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="font-semibold text-brand-600 hover:underline">{settings.phone}</a></p>
            </div>
            <Link href="/aspirasi" className="btn-primary mt-6 w-full">
              Kirim aspirasi
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-canvas py-14">
        <div className="container-page grid gap-5 md:grid-cols-2">
          <div className="surface p-6">
            <div className="flex items-center gap-2 text-brand-600">
              <Eye className="h-5 w-5" aria-hidden />
              <h2 className="text-lg font-extrabold">Visi</h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-muted">
              Terwujudnya pemuda Morowali yang beriman, berkarakter, mandiri, dan berdaya saing,
              serta aktif berkontribusi dalam pembangunan daerah.
            </p>
          </div>
          <div className="surface p-6">
            <div className="flex items-center gap-2 text-brand-600">
              <Flag className="h-5 w-5" aria-hidden />
              <h2 className="text-lg font-extrabold">Misi</h2>
            </div>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted">
              <li>Memperkuat kaderisasi dan kapasitas organisasi kepemudaan.</li>
              <li>Mendorong kolaborasi lintas OKP dan komunitas pemuda.</li>
              <li>Mengembangkan ekonomi kreatif dan keterampilan kerja pemuda.</li>
              <li>Menyalurkan aspirasi pemuda secara konstruktif.</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="mb-6 flex items-center gap-2">
          <Target className="h-5 w-5 text-brand-600" aria-hidden />
          <h2 className="text-2xl font-extrabold text-navy">Bidang kerja</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {programs.map((program) => (
            <div key={program.title} className="surface p-5">
              <h3 className="font-bold text-navy">{program.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{program.description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
