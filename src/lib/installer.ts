import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import { SITE } from "@/lib/constants";
import {
  dataDirectory,
  installMarkerPath,
  isInstalledSync,
  sqliteFilePath,
} from "@/lib/install-state";

const MIGRATIONS_DIR = "prisma/migrations";
const TABLES_TO_CHECK = ["User", "Setting", "Organization"];

export type InstallStatus = {
  installed: boolean;
  tablesReady: boolean;
  env: { key: string; ok: boolean; hint: string }[];
  missingEnv: string[];
  error?: string;
};

export async function isInstalled() {
  return isInstalledSync();
}

function envReport() {
  const secret = process.env.SESSION_SECRET ?? "";
  return [
    {
      key: "DATABASE_URL",
      ok: Boolean(process.env.DATABASE_URL?.startsWith("file:")),
      hint: 'file:../data/knpi.db',
    },
    {
      key: "SESSION_SECRET",
      ok: secret.length >= 32,
      hint: "openssl rand -hex 32 (minimal 32 karakter)",
    },
    {
      key: "APP_URL",
      ok: Boolean(process.env.APP_URL?.startsWith("http")),
      hint: "https://knpimorowali.com",
    },
    {
      key: "UPLOAD_DIR",
      ok: Boolean(process.env.UPLOAD_DIR),
      hint: "./data/uploads (opsional, default dipakai)",
    },
  ];
}

async function hasCoreTables() {
  try {
    const { prisma } = await import("@/lib/db");
    const rows = await prisma.$queryRaw<{ name: string }[]>`
      SELECT name FROM sqlite_master WHERE type = 'table'
    `;
    const names = new Set(rows.map((row) => row.name));
    return TABLES_TO_CHECK.every((table) => names.has(table));
  } catch {
    return false;
  }
}

export async function getInstallStatus(): Promise<InstallStatus> {
  const env = envReport();
  const missingEnv = env.filter((item) => !item.ok && item.key !== "UPLOAD_DIR").map((item) => item.key);
  const installed = await isInstalled();
  let tablesReady = false;
  let error: string | undefined;

  if (missingEnv.includes("DATABASE_URL")) {
    error = "DATABASE_URL belum diisi. Set di cPanel → Setup Node.js App → Environment Variables.";
  } else {
    tablesReady = await hasCoreTables();
  }

  return { installed, tablesReady, env, missingEnv, error };
}

function splitSqlStatements(sql: string) {
  const statements: string[] = [];
  let current = "";
  let quote: "'" | '"' | "`" | null = null;
  let inLineComment = false;

  for (let index = 0; index < sql.length; index += 1) {
    const char = sql[index];
    const next = sql[index + 1];

    if (inLineComment) {
      if (char === "\n") inLineComment = false;
      current += char;
      continue;
    }

    if (!quote && char === "-" && next === "-") {
      inLineComment = true;
      current += char;
      continue;
    }

    if (quote) {
      current += char;
      if (char === quote) quote = null;
      continue;
    }

    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      current += char;
      continue;
    }

    if (char === ";") {
      if (current.trim()) statements.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  if (current.trim()) statements.push(current.trim());
  return statements;
}

async function migrationFiles() {
  const candidates = [
    process.env.INSTALL_MIGRATIONS_DIR,
    path.resolve(MIGRATIONS_DIR),
    path.resolve(process.cwd(), MIGRATIONS_DIR),
    path.resolve(process.cwd(), "..", MIGRATIONS_DIR),
  ].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    try {
      const entries = await fs.readdir(/* turbopackIgnore: true */ candidate, { withFileTypes: true });
      const directories = entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();
      const files: string[] = [];
      for (const directory of directories) {
        const file = path.join(candidate, directory, "migration.sql");
        try {
          await fs.access(file);
          files.push(file);
        } catch {
          // directory without migration.sql is skipped
        }
      }
      if (files.length) return files;
    } catch {
      // try next candidate
    }
  }

  throw new Error(
    "File migrasi tidak ditemukan. Pastikan folder prisma/migrations ikut terunggah ke application root.",
  );
}

