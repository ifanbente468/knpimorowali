"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { memberEditSchema, memberReviewSchema, userAdminSchema } from "@/lib/validation";
import { fail, readBoolean, readString, type ActionState } from "@/lib/form";
import { nextMemberNumber } from "@/lib/identifiers";
import { audit } from "@/lib/audit";
import { hashPassword } from "@/lib/auth";
import crypto from "node:crypto";
import { parseMakassarDate } from "@/lib/utils";

export async function reviewMemberAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = memberReviewSchema.safeParse({
    memberId: readString(formData, "memberId"),
    action: readString(formData, "action"),
    reason: readString(formData, "reason") || undefined,
  });

  if (!parsed.success) {
    return fail("Data verifikasi tidak valid.", parsed.error);
  }

  const member = await prisma.member.findUnique({
    where: { id: parsed.data.memberId },
    include: { user: { select: { name: true } } },
  });

  if (!member) return fail("Data anggota tidak ditemukan.");

  if (parsed.data.action === "REJECT" && !parsed.data.reason) {
    return fail("Alasan penolakan wajib diisi.");
  }

  if (parsed.data.action === "APPROVE") {
    const memberNo = member.memberNo ?? (await nextMemberNumber());
    await prisma.member.update({
      where: { id: member.id },
      data: {
        status: "ACTIVE",
        memberNo,
        verifiedAt: new Date(),
        verifiedById: admin.id,
        cardIssuedAt: new Date(),
        rejectionReason: null,
      },
    });
    await audit({
      actorId: admin.id,
      action: "MEMBER_APPROVED",
      entity: "MEMBER",
      entityId: member.id,
      meta: { memberNo },
    });
    revalidatePath("/admin/anggota");
    revalidatePath(`/admin/anggota/${member.id}`);
    return { ok: true, message: `Anggota ${member.user.name} disetujui dengan nomor ${memberNo}.` };
  }

  if (parsed.data.action === "REJECT") {
    await prisma.member.update({
      where: { id: member.id },
      data: {
        status: "REJECTED",
        rejectionReason: parsed.data.reason,
        verifiedAt: new Date(),
        verifiedById: admin.id,
      },
    });
    await audit({
      actorId: admin.id,
      action: "MEMBER_REJECTED",
      entity: "MEMBER",
      entityId: member.id,
      meta: { reason: parsed.data.reason },
    });
    revalidatePath("/admin/anggota");
    revalidatePath(`/admin/anggota/${member.id}`);
    return { ok: true, message: "Pendaftaran anggota ditolak." };
  }

  if (parsed.data.action === "SUSPEND") {
    await prisma.member.update({
      where: { id: member.id },
      data: { status: "SUSPENDED" },
    });
    await audit({
      actorId: admin.id,
      action: "MEMBER_SUSPENDED",
      entity: "MEMBER",
      entityId: member.id,
    });
    revalidatePath("/admin/anggota");
    revalidatePath(`/admin/anggota/${member.id}`);
    return { ok: true, message: "Keanggotaan ditangguhkan." };
  }

  const memberNo = member.memberNo ?? (await nextMemberNumber());
  await prisma.member.update({
    where: { id: member.id },
    data: {
      status: "ACTIVE",
      rejectionReason: null,
      memberNo,
      verifiedAt: member.verifiedAt ?? new Date(),
      verifiedById: member.verifiedById ?? admin.id,
      cardIssuedAt: member.cardIssuedAt ?? new Date(),
    },
  });
  await audit({
    actorId: admin.id,
    action: "MEMBER_REACTIVATED",
    entity: "MEMBER",
    entityId: member.id,
  });
  revalidatePath("/admin/anggota");
  revalidatePath(`/admin/anggota/${member.id}`);
  return { ok: true, message: "Keanggotaan diaktifkan kembali." };
}

