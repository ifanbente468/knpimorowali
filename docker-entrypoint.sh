#!/bin/sh
set -e

if [ -z "$SESSION_SECRET" ] || [ "${#SESSION_SECRET}" -lt 32 ]; then
  echo "FATAL: SESSION_SECRET wajib diisi minimal 32 karakter." >&2
  echo "Contoh: openssl rand -hex 32" >&2
  exit 1
fi

echo "Menjalankan migrasi database..."
npx prisma migrate deploy

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "Menjalankan seed data awal..."
  npx tsx prisma/seed.ts
fi

echo "Menjalankan aplikasi pada port ${PORT:-3000}..."
exec npm start
