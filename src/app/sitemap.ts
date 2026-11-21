import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  const [news, agendas] = await Promise.all([
    prisma.news.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
      take: 500,
    }),
    prisma.agenda.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
      orderBy: { startsAt: "desc" },
      take: 200,
    }),
  ]);

  const staticRoutes = [
    "",
    "/profil",
    "/organisasi",
    "/berita",
    "/agenda",
    "/galeri",
    "/aspirasi",
    "/anggota/daftar",
    "/anggota/cek",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  return [
    ...staticRoutes,
    ...news.map((item) => ({
      url: `${base}/berita/${item.slug}`,
      lastModified: item.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...agendas.map((item) => ({
      url: `${base}/agenda/${item.slug}`,
      lastModified: item.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
