import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { createFinanceAction, deleteFinanceAction } from "@/actions/admin";
import { AdminNotice } from "@/components/admin-notice";
import { ActionForm } from "@/components/action-form";
import { Badge, EmptyState, PageHeader, StatCard } from "@/components/ui";
import { FINANCE_CATEGORIES } from "@/lib/constants";
import { formatCurrency, formatDate, toDateInput } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminFinancePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; notice?: string; error?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const type = (["INCOME", "EXPENSE"] as const).find((item) => item === params.type);

  const [items, income, expense] = await Promise.all([
    prisma.finance.findMany({
      where: type ? { type } : {},
      orderBy: { date: "desc" },
      take: 200,
    }),
    prisma.finance.aggregate({ where: { type: "INCOME" }, _sum: { amount: true } }),
    prisma.finance.aggregate({ where: { type: "EXPENSE" }, _sum: { amount: true } }),
  ]);

  const totalIncome = income._sum.amount ?? 0;
  const totalExpense = expense._sum.amount ?? 0;
  const balance = totalIncome - totalExpense;

  return (
    <>
      <PageHeader title="Keuangan" description="Catatan pemasukan dan pengeluaran organisasi." />
      <AdminNotice notice={params.notice} error={params.error} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total pemasukan" value={formatCurrency(totalIncome)} tone="success" />
        <StatCard label="Total pengeluaran" value={formatCurrency(totalExpense)} tone="danger" />
        <StatCard label="Saldo" value={formatCurrency(balance)} tone={balance >= 0 ? "brand" : "danger"} />
      </div>

      <details className="surface my-6 p-5">
        <summary className="cursor-pointer text-sm font-bold text-brand-600">
          <PlusCircle className="mr-1 inline h-4 w-4" aria-hidden />
          Catat transaksi baru
        </summary>
        <div className="mt-5 border-t border-line pt-5">
          <ActionForm action={createFinanceAction} submitLabel="Simpan transaksi">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="date" className="label">Tanggal</label>
                <input id="date" name="date" type="date" className="input" defaultValue={toDateInput(new Date())} required />
              </div>
              <div>
                <label htmlFor="type" className="label">Jenis</label>
                <select id="type" name="type" className="select" defaultValue="INCOME">
                  <option value="INCOME">Pemasukan</option>
                  <option value="EXPENSE">Pengeluaran</option>
                </select>
              </div>
              <div>
                <label htmlFor="category" className="label">Kategori</label>
                <select id="category" name="category" className="select" defaultValue="Iuran Anggota">
                  {FINANCE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="amount" className="label">Nominal (Rp)</label>
                <input id="amount" name="amount" type="number" min={1} step={1} className="input" required />
              </div>
            </div>
            <div>
              <label htmlFor="description" className="label">Keterangan</label>
              <input id="description" name="description" className="input" required maxLength={300} />
            </div>
            <div>
              <label htmlFor="reference" className="label">Referensi (opsional)</label>
              <input id="reference" name="reference" className="input" maxLength={120} />
            </div>
          </ActionForm>
        </div>
      </details>

      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/admin/keuangan" className={`rounded-full px-4 py-2 text-xs font-bold ${!type ? "bg-brand-600 text-white" : "border border-field bg-white text-navy"}`}>Semua</Link>
        <Link href="/admin/keuangan?type=INCOME" className={`rounded-full px-4 py-2 text-xs font-bold ${type === "INCOME" ? "bg-brand-600 text-white" : "border border-field bg-white text-navy"}`}>Pemasukan</Link>
        <Link href="/admin/keuangan?type=EXPENSE" className={`rounded-full px-4 py-2 text-xs font-bold ${type === "EXPENSE" ? "bg-brand-600 text-white" : "border border-field bg-white text-navy"}`}>Pengeluaran</Link>
      </div>

      {items.length ? (
        <div className="table-wrap">
          <table className="table-base">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Keterangan</th>
                <th>Kategori</th>
                <th>Jenis</th>
                <th className="text-right">Nominal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="whitespace-nowrap text-muted">{formatDate(item.date)}</td>
                  <td>
                    <div className="font-semibold text-navy">{item.description}</div>
                    {item.reference ? <div className="text-xs text-muted">Ref. {item.reference}</div> : null}
                  </td>
                  <td className="text-muted">{item.category}</td>
                  <td>
                    <Badge tone={item.type === "INCOME" ? "success" : "danger"}>
                      {item.type === "INCOME" ? "Masuk" : "Keluar"}
                    </Badge>
                  </td>
                  <td className={`whitespace-nowrap text-right font-bold ${item.type === "INCOME" ? "text-success" : "text-danger"}`}>
                    {item.type === "INCOME" ? "+" : "−"} {formatCurrency(item.amount)}
                  </td>
                  <td>
                    <form action={deleteFinanceAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <button type="submit" className="btn-ghost min-h-9 px-3 text-xs text-danger hover:bg-red-50">Hapus</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="Belum ada transaksi" description="Catat pemasukan atau pengeluaran pertama." />
      )}
    </>
  );
}
