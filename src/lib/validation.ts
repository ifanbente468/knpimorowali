import { z } from "zod";
import {
  ASPIRATION_CATEGORIES,
  DISTRICTS,
  NEWS_CATEGORIES,
} from "@/lib/constants";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email wajib diisi")
  .email("Format email tidak valid")
  .max(160, "Email terlalu panjang");

const password = z
  .string()
  .min(8, "Kata sandi minimal 8 karakter")
  .max(72, "Kata sandi maksimal 72 karakter")
  .regex(/[A-Za-z]/, "Kata sandi harus memuat huruf")
  .regex(/\d/, "Kata sandi harus memuat angka");

const phone = z
  .string()
  .trim()
  .min(9, "Nomor telepon minimal 9 digit")
  .max(20, "Nomor telepon maksimal 20 digit")
  .regex(/^[0-9+\-\s()]+$/, "Nomor telepon tidak valid");

const optionalPhone = z
  .string()
  .trim()
  .max(20, "Nomor telepon maksimal 20 digit")
  .regex(/^[0-9+\-\s()]*$/, "Nomor telepon tidak valid")
  .optional();

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine(
    (value) => !value || /^(https?:\/\/|\/)/.test(value),
    "URL harus diawali http://, https://, atau /",
  )
  .optional();

