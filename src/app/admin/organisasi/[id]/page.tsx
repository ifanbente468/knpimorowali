import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { updateOrganizationAction } from "@/actions/admin";
import { OrganizationForm } from "@/components/admin/organization-form";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function EditOrganizationPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const organization = await prisma.organization.findUnique({ where: { id } });
  if (!organization) notFound();

  return (
    <div className="max-w-3xl">
      <Link href="/admin/organisasi" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Organisasi
      </Link>
      <PageHeader title="Edit organisasi" description={organization.name} />
      <div className="surface p-6">
        <OrganizationForm
          action={updateOrganizationAction}
          submitLabel="Simpan perubahan"
          organization={{
            id: organization.id,
            name: organization.name,
            type: organization.type,
            leader: organization.leader,
            address: organization.address,
            phone: organization.phone,
            email: organization.email,
            website: organization.website,
            logoUrl: organization.logoUrl,
            description: organization.description,
            sortOrder: organization.sortOrder,
            isActive: organization.isActive,
          }}
        />
      </div>
    </div>
  );
}
