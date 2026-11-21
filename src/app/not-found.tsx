import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="surface max-w-md p-10 text-center">
        <div className="text-sm font-bold uppercase tracking-widest text-brand-600">404</div>
        <h1 className="mt-2 text-2xl font-extrabold">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-sm text-muted">
          Halaman yang Anda cari mungkin sudah dipindahkan atau tidak tersedia.
        </p>
        <Link href="/" className="btn-primary mt-6">
          Kembali ke beranda
        </Link>
      </div>
    </main>
  );
}
