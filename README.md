# KNPI Morowali — Situs PHP untuk cPanel

Aplikasi web **PHP 8 + MySQL** untuk DPD KNPI Kabupaten Morowali.
Tidak membutuhkan Node.js di server; seluruh isi folder `php/` diekstrak ke `public_html`.

## Fitur saat ini

**Publik**
- Beranda (hero, statistik, berita, agenda, organisasi, galeri, CTA aspirasi)
- Berita: daftar, pencarian, halaman detail `/berita/<slug>`
- Agenda: daftar + detail `/agenda/<slug>`
- Galeri dengan filter album, organisasi, profil
- Login anggota `/login.php` → akun `/akun.php`
- Redirect otomatis ke `/install.php` sebelum terpasang

**Admin** (`/admin/login.php`)
- Dashboard statistik, grafik pertumbuhan, aspirasi, keuangan
- CRUD: berita, agenda, galeri, persuratan, keuangan, organisasi, pengguna
- Verifikasi anggota (setujui/tolak/tangguhkan), tanggapan aspirasi
- Pengaturan identitas situs, kontak, media sosial

## Struktur

```
php/
├── index.php, berita.php, agenda.php, galeri.php, organisasi.php, profil.php
├── login.php, logout.php, akun.php, install.php
├── lib.php, theme.php, config.sample.php, .htaccess
├── admin/            dashboard + CRUD
├── assets/           app.css (Tailwind) + font Inter
├── images/           logo, hero
├── tailwind.css, tailwind.config.js, package.json  (build CSS)
├── build-zip.ps1     pembuat knpi-php-upload.zip
└── CARA-UPLOAD.txt   panduan upload
prisma/migrations-mysql/  DDL MySQL (referensi/recreate DB)
prisma/schema.mysql.prisma
```

## Deploy ke cPanel

1. Upload `knpi-php-upload.zip` ke `public_html`, lalu Extract.
2. Salin `config.sample.php` menjadi `config.php`, isi kredensial database:

```php
return [
    'app_url' => 'https://knpimorowali.com',
    'db' => ['host' => 'localhost', 'name' => 'DB', 'user' => 'USER', 'pass' => 'PASSWORD'],
    'install_key' => 'KUNCI-ACAK',
    'site_name' => 'KNPI Morowali',
];
```

3. Pastikan Document Root domain = `public_html` (bukan home).
4. Buka `/install.php`, masukkan `install_key`, buat akun admin.
5. Login admin di `/admin/login.php`; login anggota di `/login.php`.

Folder `data/` dan `config.php` tidak pernah masuk zip.

## Lokal (XAMPP)

```sh
# dari folder php/
php -S 127.0.0.1:8080
```

Buat `php/config.php` lokal (tidak di-commit) yang menunjuk database lokal.
Impor tabel dari `prisma/migrations-mysql/20260101000000_init/migration.sql`.

## Build ulang CSS

```sh
cd php
npx tailwindcss -c tailwind.config.js -i assets/tailwind.css -o assets/app.css --minify
```

## Build zip upload

```powershell
powershell -ExecutionPolicy Bypass -File php\build-zip.ps1
```

Menghasilkan `knpi-php-upload.zip` dan memverifikasi entri wajib, pemisah `/`,
serta memastikan `config.php`/database tidak ikut.

## Versi Node lama

Kode Next.js sebelumnya dihapus dari working tree. Tetap dapat dipulihkan dari
git history/tag `legacy-node-2026-11`.
