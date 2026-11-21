import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createNewsAction } from "@/actions/content";
import { NewsForm } from "@/components/admin/news-form";
import { PageHeader } from "@/components/ui";

export default function NewNewsPage() {
  return (
    <div className="max-w-4xl">
      <Link href="/admin/berita" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Daftar berita
      </Link>
      <PageHeader title="Tulis berita" description="Simpan sebagai draf atau langsung terbitkan." />
      <NewsForm action={createNewsAction} submitLabel="Simpan berita" />
    </div>
  );
}
