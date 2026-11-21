# Checklist Keamanan

## Sudah diterapkan

- [x] Kata sandi di-hash bcrypt cost 12; tidak pernah dikembalikan ke klien.
- [x] Sesi disimpan di database sebagai HMAC-SHA256(token + `SESSION_SECRET`), bukan token mentah.
- [x] Cookie sesi `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` di produksi, masa berlaku 7 hari.
- [x] Sesi dicabut saat kata sandi diubah atau akun dinonaktifkan; admin dapat mereset dan mencabut sesi.
- [x] RBAC: ADMIN, EDITOR, MEMBER; guard pada layout admin + halaman khusus ADMIN.
- [x] Proteksi eskalasi: admin tidak bisa menurunkan/menonaktifkan/menghapus dirinya sendiri, dan
      administrator aktif terakhir tidak dapat dihapus/dinonaktifkan.
- [x] Validasi server-side Zod untuk semua input form dan server action.
- [x] Honeypot pada form publik (pendaftaran, aspirasi, login).
- [x] Rate limit login per IP, pendaftaran, aspirasi, dan unggahan.
- [x] Next.js Server Actions memiliki proteksi Origin bawaan; API unggah memeriksa Origin/Host.
- [x] Unggahan: batas 5 MB, whitelist MIME + verifikasi magic bytes, nama acak, tanpa eksekusi.
- [x] Penyajian unggahan memakai `Content-Type` eksplisit, `nosniff`, dan validasi nama file.
- [x] Header keamanan: CSP, HSTS (produksi), X-Frame-Options DENY, Referrer-Policy,
      Permissions-Policy, X-Content-Type-Options.
- [x] NIK dimasking pada verifikasi publik.
- [x] Audit log aksi penting.
- [x] Pesan login seragam (tidak membedakan email tidak ada vs kata sandi salah) + dummy bcrypt.
- [x] Health check tanpa membocorkan detail internal.

## Wajib saat go-live

- [ ] Ganti `SEED_ADMIN_PASSWORD` dan kata sandi admin setelah login pertama.
- [ ] Gunakan `SESSION_SECRET` acak 32+ byte, berbeda per lingkungan.
- [ ] HTTPS aktif dan `APP_URL` memakai `https://`.
- [ ] `SEED_DEMO=false`, `RUN_SEED=false` setelah seed awal.
- [ ] Backup harian diuji restore.
- [ ] Port aplikasi tidak diekspos langsung ke internet.
- [ ] Monitoring uptime ke `/api/health`.

## Rekomendasi lanjutan

- Tambahkan penyedia email (SMTP/Resend) untuk verifikasi email dan reset kata sandi mandiri.
- Pindahkan rate limit ke Redis bila menjalankan lebih dari satu instance.
- Tambahkan 2FA untuk administrator.
- Gunakan object storage (S3/R2) untuk unggahan bila multi-instance.
- Aktifkan WAF/CDN (Cloudflare) dan pembatasan laju di edge.
- Audit log diekspor berkala dan disimpan terpisah.
- Tinjau CSP dengan nonce bila ingin menghapus `unsafe-inline`.
