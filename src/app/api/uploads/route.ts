import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { saveImage } from "@/lib/storage";

export const runtime = "nodejs";

function isSameOrigin(origin: string, host: string) {
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host && !isSameOrigin(origin, host)) {
    return NextResponse.json({ error: "Asal permintaan tidak valid" }, { status: 403 });
  }

  const limit = rateLimit(`upload:${user.id}`, { limit: 40, windowMs: 60 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Batas unggah tercapai, coba lagi nanti" }, { status: 429 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
  }

  try {
    const result = await saveImage(file);
    return NextResponse.json({ url: result.url }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengunggah file";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
