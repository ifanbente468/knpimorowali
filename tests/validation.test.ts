import { describe, expect, it } from "vitest";
import {
  aspirationSchema,
  financeSchema,
  loginSchema,
  newsSchema,
  registerSchema,
} from "@/lib/validation";

const validRegistration = {
  name: "Nur Aisyah",
  email: "nur@example.com",
  phone: "081234567890",
  password: "Rahasia123",
  confirmPassword: "Rahasia123",
  nik: "7201000000000001",
  birthDate: "2000-05-12",
  gender: "Perempuan" as const,
  address: "Desa Bahomohoni, Kecamatan Bungku Tengah",
  district: "Bungku Tengah" as const,
  okp: "PMII Morowali",
  occupation: "Mahasiswa",
  agree: "on" as const,
};

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    expect(registerSchema.safeParse(validRegistration).success).toBe(true);
  });

  it("rejects short passwords and mismatched confirmation", () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      password: "abc1",
      confirmPassword: "abc2",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((issue) => issue.path.join("."));
      expect(fields).toContain("password");
      expect(fields).toContain("confirmPassword");
    }
  });

  it("rejects invalid NIK and out-of-range age", () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      nik: "123",
      birthDate: "2018-01-01",
    });
    expect(result.success).toBe(false);
  });

  it("rejects unknown districts", () => {
    const result = registerSchema.safeParse({ ...validRegistration, district: "Jakarta" });
    expect(result.success).toBe(false);
  });

  it("requires consent", () => {
    const result = registerSchema.safeParse({ ...validRegistration, agree: "" });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("normalizes email casing and whitespace", () => {
    const result = loginSchema.safeParse({ email: "  Admin@Example.com ", password: "x" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("admin@example.com");
  });

  it("rejects invalid email", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "x" }).success).toBe(false);
  });
});

describe("aspirationSchema", () => {
  it("accepts a complete aspiration", () => {
    const result = aspirationSchema.safeParse({
      name: "Komunitas Pemuda",
      email: "",
      phone: "",
      category: "Olahraga",
      subject: "Usulan liga futsal",
      message: "Kami mengusulkan liga futsal antar kecamatan untuk pembinaan atlet muda.",
      isPublic: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects too-short messages", () => {
    const result = aspirationSchema.safeParse({
      name: "Komunitas Pemuda",
      email: "",
      phone: "",
      category: "Olahraga",
      subject: "Usulan liga futsal",
      message: "pendek",
    });
    expect(result.success).toBe(false);
  });
});

describe("newsSchema", () => {
  it("rejects unsafe slugs", () => {
    const result = newsSchema.safeParse({
      title: "Judul berita pemuda",
      slug: "Judul Berbahaya!",
      excerpt: "Ringkasan berita yang cukup panjang untuk lolos validasi.",
      content: "Isi berita yang cukup panjang untuk lolos validasi minimal lima puluh karakter.",
      category: "KEGIATAN",
      status: "DRAFT",
    });
    expect(result.success).toBe(false);
  });
});

describe("financeSchema", () => {
  it("coerces amount and rejects zero", () => {
    const valid = financeSchema.safeParse({
      date: "2026-01-10",
      type: "INCOME",
      category: "Iuran Anggota",
      description: "Iuran bulanan",
      amount: "250000",
    });
    expect(valid.success).toBe(true);
    if (valid.success) expect(valid.data.amount).toBe(250000);

    const invalid = financeSchema.safeParse({
      date: "2026-01-10",
      type: "INCOME",
      category: "Iuran Anggota",
      description: "Iuran bulanan",
      amount: "0",
    });
    expect(invalid.success).toBe(false);
  });
});
