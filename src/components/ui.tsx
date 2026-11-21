import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("surface p-5", className)}>{children}</div>;
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <div className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
            {eyebrow}
          </div>
        ) : null}
        <h2 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

const badgeTones = {
  neutral: "bg-canvas text-muted",
  brand: "bg-brand-50 text-brand-700",
  success: "bg-emerald-50 text-success",
  warning: "bg-amber-50 text-warning",
  danger: "bg-red-50 text-danger",
  accent: "bg-yellow-100 text-navy",
} as const;

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof badgeTones;
  className?: string;
}) {
  return <span className={cn("badge", badgeTones[tone], className)}>{children}</span>;
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-field bg-canvas/60 px-6 py-14 text-center">
      <h3 className="text-base font-bold text-navy">{title}</h3>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function Alert({
  tone = "info",
  children,
}: {
  tone?: "info" | "success" | "danger" | "warning";
  children: ReactNode;
}) {
  const tones = {
    info: "border-brand-200 bg-brand-50 text-brand-800",
    success: "border-emerald-200 bg-emerald-50 text-success",
    danger: "border-red-200 bg-red-50 text-danger",
    warning: "border-amber-200 bg-amber-50 text-warning",
  };
  return (
    <div role="status" className={cn("rounded-xl border px-4 py-3 text-sm", tones[tone])}>
      {children}
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (item) => item === 1 || item === totalPages || Math.abs(item - page) <= 1,
  );

  return (
    <nav aria-label="Navigasi halaman" className="mt-5 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={buildHref(page - 1)} className="btn-outline min-h-9 px-3 text-xs">
          Sebelumnya
        </Link>
      ) : null}
      {pages.map((item, index) => {
        const previous = pages[index - 1];
        const gap = previous && item - previous > 1;
        return (
          <span key={item} className="flex items-center gap-2">
            {gap ? <span className="text-xs text-muted">…</span> : null}
            <Link
              href={buildHref(item)}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-bold",
                item === page
                  ? "bg-brand-600 text-white"
                  : "border border-field bg-white text-navy hover:bg-canvas",
              )}
            >
              {item}
            </Link>
          </span>
        );
      })}
      {page < totalPages ? (
        <Link href={buildHref(page + 1)} className="btn-outline min-h-9 px-3 text-xs">
          Berikutnya
        </Link>
      ) : null}
    </nav>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "brand",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "brand" | "warning" | "success" | "danger";
}) {
  const colors = {
    brand: "text-brand-600",
    warning: "text-warning",
    success: "text-success",
    danger: "text-danger",
  };
  return (
    <div className="surface p-5">
      <div className="text-[13px] text-muted">{label}</div>
      <div className={cn("mt-1 text-3xl font-extrabold tracking-tight", colors[tone])}>{value}</div>
      {hint ? <div className="mt-1 text-xs text-muted">{hint}</div> : null}
    </div>
  );
}
