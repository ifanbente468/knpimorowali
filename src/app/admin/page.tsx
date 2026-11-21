import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  CalendarDays,
  MessageSquareWarning,
  Newspaper,
  PlusCircle,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { Badge, PageHeader, StatCard } from "@/components/ui";
import { MEMBER_STATUS_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    activeMembers,
    pendingMembers,
    publishedNews,
    draftNews,
    newAspirations,
    openAspirations,
    upcomingAgendas,
    monthIncome,
    monthExpense,
    pendingList,
    agendaList,
    aspirationList,
    growthMembers,
  ] = await Promise.all([
    prisma.member.count({ where: { status: "ACTIVE" } }),
    prisma.member.count({ where: { status: "PENDING" } }),
    prisma.news.count({ where: { status: "PUBLISHED" } }),
    prisma.news.count({ where: { status: "DRAFT" } }),
    prisma.aspiration.count({ where: { status: "NEW" } }),
    prisma.aspiration.count({ where: { status: { in: ["NEW", "IN_PROGRESS"] } } }),
    prisma.agenda.count({ where: { startsAt: { gte: now }, status: "SCHEDULED", isPublished: true } }),
    prisma.finance.aggregate({ where: { type: "INCOME", date: { gte: startOfMonth } }, _sum: { amount: true } }),
    prisma.finance.aggregate({ where: { type: "EXPENSE", date: { gte: startOfMonth } }, _sum: { amount: true } }),
    prisma.member.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.agenda.findMany({
      where: { startsAt: { gte: now }, status: "SCHEDULED" },
      orderBy: { startsAt: "asc" },
      take: 3,
    }),
    prisma.aspiration.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, trackingCode: true, subject: true, status: true, createdAt: true },
    }),
    prisma.member.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
  ]);

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const count = growthMembers.filter(
      (member) =>
        member.createdAt.getFullYear() === date.getFullYear() &&
        member.createdAt.getMonth() === date.getMonth(),
    ).length;
    return {
      label: new Intl.DateTimeFormat("id-ID", { month: "short" }).format(date),
      count,
    };
  });
  const maxGrowth = Math.max(1, ...months.map((month) => month.count));
  const balance = (monthIncome._sum.amount ?? 0) - (monthExpense._sum.amount ?? 0);

  return (
    <>
      <PageHeader
        title={`Ringkasan${user ? `, ${user.name.split(" ")[0]}` : ""}`}
        description={`Data per ${formatDate(now)} — DPD KNPI Kabupaten Morowali`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/berita/baru" className="btn-primary">
              <PlusCircle className="h-4 w-4" aria-hidden />
              Tulis berita
            </Link>
            <Link href="/admin/agenda/baru" className="btn-outline">
              <CalendarDays className="h-4 w-4" aria-hidden />
              Agenda baru
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Anggota aktif" value={formatNumber(activeMembers)} hint={`${pendingMembers} menunggu verifikasi`} />
        <StatCard label="Berita terbit" value={formatNumber(publishedNews)} hint={`${draftNews} draf`} />
        <StatCard label="Aspirasi baru" value={formatNumber(newAspirations)} hint={`${openAspirations} belum selesai`} tone="warning" />
        <StatCard label="Agenda mendatang" value={formatNumber(upcomingAgendas)} hint="Terjadwal & terbit" tone="success" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section className="surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-navy">Pertumbuhan anggota (6 bulan)</h2>
            <span className="text-xs text-muted">Berdasarkan tanggal daftar</span>
          </div>
          <div className="mt-6 flex h-52 items-end gap-4">
            {months.map((month) => (
              <div key={month.label} className="flex flex-1 flex-col items-center gap-2">
                <div className="text-xs font-bold text-brand-600">{month.count}</div>
                <div className="flex h-40 w-full items-end rounded-lg bg-canvas">
                  <div
                    className="w-full rounded-lg bg-brand-600 transition-all"
                    style={{ height: `${Math.max(4, (month.count / maxGrowth) * 100)}%` }}
                    aria-hidden
                  />
                </div>
                <div className="text-xs text-muted">{month.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-navy">Agenda mendatang</h2>
            <Link href="/admin/agenda" className="text-xs font-bold text-brand-600 hover:underline">
              Kelola
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {agendaList.length ? (
              agendaList.map((agenda) => (
                <div key={agenda.id} className="rounded-xl border border-line p-3">
                  <div className="text-sm font-bold text-navy">{agenda.title}</div>
                  <div className="mt-1 text-xs text-muted">
                    {formatDate(agenda.startsAt)} · {agenda.location}
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-xl bg-canvas p-4 text-sm text-muted">Belum ada agenda mendatang.</p>
            )}
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section className="surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-extrabold text-navy">Pendaftar menunggu verifikasi</h2>
            <Link href="/admin/anggota?status=PENDING" className="text-xs font-bold text-brand-600 hover:underline">
              Lihat semua
            </Link>
          </div>
          <div className="table-wrap rounded-none border-0">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Wilayah</th>
                  <th>Tanggal daftar</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pendingList.length ? (
                  pendingList.map((member) => (
                    <tr key={member.id}>
                      <td>
                        <div className="font-semibold text-navy">{member.user.name}</div>
                        <div className="text-xs text-muted">{member.user.email}</div>
                      </td>
                      <td className="text-muted">{member.district}</td>
                      <td className="whitespace-nowrap text-muted">{formatDate(member.createdAt)}</td>
                      <td>
                        <Link href={`/admin/anggota/${member.id}`} className="btn-outline min-h-9 px-3 text-xs">
                          Tinjau
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-muted">
                      Tidak ada pendaftar menunggu verifikasi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="space-y-5">
          <section className="surface p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-navy">Aspirasi terbaru</h2>
              <Link href="/admin/aspirasi" className="text-xs font-bold text-brand-600 hover:underline">
                Semua
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {aspirationList.length ? (
                aspirationList.map((aspiration) => (
                  <Link key={aspiration.id} href={`/admin/aspirasi/${aspiration.id}`} className="block rounded-xl border border-line p-3 hover:border-brand-200">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-muted">{aspiration.trackingCode}</span>
                      <Badge tone={aspiration.status === "NEW" ? "warning" : aspiration.status === "RESOLVED" ? "success" : "brand"}>
                        {aspiration.status === "NEW" ? "Baru" : aspiration.status === "IN_PROGRESS" ? "Diproses" : aspiration.status === "RESOLVED" ? "Selesai" : "Ditolak"}
                      </Badge>
                    </div>
                    <div className="mt-1 line-clamp-2 text-sm font-semibold text-navy">{aspiration.subject}</div>
                    <div className="mt-1 text-xs text-muted">{formatDate(aspiration.createdAt)}</div>
                  </Link>
                ))
              ) : (
                <p className="rounded-xl bg-canvas p-4 text-sm text-muted">Belum ada aspirasi masuk.</p>
              )}
            </div>
          </section>

          {user?.role === "ADMIN" ? (
          <section className="surface p-5">
            <div className="flex items-center gap-2 text-navy">
              <Banknote className="h-4 w-4 text-brand-600" aria-hidden />
              <h2 className="font-extrabold">Keuangan bulan ini</h2>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-emerald-50 p-3">
                <div className="text-[11px] font-semibold uppercase text-success">Pemasukan</div>
                <div className="mt-1 font-bold text-success">{formatCurrency(monthIncome._sum.amount ?? 0)}</div>
              </div>
              <div className="rounded-xl bg-red-50 p-3">
                <div className="text-[11px] font-semibold uppercase text-danger">Pengeluaran</div>
                <div className="mt-1 font-bold text-danger">{formatCurrency(monthExpense._sum.amount ?? 0)}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-line p-3 text-sm">
              <span className="text-muted">Saldo bulan ini</span>
              <span className={`font-extrabold ${balance >= 0 ? "text-success" : "text-danger"}`}>
                {formatCurrency(balance)}
              </span>
            </div>
            <Link href="/admin/keuangan" className="btn-outline mt-3 w-full text-xs">
              Kelola keuangan
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </section>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          { href: "/admin/berita/baru", label: "Tulis berita", icon: Newspaper, tone: "text-brand-600 bg-brand-50" },
          { href: "/admin/anggota?status=PENDING", label: `Verifikasi anggota (${pendingMembers})`, icon: Users, tone: "text-warning bg-amber-50" },
          { href: "/admin/aspirasi?status=NEW", label: "Tanggapi aspirasi", icon: MessageSquareWarning, tone: "text-danger bg-red-50" },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="surface flex items-center gap-3 p-4 hover:border-brand-200">
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.tone}`}>
              <item.icon className="h-4 w-4" aria-hidden />
            </span>
            <span className="text-sm font-bold text-navy">{item.label}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
