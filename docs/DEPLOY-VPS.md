# Panduan Deployment Produksi — VPS

Panduan ini memasang aplikasi KNPI Morowali di VPS Linux (Ubuntu 22.04/24.04) menggunakan
Docker Compose dan Nginx sebagai reverse proxy + HTTPS.

## 1. Prasyarat

- VPS minimal 2 vCPU / 2 GB RAM / 20 GB disk
- Domain yang sudah diarahkan (A record) ke IP VPS
- Docker Engine + Docker Compose plugin
- Akses SSH

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
newgrp docker
docker --version && docker compose version
```

## 2. Unggah Aplikasi

```bash
sudo mkdir -p /opt/knpi && sudo chown "$USER":"$USER" /opt/knpi
cd /opt/knpi
# via git:
git clone <URL-REPOSITORI> .
# atau unggah arsip proyek lalu ekstrak di folder ini
```

## 3. Konfigurasi Environment

```bash
cp .env.docker.example .env
openssl rand -hex 32
nano .env
```

Isi `.env`:

```dotenv
APP_URL="https://knpi-morowali.or.id"
SESSION_SECRET="<hasil openssl rand -hex 32>"
SEED_ADMIN_EMAIL="admin@knpi-morowali.or.id"
SEED_ADMIN_PASSWORD="<kata sandi kuat, minimal 12 karakter>"
SEED_ADMIN_NAME="Administrator KNPI Morowali"
SEED_DEMO="false"
RUN_SEED="false"
```

Jangan commit `.env`. Batasi izin: `chmod 600 .env`.

## 4. Build dan Jalankan

Seed pertama (membuat admin, pengaturan, daftar OKP tanpa konten demo):

```bash
docker compose build
RUN_SEED=true docker compose up -d
docker compose logs -f app
```

Setelah log menunjukkan aplikasi berjalan dan seed selesai, kembalikan `RUN_SEED=false`:

```bash
sed -i 's/^RUN_SEED=.*/RUN_SEED="false"/' .env
docker compose up -d
```

Verifikasi:

```bash
curl -fsS http://127.0.0.1:3000/api/health
curl -I http://127.0.0.1:3000/
```

## 5. Nginx + HTTPS

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
sudo cp deploy/nginx.conf /etc/nginx/sites-available/knpi-morowali
sudo sed -i 's/knpi-morowali.or.id/DOMAIN_ANDA/g' /etc/nginx/sites-available/knpi-morowali
sudo ln -s /etc/nginx/sites-available/knpi-morowali /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d DOMAIN_ANDA -d www.DOMAIN_ANDA
```

Certbot memasang sertifikat dan redirect HTTPS otomatis. Perbarui `APP_URL` di `.env` ke `https://DOMAIN_ANDA`
lalu `docker compose up -d`.

Periksa firewall (bila aktif):

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 6. Backup

Skrip disediakan di `scripts/backup.sh`. Backup berisi database SQLite dan folder unggahan.

```bash
chmod +x scripts/backup.sh
./scripts/backup.sh /var/backups/knpi
```

Skrip menghentikan kontainer sebentar agar salinan SQLite konsisten, lalu menyalakannya kembali.
Jadwalkan harian (contoh 02.00):

```cron
0 2 * * * cd /opt/knpi && ./scripts/backup.sh /var/backups/knpi >> /var/log/knpi-backup.log 2>&1
```

Restore:

```bash
docker compose stop app
docker compose cp /var/backups/knpi/knpi-2026-01-01-020000.db app:/app/data/knpi.db
docker compose cp /var/backups/knpi/uploads-2026-01-01-020000/. app:/app/data/uploads/
docker compose start app
```

Uji restore secara berkala di lingkungan terpisah.

## 7. Pembaruan Aplikasi

```bash
cd /opt/knpi
./scripts/backup.sh /var/backups/knpi
git pull            # atau unggah rilis baru
docker compose build
docker compose up -d
docker compose ps
curl -fsS https://DOMAIN_ANDA/api/health
```

Migrasi database dijalankan otomatis oleh entrypoint (`prisma migrate deploy`). Jangan mengubah
folder `data/` saat pembaruan.

## 8. Monitoring

- Health check: `GET /api/health` (juga dipakai healthcheck Docker Compose).
- Log: `docker compose logs -f --tail=200 app`.
- Disk: `df -h`, ukuran volume: `docker system df -v`.
- Backup: pastikan file bertambah setiap hari.
- Uptime eksternal (mis. UptimeRobot) ke `/api/health`.

## 9. Keamanan Operasional

- Ganti kata sandi admin awal segera setelah login.
- `SESSION_SECRET` dan `.env` tidak boleh masuk repositori.
- Hanya port 80/443 yang terbuka publik; port 3000 cukup di localhost.
- Perbarui image dasar dan dependensi secara berkala:

```bash
npm audit
docker compose build --pull
```

- Batasi akses SSH (key-only), aktifkan `fail2ban`.
- Backup disimpan di luar VPS (object storage) untuk mitigasi kehilangan server.

## 10. Skala dan PostgreSQL

SQLite sesuai untuk satu instance dan beban kecil–menengah. Untuk multi-instance atau trafik tinggi:

1. Siapkan PostgreSQL.
2. Ubah `datasource db { provider = "postgresql" }` pada `prisma/schema.prisma`.
3. Set `DATABASE_URL` PostgreSQL.
4. Buat ulang migrasi (`prisma migrate dev --name init_postgres`) di lingkungan baru, lalu
   `prisma migrate deploy`.
5. Pindahkan rate limit ke Redis dan unggahan ke S3/R2.
6. Jalankan beberapa replika di belakang load balancer.

## 11. Rollback

```bash
docker compose down
git checkout <tag-stabil>
docker compose build && docker compose up -d
# Jika migrasi bermasalah, restore database dari backup terakhir sebelum rollback.
```

Selalu uji rollback sebelum go-live.
