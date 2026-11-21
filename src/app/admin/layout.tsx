import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth";
import { AdminShell } from "@/components/admin-shell";

export const metadata: Metadata = {
  title: { default: "Panel Admin", template: "%s — Admin KNPI Morowali" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  return (
    <AdminShell user={{ name: user.name, email: user.email, role: user.role }}>
      {children}
    </AdminShell>
  );
}
