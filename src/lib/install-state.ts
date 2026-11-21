import fs from "node:fs";
import path from "node:path";

export function sqliteFilePath(url = process.env.DATABASE_URL) {
  if (!url || !url.startsWith("file:")) return null;
  const raw = url.slice("file:".length);
  // Prisma resolves relative SQLite paths against the schema directory (prisma/).
  return path.isAbsolute(raw) ? raw : path.resolve("prisma", raw);
}

export function dataDirectory() {
  const dbFile = sqliteFilePath();
  return dbFile ? path.dirname(dbFile) : path.resolve("data");
}

export function installMarkerPath() {
  return path.join(dataDirectory(), ".installed");
}

export function isInstalledSync() {
  try {
    fs.accessSync(installMarkerPath());
    return true;
  } catch {
    return false;
  }
}
