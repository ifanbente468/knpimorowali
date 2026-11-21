# KNPI Morowali — Platform Digital Kepemudaan

Aplikasi web produksi untuk **DPD KNPI Kabupaten Morowali**: profil organisasi, berita, agenda,
galeri, pendaftaran anggota dengan kartu digital ber-QR, aspirasi masyarakat, serta panel admin
lengkap (keanggotaan, konten, persuratan, keuangan, pengguna, dan pengaturan).

## Teknologi

| Lapisan | Teknologi |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Actions, Turbopack) |
| Bahasa | TypeScript strict |
| UI | Tailwind CSS 3, Lucide Icons, desain mengikuti mockup KNPI |
| Database | Prisma ORM + SQLite (siap dimigrasikan ke PostgreSQL) |
| Autentikasi | Sesi database + cookie HttpOnly, bcrypt (cost 12), RBAC |
| Validasi | Zod |
| Test | Vitest |
| Deployment | Docker + Docker Compose, Nginx reverse proxy |

## Fitur

**Publik**
- Beranda dengan statistik, berita unggulan, agenda, OKP, galeri, dan CTA aspirasi
- Profil, visi/misi, sambutan ketua, dan sekretariat
- Berita: pencarian, filter kategori, paginasi, halaman detail + SEO/JSON-LD
- Agenda: kegiatan mendatang dan arsip
- Galeri dengan filter album
- Aspirasi publik dengan kode pelacakan dan tampilan aspirasi yang sudah ditanggapi
- Pendaftaran anggota mandiri (NIK, kecamatan, OKP, dokumen data diri)
- Cek keaslian kartu anggota berdasarkan nomor anggota/NIK (NIK dimasking)
- Akun anggota: status verifikasi, kartu anggota digital + QR, ubah profil & kata sandi

**Admin**
- Dashboard statistik, grafik pertumbuhan anggota, antrean verifikasi, ringkasan keuangan
- Verifikasi anggota: setujui (nomor anggota otomatis + kartu), tolak, tangguhkan, aktifkan
- CRUD berita (Markdown), agenda, galeri, organisasi/OKP, persuratan, keuangan
- Tanggapan aspirasi + publikasi transparan
- Manajemen pengguna & peran (ADMIN, EDITOR, MEMBER), reset kata sandi aman
- Pengaturan identitas situs, kontak, media sosial, dan foto hero
- Audit log untuk aksi penting

## Menjalankan Lokal

Prasyarat: **Node.js 20.9+** (disarankan 22/24) dan npm.

```bash
npm install
cp .env.example .env
# Ganti SESSION_SECRET:
#   openssl rand -hex 32
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Buka `http://localhost:3000`.

Seed lokal (non-production) menyertakan konten contoh. Untuk produksi bersih:

```bash
SEED_DEMO=false npm run db:seed
```

Atau jalankan `npm run setup` untuk generate client, push schema, dan seed sekaligus.

### Akun awal

| Peran | Email | Kata sandi |
| --- | --- | --- |
| Administrator | `admin@knpi-morowali.or.id` | `Admin#KNPI2026` (dari `SEED_ADMIN_PASSWORD`) |

> **Wajib:** ganti kata sandi administrator setelah login pertama melalui **Akun → Ubah kata sandi**.
> Akun `editor@knpi-morowali.or.id` dan akun demo memiliki kata sandi acak yang tidak dapat dipakai.

## Variabel Lingkungan

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| `DATABASE_URL` | Ya | `file:../data/knpi.db` untuk SQLite (relatif terhadap `prisma/`) |
| `SESSION_SECRET` | Ya | Minimal 32 karakter; HMAC token sesi |
| `APP_URL` | Ya | URL publik, mis. `https://knpi-morowali.or.id` |
| `UPLOAD_DIR` | Tidak | Folder unggahan, default `./data/uploads` |
| `SEED_ADMIN_EMAIL` | Tidak | Email admin saat seed |
| `SEED_ADMIN_PASSWORD` | Tidak | Kata sandi admin saat seed |
| `SEED_ADMIN_NAME` | Tidak | Nama admin saat seed |
| `SEED_DEMO` | Tidak | `true` untuk konten contoh; default aktif hanya di non-production |
| `RUN_SEED` | Tidak | Khusus Docker: jalankan seed saat kontainer start |

## Perintah

```bash
npm run dev          # development
npm run build        # prisma generate + next build
npm start            # jalankan hasil build
npm run typecheck    # TypeScript strict
npm test             # Vitest
npm run check        # typecheck + test
npm run db:migrate   # buat migrasi baru (development)
npm run db:deploy    # terapkan migrasi (production)
npm run db:seed      # seed data
npm run db:studio    # Prisma Studio
```

## Struktur Penting

```
src/
  app/
    (public)/            # halaman publik + akun anggota
    admin/               # panel admin (dilindungi layout)
    api/uploads/         # unggah gambar (staf)
    api/health/          # health check
    uploads/[filename]/  # penyajian gambar unggahan
  actions/               # server actions (auth, konten, admin, publik)
  components/            # UI publik, admin, kartu anggota, form
  lib/                   # auth, db, validasi, storage, rate limit, audit
prisma/
  schema.prisma
  migrations/
  seed.ts
tests/                   # unit test validasi & util
docs/                    # panduan deployment & keamanan
```

## Produksi

Panduan lengkap: [`docs/DEPLOY-VPS.md`](docs/DEPLOY-VPS.md).

Ringkas dengan Docker:

```bash
cp .env.docker.example .env
# isi SESSION_SECRET, SEED_ADMIN_PASSWORD, APP_URL
docker compose build
RUN_SEED=true docker compose up -d   # seed sekali (admin + pengaturan)
docker compose up -d
```

Kesehatan aplikasi: `GET /api/health`.

## Keamanan

- Password: bcrypt cost 12; sesi disimpan sebagai HMAC token, cookie `HttpOnly`, `SameSite=Lax`,
  `Secure` di produksi.
- Setiap server action memeriksa sesi dan peran; halaman admin dilindungi layout + pengecekan per
  halaman untuk fitur khusus ADMIN.
- Validasi Zod di server, honeypot + rate limit untuk login/pendaftaran/aspirasi/unggah.
- Unggahan: maksimal 5 MB, MIME + magic bytes JPG/PNG/WebP, nama file acak, penyajian dengan
  `nosniff`.
- Header keamanan: CSP, HSTS (produksi), X-Frame-Options, Referrer-Policy, Permissions-Policy.
- Audit log aksi penting (login, verifikasi, CRUD, reset kata sandi).
- Tidak ada rahasia di klien; `SESSION_SECRET` hanya dibaca server.

Detail checklist: [`docs/KEAMANAN.md`](docs/KEAMANAN.md).

## Batasan yang Diketahui

- SQLite cocok untuk satu instance. Untuk multi-instance/traffic tinggi, migrasikan ke PostgreSQL
  (ubah provider Prisma dan `DATABASE_URL`).
- Rate limit disimpan in-memory per instance; gunakan Redis bila multi-instance.
- Reset kata sandi mandiri via email belum aktif (belum ada penyedia SMTP). Admin dapat mereset
  kata sandi sementara dari menu Pengguna.
- Unggahan disimpan di filesystem; gunakan volume persisten atau ganti ke S3/R2 untuk multi-instance.
- CSP mengizinkan `unsafe-inline` agar kompatibel dengan Next.js; tightening dapat dilakukan dengan
  nonce jika diperlukan.

## Lisensi

Kode aplikasi ini disiapkan untuk DPD KNPI Kabupaten Morowali. Aset logo/foto berasal dari materi
desain yang disediakan pemilik proyek.
