import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createAgendaAction } from "@/actions/content";
import { AgendaForm } from "@/components/admin/agenda-form";
import { PageHeader } from "@/components/ui";

export default function NewAgendaPage() {
  return (
    <div className="max-w-3xl">
      <Link href="/admin/agenda" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Daftar agenda
      </Link>
      <PageHeader title="Tambah agenda" description="Jadwalkan kegiatan baru." />
      <AgendaForm action={createAgendaAction} submitLabel="Simpan agenda" />
    </div>
  );
}
