# Deploy cPanel — Bundle dari GitHub Actions

Server cPanel memakai LVE `nproc` kecil, jadi build di server sering gagal
(`spawn ... EAGAIN` / `ERR_WORKER_INIT_FAILED`). Solusi: build di GitHub Actions
(Linux), lalu upload hasil jadi ke cPanel. Tidak perlu `npm install` atau
`next build` di server.

## Alur

1. Push ke branch `main`.
2. GitHub Actions menjalankan `.github/workflows/deploy-cpanel.yml`:
   - `npm ci` + `prisma generate` + `next build --webpack` (output standalone)
   - membungkus `.next/standalone` + `.next/static` + `public` + `prisma` + `app.js`
   - publish release `deploy-<run>` dengan aset `knpi-morowali-standalone.zip`
3. Unduh aset terbaru:
   `https://github.com/ifanbente468/knpimorowali/releases/latest/download/knpi-morowali-standalone.zip`
4. Upload ke cPanel dan extract ke application root.
5. Restart aplikasi Node.js.

## 1. Siapkan cPanel (sekali saja)

- Node.js version: **22**
- Application root: `knpi-morowali`
- Application URL: `knpimorowali.com` (+ `www`)
- Application startup file: `app.js`
- Pastikan folder `public_html` ada di `/home/knph4988` (kosong boleh).

Environment Variables (pakai **path absolut**):

| Variable | Nilai |
| --- | --- |
| `DATABASE_URL` | `file:/home/knph4988/knpi-morowali/data/knpi.db` |
| `UPLOAD_DIR` | `/home/knph4988/knpi-morowali/data/uploads` |
| `SESSION_SECRET` | hasil `openssl rand -hex 32` |
| `APP_URL` | `https://knpimorowali.com` |
| `INSTALL_TOKEN` | opsional |

## 2. Deploy bundle

1. Download zip release terbaru (link di atas).
2. cPanel → **File Manager** → `/home/knph4988/knpi-morowali`.
3. **Hapus** folder `.next` lama (wajib, agar tidak bercampur).
   `node_modules` lama boleh dihapus juga; bundle sudah membawa dependency-nya.
4. Upload `knpi-morowali-standalone.zip` → **Extract** di folder itu.
5. Pastikan `app.js` ada di root dan berisi loader standalone.
6. cPanel → **Setup Node.js App** → **Restart**.

Folder `data/` (database, uploads, `.installed`) tidak ada di bundle, jadi aman
dan tidak tertimpa.

## 3. Verifikasi

- `https://knpimorowali.com` → 307 ke `/install` (jika belum terpasang)
- `/install` harus 200 dan form tampil
- `/api/health` harus 200

## Catatan

- `app.js` otomatis memakai `.next/standalone/server.js` bila ada; kalau tidak,
  fallback ke `server.js` (build lokal).
- Jangan jalankan `npm run build` / `npm install` di server ini.
- Setiap push ke `main` membuat release baru; cukup ulangi langkah 2 untuk update.
