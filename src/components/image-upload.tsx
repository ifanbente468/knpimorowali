"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

export function ImageUpload({
  name,
  initialValue = "",
  label = "Gambar",
  hint = "JPG, PNG, atau WebP. Maksimal 5 MB.",
}: {
  name: string;
  initialValue?: string | null;
  label?: string;
  hint?: string;
}) {
  const [value, setValue] = useState(initialValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/uploads", { method: "POST", body: formData });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Gagal mengunggah gambar");
      }
      setValue(data.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Gagal mengunggah gambar");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <span className="label">{label}</span>
      <input type="hidden" name={name} value={value} />
      <div className="flex flex-wrap items-start gap-3">
        <div className="relative h-24 w-32 overflow-hidden rounded-xl border border-field bg-canvas">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Pratinjau gambar" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted">Belum ada</div>
          )}
          {value ? (
            <button
              type="button"
              onClick={() => setValue("")}
              className="absolute right-1 top-1 rounded-full bg-white/95 p-1 text-danger shadow"
              aria-label="Hapus gambar"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
        <div className="flex-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="btn-outline min-h-10"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <ImagePlus className="h-4 w-4" aria-hidden />
            )}
            {uploading ? "Mengunggah…" : "Unggah gambar"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
          <p className="mt-2 text-xs text-muted">{hint}</p>
          {error ? <p className="field-error">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
