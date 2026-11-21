export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-5" aria-busy="true" aria-label="Memuat">
      <div className="h-8 w-56 rounded-lg bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 rounded-2xl border border-line bg-white" />
        ))}
      </div>
      <div className="h-72 rounded-2xl border border-line bg-white" />
    </div>
  );
}
