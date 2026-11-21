import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Mail, Phone, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Organisasi",
  description:
    "Daftar organisasi kepemudaan (OKP), DPD, dan sayap yang berhimpun di KNPI Kabupaten Morowali.",
};

const TYPE_LABELS = {
  DPD: "Dewan Pengurus Daerah",
  OKP: "Organisasi Kepemudaan",
  SAYAP: "Sayap Organisasi",
} as const;

export default async function OrganisasiPage() {
  const organizations = await prisma.organization.findMany({
    where: { isActive: true },
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });

  const groups = (["DPD", "OKP", "SAYAP"] as const).map((type) => ({
    type,
    label: TYPE_LABELS[type],
    items: organizations.filter((item) => item.type === type),
  }));

  return (
    <>
      <section className="border-b border-line bg-canvas py-12">
        <div className="container-page">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Jejaring</div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
            Organisasi mitra KNPI Morowali
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Bersama OKP dan sayap organisasi, KNPI Morowali memperkuat kaderisasi dan kegiatan
            kepemudaan lintas kecamatan.
          </p>
        </div>
      </section>

      <div className="container-page space-y-12 py-12">
        {groups.map((group) =>
          group.items.length ? (
            <section key={group.type}>
              <div className="mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-brand-600" aria-hidden />
                <h2 className="text-xl font-extrabold text-navy">{group.label}</h2>
                <Badge tone="brand">{group.items.length}</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((organization) => (
                  <article key={organization.id} className="surface flex flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-navy">{organization.name}</h3>
                        {organization.leader ? (
                          <p className="mt-1 text-xs text-muted">Ketua: {organization.leader}</p>
                        ) : null}
                      </div>
                      <Badge tone={organization.type === "DPD" ? "brand" : "neutral"}>
                        {group.type}
                      </Badge>
                    </div>
                    <p className="mt-3 flex-1 text-sm leading-6 text-muted">
                      {organization.description ?? "Organisasi kepemudaan mitra KNPI Morowali."}
                    </p>
                    <div className="mt-4 space-y-1 border-t border-line pt-3 text-xs text-muted">
                      {organization.phone ? (
                        <p className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5" aria-hidden />
                          {organization.phone}
                        </p>
                      ) : null}
                      {organization.email ? (
                        <p className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5" aria-hidden />
                          <a href={`mailto:${organization.email}`} className="hover:text-brand-600">
                            {organization.email}
                          </a>
                        </p>
                      ) : null}
                      {organization.website ? (
                        <a
                          href={organization.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-brand-600 hover:underline"
                        >
                          Kunjungi situs
                        </a>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null,
        )}

        {organizations.length === 0 ? (
          <div className="surface p-10 text-center text-sm text-muted">
            Data organisasi belum tersedia.
          </div>
        ) : null}

        <section className="rounded-2xl bg-brand-600 px-6 py-10 text-white sm:px-10">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent">
                <Users className="h-4 w-4" aria-hidden />
                Bergabung
              </div>
              <h2 className="mt-2 text-2xl font-extrabold">Organisasi Anda belum terdaftar?</h2>
              <p className="mt-2 max-w-xl text-sm text-brand-100">
                Daftarkan organisasi kepemudaan Anda sebagai mitra KNPI Kabupaten Morowali.
              </p>
            </div>
            <Link href="/aspirasi" className="btn-accent">
              Hubungi sekretariat
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
