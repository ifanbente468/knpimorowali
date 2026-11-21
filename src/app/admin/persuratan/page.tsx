import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { createLetterAction, deleteLetterAction } from "@/actions/admin";
import { AdminNotice } from "@/components/admin-notice";
import { LetterForm } from "@/components/admin/letter-form";
import { Badge, EmptyState, PageHeader } from "@/components/ui";
import { LETTER_TYPE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminLettersPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const letters = await prisma.letter.findMany({ orderBy: { date: "desc" }, take: 200 });

  return (
    <>
      <PageHeader title="Persuratan" description="Arsip surat masuk dan surat keluar." />
      <AdminNotice notice={params.notice} error={params.error} />

      <details className="surface mb-6 p-5">
        <summary className="cursor-pointer text-sm font-bold text-brand-600">
          <PlusCircle className="mr-1 inline h-4 w-4" aria-hidden />
          Catat surat baru
        </summary>
        <div className="mt-5 border-t border-line pt-5">
          <LetterForm action={createLetterAction} submitLabel="Simpan surat" />
        </div>
      </details>

      {letters.length ? (
        <div className="table-wrap">
          <table className="table-base">
            <thead>
              <tr>
                <th>Nomor</th>
                <th>Perihal</th>
                <th>Jenis</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {letters.map((letter) => (
                <tr key={letter.id}>
                  <td className="whitespace-nowrap font-mono text-xs text-muted">{letter.number}</td>
                  <td>
                    <Link href={`/admin/persuratan/${letter.id}`} className="font-semibold text-navy hover:text-brand-600">
                      {letter.subject}
                    </Link>
                    <div className="text-xs text-muted">{letter.sender} → {letter.recipient}</div>
                  </td>
                  <td>
                    <Badge tone={letter.type === "INCOMING" ? "brand" : "accent"}>{LETTER_TYPE_LABELS[letter.type]}</Badge>
                  </td>
                  <td className="whitespace-nowrap text-muted">{formatDate(letter.date)}</td>
                  <td>
                    <Badge tone={letter.status === "PROCESSED" ? "success" : letter.status === "ARCHIVED" ? "neutral" : "warning"}>
                      {letter.status === "PROCESSED" ? "Diproses" : letter.status === "ARCHIVED" ? "Arsip" : "Diterima"}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Link href={`/admin/persuratan/${letter.id}`} className="btn-outline min-h-9 px-3 text-xs">Edit</Link>
                      <form action={deleteLetterAction}>
                        <input type="hidden" name="id" value={letter.id} />
                        <button type="submit" className="btn-ghost min-h-9 px-3 text-xs text-danger hover:bg-red-50">Hapus</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="Belum ada surat" description="Catat surat masuk atau keluar pertama." />
      )}
    </>
  );
}