const dateString = z
  .string()
  .min(1, "Tanggal wajib diisi")
  .refine((value) => !Number.isNaN(new Date(value).getTime()), "Tanggal tidak valid");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Kata sandi wajib diisi").max(72),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(3, "Nama minimal 3 karakter").max(100),
    email,
    phone,
    password,
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
    nik: z
      .string()
      .trim()
      .regex(/^\d{16}$/, "NIK harus 16 digit angka"),
    birthDate: dateString.refine((value) => {
      const date = new Date(value);
      const age =
        (Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      return age >= 15 && age <= 45;
    }, "Usia anggota harus antara 15 sampai 45 tahun"),
    gender: z.enum(["Laki-laki", "Perempuan"], {
      message: "Pilih jenis kelamin",
    }),
    address: z.string().trim().min(10, "Alamat minimal 10 karakter").max(300),
    district: z.enum(DISTRICTS, { message: "Pilih kecamatan" }),
    okp: z.string().trim().max(120).optional(),
    occupation: z.string().trim().max(120).optional(),
    agree: z.literal("on", { message: "Anda harus menyetujui ketentuan" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak sama",
    path: ["confirmPassword"],
  });

export const aspirationSchema = z.object({
  name: z.string().trim().min(3, "Nama minimal 3 karakter").max(100),
  email: z.union([z.literal(""), email]),
  phone: z.union([z.literal(""), phone]),
  category: z.enum(ASPIRATION_CATEGORIES, { message: "Pilih kategori" }),
  subject: z.string().trim().min(6, "Subjek minimal 6 karakter").max(140),
  message: z.string().trim().min(20, "Uraian minimal 20 karakter").max(4000),
  isPublic: z.boolean().optional(),
});

export const newsSchema = z.object({
  title: z.string().trim().min(6, "Judul minimal 6 karakter").max(160),
  slug: z
    .string()
    .trim()
    .max(100)
    .regex(/^[a-z0-9-]*$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung")
    .optional(),
  excerpt: z.string().trim().min(20, "Ringkasan minimal 20 karakter").max(300),
  content: z.string().trim().min(50, "Isi berita minimal 50 karakter").max(20000),
  category: z.enum(NEWS_CATEGORIES, { message: "Pilih kategori" }),
  coverImage: optionalUrl,
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export const agendaSchema = z
  .object({
    title: z.string().trim().min(6, "Nama kegiatan minimal 6 karakter").max(160),
    description: z.string().trim().min(20, "Deskripsi minimal 20 karakter").max(5000),
    location: z.string().trim().min(3, "Lokasi wajib diisi").max(200),
    startsAt: dateString,
    endsAt: z.union([z.literal(""), dateString]).optional(),
    capacity: z
      .union([z.literal(""), z.coerce.number().int().min(1, "Kapasitas minimal 1").max(100000)])
      .optional(),
    status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED"]),
    isPublished: z.boolean(),
  })
  .refine(
    (data) =>
      !data.endsAt || new Date(data.endsAt).getTime() >= new Date(data.startsAt).getTime(),
    { message: "Waktu selesai harus setelah waktu mulai", path: ["endsAt"] },
  );

export const gallerySchema = z.object({
  title: z.string().trim().min(3, "Judul minimal 3 karakter").max(140),
  album: z.string().trim().min(2, "Album minimal 2 karakter").max(80),
  imageUrl: z
    .string()
    .trim()
    .min(1, "Gambar wajib diunggah")
    .refine((value) => /^(https?:\/\/|\/)/.test(value), "URL gambar tidak valid"),
  caption: z.string().trim().max(300).optional(),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
});

export const letterSchema = z.object({
  number: z.string().trim().min(3, "Nomor surat wajib diisi").max(120),
  type: z.enum(["INCOMING", "OUTGOING"]),
  subject: z.string().trim().min(5, "Perihal minimal 5 karakter").max(200),
  sender: z.string().trim().min(2, "Pengirim wajib diisi").max(160),
  recipient: z.string().trim().min(2, "Penerima wajib diisi").max(160),
  date: dateString,
  fileUrl: optionalUrl,
  status: z.enum(["RECEIVED", "PROCESSED", "ARCHIVED"]),
  notes: z.string().trim().max(1000).optional(),
});

export const financeSchema = z.object({
  date: dateString,
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().trim().min(2, "Kategori wajib diisi").max(80),
  description: z.string().trim().min(5, "Keterangan minimal 5 karakter").max(300),
  amount: z.coerce.number().int().min(1, "Nominal harus lebih dari 0").max(10_000_000_000),
  reference: z.string().trim().max(120).optional(),
});

export const organizationSchema = z.object({
  name: z.string().trim().min(3, "Nama organisasi minimal 3 karakter").max(140),
  type: z.enum(["DPD", "OKP", "SAYAP"]),
  leader: z.string().trim().max(140).optional(),
  address: z.string().trim().max(300).optional(),
  phone: optionalPhone,
  email: z.union([z.literal(""), email]).optional(),
  website: optionalUrl,
  logoUrl: optionalUrl,
  description: z.string().trim().max(1000).optional(),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
  isActive: z.boolean().optional(),
});

export const memberEditSchema = z.object({
  memberId: z.string().min(1),
  name: z.string().trim().min(3, "Nama minimal 3 karakter").max(100),
  phone,
  nik: z.string().trim().regex(/^\d{16}$/, "NIK harus 16 digit angka"),
  birthDate: dateString,
  gender: z.enum(["Laki-laki", "Perempuan"], { message: "Pilih jenis kelamin" }),
  address: z.string().trim().min(10, "Alamat minimal 10 karakter").max(300),
  district: z.enum(DISTRICTS, { message: "Pilih kecamatan" }),
  okp: z.string().trim().max(120).optional(),
  occupation: z.string().trim().max(120).optional(),
});

export const memberReviewSchema = z.object({
  memberId: z.string().min(1),
  action: z.enum(["APPROVE", "REJECT", "SUSPEND", "REACTIVATE"]),
  reason: z.string().trim().max(500).optional(),
});

export const aspirationResponseSchema = z.object({
  aspirationId: z.string().min(1),
  status: z.enum(["NEW", "IN_PROGRESS", "RESOLVED", "REJECTED"]),
  response: z.string().trim().max(4000).optional(),
  isPublic: z.boolean().optional(),
});

export const profileSchema = z.object({
  name: z.string().trim().min(3, "Nama minimal 3 karakter").max(100),
  phone,
  address: z.string().trim().min(10, "Alamat minimal 10 karakter").max(300),
  occupation: z.string().trim().max(120).optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Kata sandi saat ini wajib diisi"),
    newPassword: password,
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak sama",
    path: ["confirmPassword"],
  });

const optionalLink = z
  .string()
  .trim()
  .max(500)
  .refine((value) => !value || /^https?:\/\//.test(value), "URL harus diawali http:// atau https://");

export const settingsSchema = z.object({
  site_name: z.string().trim().min(3, "Nama situs minimal 3 karakter").max(120),
  site_tagline: z.string().trim().max(160, "Tagline maksimal 160 karakter"),
  contact_email: z.union([z.literal(""), email]),
  contact_phone: z.string().trim().max(30),
  address: z.string().trim().max(300),
  chairman_name: z.string().trim().max(140),
  chairman_title: z.string().trim().max(160),
  chairman_message: z.string().trim().max(2000),
  instagram: optionalLink,
  facebook: optionalLink,
  youtube: optionalLink,
  map_url: optionalLink,
  hero_image: z
    .string()
    .trim()
    .max(500)
    .refine((value) => !value || /^(https?:\/\/|\/)/.test(value), "Gambar hero tidak valid"),
});

export const userAdminSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["ADMIN", "EDITOR", "MEMBER"]),
  isActive: z.boolean(),
});

export const installSchema = z
  .object({
    siteName: z.string().trim().min(3, "Nama situs minimal 3 karakter").max(80),
    adminName: z.string().trim().min(3, "Nama admin minimal 3 karakter").max(100),
    email,
    password,
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi kata sandi tidak sama",
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
