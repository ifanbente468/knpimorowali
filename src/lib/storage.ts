import "server-only";

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const MAX_BYTES = 5 * 1024 * 1024;

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export function uploadDirectory() {
  return path.resolve(/* turbopackIgnore: true */ process.env.UPLOAD_DIR ?? "./data/uploads");
}

function hasMagicBytes(buffer: Buffer, mime: string) {
  if (mime === "image/jpeg") {
    return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mime === "image/png") {
    return (
      buffer.length > 8 &&
      buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    );
  }
  if (mime === "image/webp") {
    return (
      buffer.length > 12 &&
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }
  return false;
}

export async function saveImage(file: File) {
  if (file.size > MAX_BYTES) {
    throw new Error("Ukuran gambar maksimal 5 MB");
  }

  const mime = file.type;
  const extension = MIME_EXTENSIONS[mime];
  if (!extension) {
    throw new Error("Format gambar harus JPG, PNG, atau WebP");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!hasMagicBytes(buffer, mime)) {
    throw new Error("File gambar tidak valid");
  }

  const directory = uploadDirectory();
  await fs.mkdir(directory, { recursive: true });

  const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${extension}`;
  await fs.writeFile(path.join(/* turbopackIgnore: true */ directory, filename), buffer, { mode: 0o644 });

  return { filename, url: `/uploads/${filename}` };
}

export async function readUpload(filename: string) {
  if (!/^[a-zA-Z0-9._-]+$/.test(filename) || filename.includes("..")) {
    return null;
  }

  const extension = filename.split(".").pop()?.toLowerCase() ?? "";
  const mime = MIME_BY_EXTENSION[extension];
  if (!mime) return null;

  try {
    const file = await fs.readFile(path.join(/* turbopackIgnore: true */ uploadDirectory(), filename));
    return { file, mime };
  } catch {
    return null;
  }
}