export async function updateMemberAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = memberEditSchema.safeParse({
    memberId: readString(formData, "memberId"),
    name: readString(formData, "name"),
    phone: readString(formData, "phone"),
    nik: readString(formData, "nik"),
    birthDate: readString(formData, "birthDate"),
    gender: readString(formData, "gender"),
    address: readString(formData, "address"),
    district: readString(formData, "district"),
    okp: readString(formData, "okp") || undefined,
    occupation: readString(formData, "occupation") || undefined,
  });

  if (!parsed.success) return fail("Periksa kembali data anggota.", parsed.error);

  const member = await prisma.member.findUnique({ where: { id: parsed.data.memberId } });
  if (!member) return fail("Data anggota tidak ditemukan.");

  const duplicateNik = await prisma.member.findFirst({
    where: { nik: parsed.data.nik, id: { not: member.id } },
    select: { id: true },
  });
  if (duplicateNik) return fail("NIK sudah digunakan anggota lain.");

  await prisma.$transaction([
    prisma.user.update({
      where: { id: member.userId },
      data: { name: parsed.data.name, phone: parsed.data.phone },
    }),
    prisma.member.update({
      where: { id: member.id },
      data: {
        nik: parsed.data.nik,
        birthDate: parseMakassarDate(parsed.data.birthDate),
        gender: parsed.data.gender,
        address: parsed.data.address,
        district: parsed.data.district,
        okp: parsed.data.okp ?? null,
        occupation: parsed.data.occupation ?? null,
      },
    }),
  ]);

  await audit({
    actorId: admin.id,
    action: "MEMBER_UPDATED",
    entity: "MEMBER",
    entityId: member.id,
  });
  revalidatePath("/admin/anggota");
  revalidatePath(`/admin/anggota/${member.id}`);
  return { ok: true, message: "Data anggota diperbarui." };
}

export async function updateUserAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = userAdminSchema.safeParse({
    userId: readString(formData, "userId"),
    role: readString(formData, "role"),
    isActive: readBoolean(formData, "isActive"),
  });

  if (!parsed.success) return fail("Data pengguna tidak valid.", parsed.error);

  if (parsed.data.userId === admin.id) {
    return fail("Anda tidak dapat mengubah peran atau status akun sendiri.");
  }

  const target = await prisma.user.findUnique({ where: { id: parsed.data.userId } });
  if (!target) return fail("Pengguna tidak ditemukan.");

  if (target.role === "ADMIN" && (!parsed.data.isActive || parsed.data.role !== "ADMIN")) {
    const activeAdmins = await prisma.user.count({
      where: { role: "ADMIN", isActive: true, id: { not: target.id } },
    });
    if (activeAdmins === 0) {
      return fail("Tidak dapat menonaktifkan administrator aktif terakhir.");
    }
  }

  await prisma.user.update({
    where: { id: target.id },
    data: { role: parsed.data.role, isActive: parsed.data.isActive },
  });

  if (!parsed.data.isActive) {
    await prisma.session.deleteMany({ where: { userId: target.id } });
  }

  await audit({
    actorId: admin.id,
    action: "USER_UPDATED",
    entity: "USER",
    entityId: target.id,
    meta: { role: parsed.data.role, isActive: parsed.data.isActive },
  });

  revalidatePath("/admin/pengguna");
  return { ok: true, message: "Data pengguna diperbarui." };
}

export async function resetUserPasswordAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const userId = readString(formData, "userId");
  if (!userId) return fail("Pengguna tidak valid.");
  if (userId === admin.id) return fail("Gunakan halaman Akun untuk mengubah kata sandi Anda sendiri.");

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return fail("Pengguna tidak ditemukan.");

  const temporary = `KNPI-${crypto.randomBytes(4).toString("hex")}`;
  await prisma.user.update({
    where: { id: target.id },
    data: { passwordHash: await hashPassword(temporary) },
  });
  await prisma.session.deleteMany({ where: { userId: target.id } });
  await audit({
    actorId: admin.id,
    action: "USER_PASSWORD_RESET",
    entity: "USER",
    entityId: target.id,
  });

  return {
    ok: true,
    message: `Kata sandi sementara untuk ${target.email}: ${temporary} — sampaikan secara aman dan minta pengguna segera menggantinya.`,
  };
}

export async function deleteUserAction(formData: FormData) {
  const admin = await requireAdmin();
  const userId = readString(formData, "userId");
  if (!userId || userId === admin.id) redirect("/admin/pengguna?error=Permintaan+tidak+valid");

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) redirect("/admin/pengguna?error=Pengguna+tidak+ditemukan");

  if (target.role === "ADMIN") {
    const activeAdmins = await prisma.user.count({
      where: { role: "ADMIN", isActive: true, id: { not: target.id } },
    });
    if (activeAdmins === 0) {
      redirect("/admin/pengguna?error=Tidak+dapat+menghapus+administrator+terakhir");
    }
  }

  try {
    await prisma.user.delete({ where: { id: target.id } });
  } catch {
    redirect("/admin/pengguna?error=Pengguna+masih+memiliki+data+terkait+(berita,+agenda,+atau+keuangan)");
  }
  await audit({
    actorId: admin.id,
    action: "USER_DELETED",
    entity: "USER",
    entityId: target.id,
    meta: { email: target.email },
  });
  revalidatePath("/admin/pengguna");
  redirect("/admin/pengguna?notice=Pengguna+dihapus");
}
