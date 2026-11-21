"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  createSession,
  destroySession,
  getCurrentUser,
  hashPassword,
  requireUser,
  verifyPassword,
} from "@/lib/auth";
import {
  changePasswordSchema,
  loginSchema,
  profileSchema,
  registerSchema,
} from "@/lib/validation";
import { fail, readBoolean, readString, success, type ActionState } from "@/lib/form";
import { getClientIp, parseMakassarDate, safeNextPath } from "@/lib/utils";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";

const DUMMY_HASH = "$2b$12$SyitEtfO9J4Y6oMvS/kUGupQ/gNPLyHST6eHK89jszH02dT/5x6C6";

export async function loginAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const headerStore = await headers();
  const ip = getClientIp(headerStore);
  const emailRaw = readString(formData, "email").toLowerCase();

  const ipLimit = rateLimit(`login-ip:${ip}`, { limit: 20, windowMs: 15 * 60 * 1000 });
  if (!ipLimit.allowed) {
    return fail(
      `Terlalu banyak percobaan masuk. Coba lagi dalam ${ipLimit.retryAfterSeconds} detik.`,
    );
  }

  const parsed = loginSchema.safeParse({
    email: emailRaw,
    password: readString(formData, "password"),
  });

  if (!parsed.success) {
    return fail("Periksa kembali data Anda.", parsed.error);
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  const passwordValid = await verifyPassword(
    parsed.data.password,
    user?.passwordHash ?? DUMMY_HASH,
  );

  if (!user || !passwordValid) {
    await audit({ action: "LOGIN_FAILED", entity: "USER", meta: { email: parsed.data.email }, ip });
    return fail("Email atau kata sandi salah.");
  }

  if (!user.isActive) {
    return fail("Akun Anda dinonaktifkan. Hubungi administrator KNPI Morowali.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
  await createSession(user.id);
  resetRateLimit(`login-ip:${ip}`);
  await audit({ actorId: user.id, action: "LOGIN", entity: "USER", entityId: user.id, ip });

  const next = safeNextPath(
    formData.get("next"),
    user.role === "MEMBER" ? "/akun" : "/admin",
  );

  redirect(next);
}

export async function registerAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (readString(formData, "website")) {
    return fail("Pendaftaran tidak dapat diproses.");
  }

  const headerStore = await headers();
  const ip = getClientIp(headerStore);
  const limit = rateLimit(`register:${ip}`, { limit: 5, windowMs: 60 * 60 * 1000 });
  if (!limit.allowed) {
    return fail(`Terlalu banyak pendaftaran. Coba lagi dalam ${limit.retryAfterSeconds} detik.`);
  }

  const raw = {
    name: readString(formData, "name"),
    email: readString(formData, "email"),
    phone: readString(formData, "phone"),
    password: readString(formData, "password"),
    confirmPassword: readString(formData, "confirmPassword"),
    nik: readString(formData, "nik"),
    birthDate: readString(formData, "birthDate"),
    gender: readString(formData, "gender"),
    address: readString(formData, "address"),
    district: readString(formData, "district"),
    okp: readString(formData, "okp") || undefined,
    occupation: readString(formData, "occupation") || undefined,
    agree: readBoolean(formData, "agree") ? "on" : "",
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ...fail("Periksa kembali data pendaftaran Anda.", parsed.error),
      values: {
        name: raw.name,
        email: raw.email,
        phone: raw.phone,
        nik: raw.nik,
        birthDate: raw.birthDate,
        gender: raw.gender,
        address: raw.address,
        district: raw.district,
        okp: raw.okp ?? "",
        occupation: raw.occupation ?? "",
        password: "",
        confirmPassword: "",
      },
    };
  }

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: parsed.data.email }, { member: { nik: parsed.data.nik } }],
    },
    select: { email: true, member: { select: { nik: true } } },
  });

  if (existing) {
    if (existing.email === parsed.data.email) {
      return fail("Email sudah terdaftar. Silakan masuk atau gunakan email lain.");
    }
    return fail("NIK sudah terdaftar. Hubungi sekretariat jika ini kekeliruan.");
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const birthDate = parseMakassarDate(parsed.data.birthDate);

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      phone: parsed.data.phone,
      passwordHash,
      role: "MEMBER",
      member: {
        create: {
          nik: parsed.data.nik,
          birthDate,
          gender: parsed.data.gender,
          address: parsed.data.address,
          district: parsed.data.district,
          okp: parsed.data.okp,
          occupation: parsed.data.occupation,
          status: "PENDING",
        },
      },
    },
  });

  await createSession(user.id);
  await audit({
    actorId: user.id,
    action: "MEMBER_REGISTERED",
    entity: "MEMBER",
    entityId: user.id,
    ip,
  });

  redirect("/akun?status=registered");
}

export async function logoutAction() {
  const user = await getCurrentUser();
  if (user) {
    await audit({ actorId: user.id, action: "LOGOUT", entity: "USER", entityId: user.id });
  }
  await destroySession();
  redirect("/");
}

export async function updateProfileAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse({
    name: readString(formData, "name"),
    phone: readString(formData, "phone"),
    address: readString(formData, "address"),
    occupation: readString(formData, "occupation") || undefined,
  });

  if (!parsed.success) {
    return fail("Periksa kembali data profil Anda.", parsed.error);
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { name: parsed.data.name, phone: parsed.data.phone },
    }),
    ...(user.member
      ? [
          prisma.member.update({
            where: { id: user.member.id },
            data: {
              address: parsed.data.address,
              occupation: parsed.data.occupation,
            },
          }),
        ]
      : []),
  ]);

  revalidatePath("/akun");
  return success("Profil berhasil diperbarui.");
}

export async function changePasswordAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = changePasswordSchema.safeParse({
    currentPassword: readString(formData, "currentPassword"),
    newPassword: readString(formData, "newPassword"),
    confirmPassword: readString(formData, "confirmPassword"),
  });

  if (!parsed.success) {
    return fail("Periksa kembali kata sandi Anda.", parsed.error);
  }

  const account = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  if (!account || !(await verifyPassword(parsed.data.currentPassword, account.passwordHash))) {
    return fail("Kata sandi saat ini tidak sesuai.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  });
  await prisma.session.deleteMany({ where: { userId: user.id } });
  await createSession(user.id);
  await audit({
    actorId: user.id,
    action: "PASSWORD_CHANGED",
    entity: "USER",
    entityId: user.id,
  });

  return success("Kata sandi berhasil diubah.");
}
