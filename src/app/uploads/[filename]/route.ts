import { readUpload } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  const result = await readUpload(filename);

  if (!result) {
    return new Response("Not Found", { status: 404 });
  }

  return new Response(new Uint8Array(result.file), {
    headers: {
      "Content-Type": result.mime,
      "Content-Length": String(result.file.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    },
  });
}
