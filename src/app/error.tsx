"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="surface max-w-md p-10 text-center">
        <div className="text-sm font-bold uppercase tracking-widest text-danger">Terjadi kesalahan</div>
        <h1 className="mt-2 text-2xl font-extrabold">Maaf, ada gangguan</h1>
        <p className="mt-3 text-sm text-muted">
          Silakan coba lagi. Jika masalah berlanjut, hubungi sekretariat KNPI Morowali.
        </p>
        <button type="button" onClick={reset} className="btn-primary mt-6">
          Coba lagi
        </button>
      </div>
    </main>
  );
}
