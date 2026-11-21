#!/usr/bin/env bash
set -euo pipefail

DEST="${1:-./backups}"
STAMP="$(date +%Y-%m-%d-%H%M%S)"
mkdir -p "$DEST"

echo "Menghentikan aplikasi agar salinan database konsisten..."
docker compose stop app

echo "Menyalin database..."
docker compose cp app:/app/data/knpi.db "$DEST/knpi-$STAMP.db"

echo "Menyalin unggahan..."
mkdir -p "$DEST/uploads-$STAMP"
docker compose cp app:/app/data/uploads/. "$DEST/uploads-$STAMP/"

echo "Menjalankan kembali aplikasi..."
docker compose start app

echo "Backup selesai:"
echo "  $DEST/knpi-$STAMP.db"
echo "  $DEST/uploads-$STAMP/"
