import "server-only";

import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";

export const SESSION_COOKIE = "knpi_session";
export const SESSION_TTL_DAYS = 7;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "EDITOR" | "MEMBER";
  phone: string | null;
  avatarUrl: string | null;
  member: {
    id: string;
    memberNo: string | null;
    status: "PENDING" | "ACTIVE" | "REJECTED" | "SUSPENDED";
    district: string;
    nik: string;
    okp: string | null;
    joinedAt: Date;
    verifiedAt: Date | null;
    cardIssuedAt: Date | null;
  } | null;
};

function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET wajib diisi minimal 32 karakter. Jalankan: openssl rand -hex 32",
    );
  }
  return secret;
}

export function hashToken(token: string) {
  return crypto.createHmac("sha256", sessionSecret()).update(token).digest("hex");
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  const headerStore = await headers();

  await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });

  await prisma.session.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
      ip: headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      userAgent: headerStore.get("user-agent")?.slice(0, 300) ?? null,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function destroyAllUserSessions(userId: string) {
  await prisma.session.deleteMany({ where: { userId } });
}

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      user: {
        include: {
          member: {
            select: {
              id: true,
              memberNo: true,
              status: true,
              district: true,
              nik: true,
              okp: true,
              joinedAt: true,
              verifiedAt: true,
              cardIssuedAt: true,
            },
          },
        },
      },
    },
  });

  if (!session) return null;

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => null);
    return null;
  }

  if (!session.user.isActive) return null;

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
    phone: session.user.phone,
    avatarUrl: session.user.avatarUrl,
    member: session.user.member,
  };
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/masuk");
  return user;
}

export async function requireStaff() {
  const user = await getCurrentUser();
  if (!user) redirect("/masuk?next=/admin");
  if (user.role !== "ADMIN" && user.role !== "EDITOR") redirect("/akun");
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/masuk?next=/admin");
  if (user.role !== "ADMIN") redirect("/admin");
  return user;
}

export function isStaff(user: SessionUser | null) {
  return user?.role === "ADMIN" || user?.role === "EDITOR";
}
