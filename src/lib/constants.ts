export const SITE = {
  name: "KNPI Morowali",
  fullName: "DPD KNPI Kabupaten Morowali",
  org: "Komite Nasional Pemuda Indonesia",
  tagline: "Pemuda Morowali Bergerak, Berkarya, Berdaya.",
  description:
    "Wadah berhimpun pemuda dan organisasi kepemudaan di Kabupaten Morowali. Daftar anggota, ikuti kegiatan, dan sampaikan aspirasi dalam satu platform.",
  email: "sekretariat@knpi-morowali.or.id",
  phone: "+62 461 000 000",
  address: "Sekretariat DPD KNPI Kabupaten Morowali, Bungku Tengah, Sulawesi Tengah",
  mapUrl: "https://maps.google.com/?q=Morowali",
} as const;

export const DISTRICTS = [
  "Bahodopi",
  "Bungku Barat",
  "Bungku Pesisir",
  "Bungku Selatan",
  "Bungku Tengah",
  "Bungku Timur",
  "Bungku Utara",
  "Lembo",
  "Menui Kepulauan",
  "Soyo Jaya",
  "Witaponda",
] as const;

export const NEWS_CATEGORIES = [
  "KEGIATAN",
  "ORGANISASI",
  "PERNYATAAN",
  "PRESTASI",
  "PENGUMUMAN",
] as const;

export const ASPIRATION_CATEGORIES = [
  "Pendidikan",
  "Ketenagakerjaan",
  "Ekonomi Kreatif",
  "Olahraga",
  "Kesehatan",
  "Infrastruktur",
  "Sosial & Budaya",
  "Lainnya",
] as const;

export const FINANCE_CATEGORIES = [
  "Iuran Anggota",
  "Bantuan Pemerintah",
  "Sponsorship",
  "Donasi",
  "Kegiatan",
  "Operasional",
  "Perlengkapan",
  "Lainnya",
] as const;

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrator",
  EDITOR: "Editor",
  MEMBER: "Anggota",
};

export const MEMBER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Menunggu verifikasi",
  ACTIVE: "Aktif",
  REJECTED: "Ditolak",
  SUSPENDED: "Ditangguhkan",
};

export const ASPIRATION_STATUS_LABELS: Record<string, string> = {
  NEW: "Baru",
  IN_PROGRESS: "Diproses",
  RESOLVED: "Selesai",
  REJECTED: "Ditolak",
};

export const LETTER_TYPE_LABELS: Record<string, string> = {
  INCOMING: "Surat Masuk",
  OUTGOING: "Surat Keluar",
};
