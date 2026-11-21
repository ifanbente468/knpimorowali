#!/bin/sh
# Jalankan di Terminal cPanel dari application root, setelah mengaktifkan
# Node.js environment (source /home/USER/nodevenv/APP/22/bin/activate).
set -e

echo "[1/4] Install dependency..."
npm ci

echo "[2/4] Generate Prisma Client (engine Linux)..."
npx prisma generate

echo "[3/4] Build Next.js (mode compile: hemat proses/thread)..."
NEXT_TELEMETRY_DISABLED=1 npx next build --webpack --experimental-build-mode compile

echo "[4/4] Siapkan folder data..."
mkdir -p data/uploads

echo "Selesai. Restart aplikasi dari cPanel -> Setup Node.js App."
