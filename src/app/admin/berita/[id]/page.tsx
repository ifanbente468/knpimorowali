import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { updateNewsAction } from "@/actions/content";
import { NewsForm } from "@/components/admin/news-form";
import { AdminNotice } from "@/components/admin-notice";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function EditNewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { id } = await params;
  const notices = await searchParams;
  const news = await prisma.news.findUnique({ where: { id } });
  if (!news) notFound();

  return (
    <div className="max-w-4xl">
      <Link href="/admin/berita" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Daftar berita
      </Link>
      <PageHeader title="Edit berita" description={news.title} />
      <AdminNotice notice={notices.notice} error={notices.error} />
      <NewsForm
        action={updateNewsAction}
        submitLabel="Simpan perubahan"
        news={{
          id: news.id,
          title: news.title,
          slug: news.slug,
          excerpt: news.excerpt,
          content: news.content,
          category: news.category,
          coverImage: news.coverImage,
          status: news.status,
        }}
      />
    </div>
  );
}
