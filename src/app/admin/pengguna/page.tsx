import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import {
  deleteUserAction,
  resetUserPasswordAction,
  updateUserAction,
} from "@/actions/members";
import { ActionForm } from "@/components/action-form";
import { Badge, PageHeader } from "@/components/ui";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await prisma.user.findMany({
    include: { member: { select: { status: true, memberNo: true } } },
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    take: 200,
  });

  return (
    <>
      <PageHeader
        title="Pengguna & hak akses"
        description="Kelola peran administrator, editor, dan anggota."
      />

      <div className="space-y-3">
        {users.map((user) => (
          <section key={user.id} className="surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-bold text-navy">{user.name}</h2>
                  <Badge tone={user.role === "ADMIN" ? "brand" : user.role === "EDITOR" ? "accent" : "neutral"}>
                    {ROLE_LABELS[user.role]}
                  </Badge>
                  <Badge tone={user.isActive ? "success" : "danger"}>
                    {user.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                  {user.member ? (
                    <Badge tone={user.member.status === "ACTIVE" ? "success" : "warning"}>
                      {user.member.status}
                    </Badge>
                  ) : null}
                </div>
                <div className="mt-1 text-sm text-muted">{user.email}</div>
                <div className="mt-1 text-xs text-muted">
                  {user.member?.memberNo ? `${user.member.memberNo} · ` : ""}
                  Daftar {formatDate(user.createdAt)} · Login terakhir{" "}
                  {user.lastLoginAt ? formatDate(user.lastLoginAt) : "belum pernah"}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 border-t border-line pt-4 lg:grid-cols-2">
              <ActionForm action={updateUserAction} submitLabel="Simpan akses" submitClassName="btn-outline">
                <input type="hidden" name="userId" value={user.id} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor={`role-${user.id}`} className="label">Peran</label>
                    <select id={`role-${user.id}`} name="role" className="select" defaultValue={user.role}>
                      <option value="MEMBER">Anggota</option>
                      <option value="EDITOR">Editor</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </div>
                  <label className="flex items-end gap-2 pb-3 text-sm font-semibold text-navy">
                    <input type="checkbox" name="isActive" defaultChecked={user.isActive} className="h-4 w-4 rounded border-field" />
                    Akun aktif
                  </label>
                </div>
              </ActionForm>

              <div className="space-y-3">
                <ActionForm action={resetUserPasswordAction} submitLabel="Reset kata sandi" submitClassName="btn-outline">
                  <input type="hidden" name="userId" value={user.id} />
                  <p className="text-xs text-muted">
                    Kata sandi sementara ditampilkan sekali setelah reset. Sesi pengguna akan dihentikan.
                  </p>
                </ActionForm>
                <form action={deleteUserAction}>
                  <input type="hidden" name="userId" value={user.id} />
                  <button type="submit" className="btn-ghost min-h-9 px-3 text-xs text-danger hover:bg-red-50">
                    Hapus pengguna
                  </button>
                </form>
              </div>
            </div>
          </section>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted">
        Administrator tidak dapat mengubah peran/status akunnya sendiri. Minimal satu administrator
        aktif harus tersisa. <Link href="/akun" className="font-semibold text-brand-600 hover:underline">Ubah kata sandi akun sendiri</Link>.
      </p>
    </>
  );
}
