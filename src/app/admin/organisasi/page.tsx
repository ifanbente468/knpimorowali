import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { createOrganizationAction, deleteOrganizationAction } from "@/actions/admin";
import { AdminNotice } from "@/components/admin-notice";
import { OrganizationForm } from "@/components/admin/organization-form";
import { Badge, EmptyState, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AdminOrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const organizations = await prisma.organization.findMany({
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <>
      <PageHeader title="Organisasi" description="Kelola DPD, OKP mitra, dan sayap organisasi." />
      <AdminNotice notice={params.notice} error={params.error} />

      <details className="surface mb-6 p-5">
        <summary className="cursor-pointer text-sm font-bold text-brand-600">
          <PlusCircle className="mr-1 inline h-4 w-4" aria-hidden />
          Tambah organisasi
        </summary>
        <div className="mt-5 border-t border-line pt-5">
          <OrganizationForm action={createOrganizationAction} submitLabel="Tambah organisasi" />
        </div>
      </details>

      {organizations.length ? (
        <div className="table-wrap">
          <table className="table-base">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Tipe</th>
                <th>Ketua</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((organization) => (
                <tr key={organization.id}>
                  <td className="font-semibold text-navy">{organization.name}</td>
                  <td><Badge tone={organization.type === "DPD" ? "brand" : "neutral"}>{organization.type}</Badge></td>
                  <td className="text-muted">{organization.leader ?? "—"}</td>
                  <td><Badge tone={organization.isActive ? "success" : "warning"}>{organization.isActive ? "Aktif" : "Nonaktif"}</Badge></td>
                  <td>
                    <div className="flex gap-2">
                      <Link href={`/admin/organisasi/${organization.id}`} className="btn-outline min-h-9 px-3 text-xs">Edit</Link>
                      <form action={deleteOrganizationAction}>
                        <input type="hidden" name="id" value={organization.id} />
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
        <EmptyState title="Belum ada organisasi" />
      )}
    </>
  );
}
