import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ChevronLeft, Share2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui";
import { RichText } from "@/components/rich-text";

export const revalidate = 60;

async function getNews(slug: string) {
  return prisma.news.findFirst({
    where: { slug, status: "PUBLISHED", publishedAt: { not: null } },
    include: { author: { select: { name: true } } },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNews(slug);
  if (!news) return { title: "Berita tidak ditemukan" };

  return {
    title: news.title,
    description: news.excerpt,
    openGraph: {
      type: "article",
      title: news.title,
      description: news.excerpt,
      publishedTime: news.publishedAt?.toISOString(),
      images: news.coverImage ? [{ url: news.coverImage }] : undefined,
    },
  };
}

export default async function BeritaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const news = await getNews(slug);
  if (!news) notFound();

  const related = await prisma.news.findMany({
    where: { status: "PUBLISHED", slug: { not: slug }, category: news.category },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: { slug: true, title: true, coverImage: true, publishedAt: true },
  });

  const shareUrl = `${process.env.APP_URL ?? ""}/berita/${news.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: news.title,
    description: news.excerpt,
    image: news.coverImage ?? undefined,
    datePublished: news.publishedAt?.toISOString(),
    dateModified: news.updatedAt.toISOString(),
    author: { "@type": "Organization", name: "DPD KNPI Kabupaten Morowali" },
    publisher: {
      "@type": "Organization",
      name: "KNPI Morowali",
      logo: { "@type": "ImageObject", url: `${process.env.APP_URL ?? ""}/images/logo.jpg` },
    },
    mainEntityOfPage: shareUrl,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <article>
        <div className="border-b border-line bg-canvas py-10">
          <div className="container-page max-w-3xl">
            <Link href="/berita" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Semua berita
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Badge tone="brand">{news.category}</Badge>
              <span className="flex items-center gap-1.5 text-xs text-muted">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                {news.publishedAt ? formatDate(news.publishedAt) : ""}
              </span>
              <span className="text-xs text-muted">Oleh {news.author.name}</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-navy sm:text-4xl">
              {news.title}
            </h1>
            <p className="mt-4 text-base leading-7 text-muted">{news.excerpt}</p>
          </div>
        </div>

        <div className="container-page max-w-3xl py-10">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-canvas">
            <Image
              src={news.coverImage ?? "/images/hero.jpg"}
              alt={news.title}
              fill
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
              priority
            />
          </div>

          <div className="mt-8">
            <RichText content={news.content} />
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <div className="text-sm text-muted">
              Terakhir diperbarui {formatDate(news.updatedAt)}
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-semibold text-muted">
                <Share2 className="h-3.5 w-3.5" aria-hidden />
                Bagikan
              </span>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${news.title} ${shareUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline min-h-9 px-3 text-xs"
              >
                WhatsApp
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline min-h-9 px-3 text-xs"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>
      </article>

      {related.length ? (
        <section className="bg-canvas py-12">
          <div className="container-page">
            <h2 className="mb-5 text-xl font-extrabold text-navy">Berita terkait</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map((item) => (
                <Link key={item.slug} href={`/berita/${item.slug}`} className="surface group overflow-hidden">
                  <div className="relative aspect-[16/9] bg-canvas">
                    <Image
                      src={item.coverImage ?? "/images/hero.jpg"}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 33vw, 100vw"
                      className="object-cover transition group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 text-sm font-bold text-navy group-hover:text-brand-600">
                      {item.title}
                    </h3>
                    <div className="mt-2 text-xs text-muted">
                      {item.publishedAt ? formatDate(item.publishedAt) : ""}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
