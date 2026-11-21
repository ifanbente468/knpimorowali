# Deployment cPanel — KNPI Morowali

Panduan memasang aplikasi di **cPanel dengan Node.js Selector** (CloudLinux Passenger).
Setelah aplikasi berjalan dan belum diinstal, membuka `https://knpimorowali.com`
otomatis diarahkan ke `https://knpimorowali.com/install`.

## 1. Prasyarat hosting

- cPanel dengan **Setup Node.js App** (Node.js 20.9+, disarankan 22).
- Akses **Terminal** cPanel (SSH juga boleh). Build Next.js butuh terminal.
- Ruang disk minimal ~1 GB (node_modules + build).

Jika hosting tidak punya Node.js Selector/Terminal, pakai VPS (lihat `docs/DEPLOY-VPS.md`).

## 2. Upload arsip

1. cPanel → **File Manager**.
2. Buat folder aplikasi di luar `public_html`, contoh `/home/USERNAME/knpimorowali`.
3. Upload `knpi-morowali-cpanel.zip` ke folder itu, lalu **Extract**.
4. Pastikan isi arsip langsung berada di folder tersebut:
   `app.js`, `package.json`, `src/`, `prisma/`, `public/`, dst.

Jangan taruh aplikasi di dalam `public_html`. Domain diarahkan lewat Node.js App.

## 3. Buat Node.js Application

cPanel → **Setup Node.js App** → **Create Application**:

| Field | Nilai |
| --- | --- |
| Node.js version | 22.x (atau 20.9+) |
| Application mode | Production |
| Application root | `knpimorowali` (folder di atas) |
| Application URL | `knpimorowali.com` (dan `www` bila ada) |
| Application startup file | `app.js` |

Lalu isi **Environment Variables**:

| Variable | Nilai |
| --- | --- |
| `DATABASE_URL` | `file:../data/knpi.db` |
| `SESSION_SECRET` | hasil `openssl rand -hex 32` (min. 32 karakter) |
| `APP_URL` | `https://knpimorowali.com` |
| `UPLOAD_DIR` | `./data/uploads` |
| `INSTALL_TOKEN` | opsional, kunci tambahan halaman `/install` |

Simpan. cPanel mungkin otomatis menjalankan `npm install`; abaikan bila gagal,
lanjut ke langkah 4.

## 4. Install dependency + build (Terminal cPanel)

Buka cPanel → **Terminal**, lalu:

```sh
cd ~/knpimorowali

# Aktifkan Node environment milik aplikasi (nama folder venv bisa berbeda)
source /home/USERNAME/nodevenv/knpimorowali/22/bin/activate

chmod +x deploy/cpanel/setup.sh
sh deploy/cpanel/setup.sh
```

Atau jalankan manual:

```sh
npm ci
npx prisma generate
NEXT_TELEMETRY_DISABLED=1 npx next build --webpack --experimental-build-mode compile
mkdir -p data/uploads
```

Mode `compile` dipakai agar build tidak membuat worker thread/child process
(hospesing dengan limit LVE kecil sering gagal `spawn ... EAGAIN`). Semua
halaman dirender dinamis saat runtime; hasil tetap normal.

`prisma generate` wajib dijalankan di server Linux agar engine SQLite sesuai OS.

## 5. Restart aplikasi

cPanel → **Setup Node.js App** → pilih aplikasi → **Restart**.

Cek logika:

```sh
curl -I https://knpimorowali.com
```

## 6. Instalasi lewat browser

1. Buka `https://knpimorowali.com` → otomatis redirect ke `/install`.
2. Isi nama situs, nama admin, email, dan kata sandi.
3. Setelah sukses, aplikasi membuat `data/.installed`, menulis database
   `data/knpi.db`, dan mengarahkan ke `/masuk?installed=1`.
4. Halaman `/install` otomatis terkunci setelah terpasang.

Redirect beranda → `/install` dijalankan oleh `src/proxy.ts` dan hanya aktif
selama file `data/.installed` belum ada.

## 7. Izin folder

Folder `data/` harus bisa ditulis proses Node:

```sh
chmod -R 775 data
```

## Troubleshooting

| Gejala | Penyebab / solusi |
| --- | --- |
| Halaman 503 "Passenger" | Startup file bukan `app.js`, atau dependency belum diinstal. Cek log di Setup Node.js App. |
| 500 + log `Cannot find package 'bcryptjs-xxxx'` / `@prisma/client-xxxx` | Build Turbopack merusak nama paket eksternal. Jalankan `npm run build` (sudah memakai `next build --webpack`) lalu restart aplikasi. |
| Build gagal `spawn ... EAGAIN` | Limit proses/thread akun (LVE) habis. Stop aplikasi, matikan proses `lsnode`, lalu build. Config sudah memakai `experimental.cpus=1` + `workerThreads` agar hemat proses. |
| Redirect ke `/install` terus | Folder `data/` tidak writable, atau `DATABASE_URL` salah. Pastikan `file:../data/knpi.db`. |
| `/install` bilang tabel belum siap | Buka halaman sekali lagi untuk menjalankan migrasi, atau pastikan folder `prisma/migrations` ikut terunggah. |
| Error `sharp` / `@next/swc-linux` | `node_modules` hasil upload dari Windows. Hapus `node_modules`, jalankan `npm ci` di server. |
| Build kehabisan memori | Build dengan `NODE_OPTIONS=--max-old-space-size=1024 npm run build`, atau minta hosting menaikkan memory limit. |
| Environment variables tidak terbaca | Set ulang di Setup Node.js App lalu **Restart**. |