async function runMigrations() {
  const dbFile = sqliteFilePath();
  if (dbFile) {
    await fs.mkdir(/* turbopackIgnore: true */ path.dirname(dbFile), { recursive: true });
  }

  const files = await migrationFiles();
  const { prisma } = await import("@/lib/db");

  for (const file of files) {
    const sql = await fs.readFile(/* turbopackIgnore: true */ file, "utf8");
    for (const statement of splitSqlStatements(sql)) {
      const executable = statement.replace(/^\s*--.*$/gm, "").trim();
      if (!executable) continue;
      await prisma.$executeRawUnsafe(executable);
    }
  }
}

const ORGANIZATIONS = [
  {
    name: "DPD KNPI Kabupaten Morowali",
    type: "DPD",
    leader: "H. Abdul Rahman, S.Pd., M.Si.",
    description: "Dewan Pengurus Daerah KNPI Kabupaten Morowali, periode 2024–2028.",
    sortOrder: 0,
  },
  {
    name: "Pemuda Pancasila",
    type: "OKP",
    leader: "Irfan Saputra",
    description: "Organisasi kepemudaan berbasis nasionalisme dan bela negara.",
    sortOrder: 1,
  },
  {
    name: "Ansor Morowali",
    type: "OKP",
    leader: "Muh. Fajar",
    description: "Barisan Ansor Serbaguna Nahdlatul Ulama Kabupaten Morowali.",
    sortOrder: 2,
  },
  {
    name: "Pemuda Muhammadiyah",
    type: "OKP",
    leader: "Rizky Pratama",
    description: "Kader muda Muhammadiyah untuk dakwah dan pemberdayaan.",
    sortOrder: 3,
  },
  {
    name: "HMI Morowali",
    type: "OKP",
    leader: "Andi Wijaya",
    description: "Himpunan Mahasiswa Islam cabang Morowali.",
    sortOrder: 4,
  },
  {
    name: "PMII Morowali",
    type: "OKP",
    leader: "Nurul Hidayah",
    description: "Pergerakan Mahasiswa Islam Indonesia cabang Morowali.",
    sortOrder: 5,
  },
  {
    name: "KNPI Morowali Muda",
    type: "SAYAP",
    leader: "Fauzan Akbar",
    description: "Sayap kepemudaan untuk kaderisasi dan kegiatan sosial.",
    sortOrder: 6,
  },
] as const;

export type InstallInput = {
  siteName: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
};

export async function install({ siteName, adminName, adminEmail, adminPassword }: InstallInput) {
  if (await isInstalled()) {
    throw new Error("Aplikasi sudah terpasang. Hapus data/.installed hanya jika ingin mengulang instalasi.");
  }

  const missing = envReport().filter((item) => !item.ok && item.key !== "UPLOAD_DIR");
  if (missing.length) {
    throw new Error(
      `Environment variable belum lengkap: ${missing.map((item) => item.key).join(", ")}. Set dulu di cPanel lalu Restart aplikasi.`,
    );
  }

  if (!(await hasCoreTables())) {
    await runMigrations();
  }

  const { prisma } = await import("@/lib/db");
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: adminName, role: "ADMIN", isActive: true, passwordHash },
    create: { email: adminEmail, name: adminName, passwordHash, role: "ADMIN" },
  });

  const settings: Record<string, string> = {
    site_name: siteName,
    site_tagline: SITE.tagline,
    contact_email: adminEmail,
    contact_phone: SITE.phone,
    address: SITE.address,
    chairman_name: "",
    chairman_title: "Ketua DPD KNPI Kabupaten Morowali",
    chairman_message: "",
    instagram: "",
    facebook: "",
    youtube: "",
    map_url: SITE.mapUrl,
    hero_image: "/images/hero.jpg",
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }

  for (const organization of ORGANIZATIONS) {
    await prisma.organization.upsert({
      where: { name: organization.name },
      update: { ...organization },
      create: { ...organization },
    });
  }

  await fs.mkdir(/* turbopackIgnore: true */ dataDirectory(), { recursive: true });
  await fs.writeFile(
    /* turbopackIgnore: true */ installMarkerPath(),
    `${new Date().toISOString()} ${adminEmail}\n`,
    { mode: 0o600 },
  );

  return { adminEmail };
}
