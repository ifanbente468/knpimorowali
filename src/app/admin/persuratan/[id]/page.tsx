import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { updateLetterAction } from "@/actions/admin";
import { LetterForm } from "@/components/admin/letter-form";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function EditLetterPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const letter = await prisma.letter.findUnique({ where: { id } });
  if (!letter) notFound();

  return (
    <div className="max-w-3xl">
      <Link href="/admin/persuratan" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Persuratan
      </Link>
      <PageHeader title="Edit surat" description={letter.number} />
      <div className="surface p-6">
        <LetterForm
          action={updateLetterAction}
          submitLabel="Simpan perubahan"
          letter={{
            id: letter.id,
            number: letter.number,
            type: letter.type,
            subject: letter.subject,
            sender: letter.sender,
            recipient: letter.recipient,
            date: letter.date,
            fileUrl: letter.fileUrl,
            status: letter.status,
            notes: letter.notes,
          }}
        />
      </div>
    </div>
  );
}
