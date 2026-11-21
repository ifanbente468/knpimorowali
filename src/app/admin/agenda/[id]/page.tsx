import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { updateAgendaAction } from "@/actions/content";
import { AgendaForm } from "@/components/admin/agenda-form";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function EditAgendaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agenda = await prisma.agenda.findUnique({ where: { id } });
  if (!agenda) notFound();

  return (
    <div className="max-w-3xl">
      <Link href="/admin/agenda" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Daftar agenda
      </Link>
      <PageHeader title="Edit agenda" description={agenda.title} />
      <AgendaForm
        action={updateAgendaAction}
        submitLabel="Simpan perubahan"
        agenda={{
          id: agenda.id,
          title: agenda.title,
          description: agenda.description,
          location: agenda.location,
          startsAt: agenda.startsAt,
          endsAt: agenda.endsAt,
          capacity: agenda.capacity,
          status: agenda.status,
          isPublished: agenda.isPublished,
        }}
      />
    </div>
  );
}
