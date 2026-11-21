"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import {
  financeSchema,
  letterSchema,
  organizationSchema,
  settingsSchema,
} from "@/lib/validation";
import {
  fail,
  readOptionalString,
  readString,
  type ActionState,
} from "@/lib/form";
import { audit } from "@/lib/audit";
import { parseMakassarDate } from "@/lib/utils";

const SETTING_KEYS = [
  "site_name",
  "site_tagline",
  "contact_email",
  "contact_phone",
  "address",
  "chairman_name",
  "chairman_title",
  "chairman_message",
  "instagram",
  "facebook",
  "youtube",
  "map_url",
  "hero_image",
] as const;

export async function createLetterAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = letterSchema.safeParse({
    number: readString(formData, "number"),
    type: readString(formData, "type"),
    subject: readString(formData, "subject"),
    sender: readString(formData, "sender"),
    recipient: readString(formData, "recipient"),
    date: readString(formData, "date"),
    fileUrl: readOptionalString(formData, "fileUrl"),
    status: readString(formData, "status"),
    notes: readOptionalString(formData, "notes"),
  });

  if (!parsed.success) return fail("Periksa kembali data surat.", parsed.error);

  const duplicate = await prisma.letter.findUnique({
    where: { number: parsed.data.number },
    select: { id: true },
  });
  if (duplicate) return fail("Nomor surat sudah digunakan.");

  await prisma.letter.create({
    data: {
      number: parsed.data.number,
      type: parsed.data.type,
      subject: parsed.data.subject,
      sender: parsed.data.sender,
      recipient: parsed.data.recipient,
      date: parseMakassarDate(parsed.data.date),
      fileUrl: parsed.data.fileUrl ?? null,
      status: parsed.data.status,
      notes: parsed.data.notes ?? null,
      createdById: user.id,
    },
  });

  await audit({
    actorId: user.id,
    action: "LETTER_CREATED",
    entity: "LETTER",
    meta: { number: parsed.data.number },
  });
  revalidatePath("/admin/persuratan");
  redirect("/admin/persuratan?notice=Surat+berhasil+ditambahkan");
}

export async function updateLetterAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin();
  const id = readString(formData, "id");
  const existing = await prisma.letter.findUnique({ where: { id } });
  if (!existing) return fail("Surat tidak ditemukan.");

  const parsed = letterSchema.safeParse({
    number: readString(formData, "number"),
    type: readString(formData, "type"),
    subject: readString(formData, "subject"),
    sender: readString(formData, "sender"),
    recipient: readString(formData, "recipient"),
    date: readString(formData, "date"),
    fileUrl: readOptionalString(formData, "fileUrl"),
    status: readString(formData, "status"),
    notes: readOptionalString(formData, "notes"),
  });

  if (!parsed.success) return fail("Periksa kembali data surat.", parsed.error);

  const duplicate = await prisma.letter.findFirst({
    where: { number: parsed.data.number, id: { not: id } },
    select: { id: true },
  });
  if (duplicate) return fail("Nomor surat sudah digunakan.");

  await prisma.letter.update({
    where: { id },
    data: {
      number: parsed.data.number,
      type: parsed.data.type,
      subject: parsed.data.subject,
      sender: parsed.data.sender,
      recipient: parsed.data.recipient,
      date: parseMakassarDate(parsed.data.date),
      fileUrl: parsed.data.fileUrl ?? null,
      status: parsed.data.status,
      notes: parsed.data.notes ?? null,
    },
  });

  await audit({ actorId: user.id, action: "LETTER_UPDATED", entity: "LETTER", entityId: id });
  revalidatePath("/admin/persuratan");
  revalidatePath(`/admin/persuratan/${id}`);
  return { ok: true, message: "Surat berhasil diperbarui." };
}

export async function deleteLetterAction(formData: FormData) {
  const user = await requireAdmin();
  const id = readString(formData, "id");
  await prisma.letter.delete({ where: { id } }).catch(() => null);
  await audit({ actorId: user.id, action: "LETTER_DELETED", entity: "LETTER", entityId: id });
  revalidatePath("/admin/persuratan");
  redirect("/admin/persuratan?notice=Surat+dihapus");
}

export async function createFinanceAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = financeSchema.safeParse({
    date: readString(formData, "date"),
    type: readString(formData, "type"),
    category: readString(formData, "category"),
    description: readString(formData, "description"),
    amount: readString(formData, "amount"),
    reference: readOptionalString(formData, "reference"),
  });

  if (!parsed.success) return fail("Periksa kembali data transaksi.", parsed.error);

  await prisma.finance.create({
    data: {
      date: parseMakassarDate(parsed.data.date),
      type: parsed.data.type,
      category: parsed.data.category,
      description: parsed.data.description,
      amount: parsed.data.amount,
      reference: parsed.data.reference ?? null,
      createdById: user.id,
    },
  });

  await audit({
    actorId: user.id,
    action: "FINANCE_CREATED",
    entity: "FINANCE",
    meta: { type: parsed.data.type, amount: parsed.data.amount },
  });
  revalidatePath("/admin/keuangan");
  redirect("/admin/keuangan?notice=Transaksi+berhasil+ditambahkan");
}

export async function deleteFinanceAction(formData: FormData) {
  const user = await requireAdmin();
  const id = readString(formData, "id");
  const existing = await prisma.finance.findUnique({ where: { id } });
  if (existing) {
    await prisma.finance.delete({ where: { id } });
    await audit({
      actorId: user.id,
      action: "FINANCE_DELETED",
      entity: "FINANCE",
      entityId: id,
      meta: { amount: existing.amount, type: existing.type },
    });
  }
  revalidatePath("/admin/keuangan");
  redirect("/admin/keuangan?notice=Transaksi+dihapus");
}

export async function createOrganizationAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = organizationSchema.safeParse({
    name: readString(formData, "name"),
    type: readString(formData, "type"),
    leader: readOptionalString(formData, "leader"),
    address: readOptionalString(formData, "address"),
    phone: readOptionalString(formData, "phone"),
    email: readOptionalString(formData, "email"),
    website: readOptionalString(formData, "website"),
    logoUrl: readOptionalString(formData, "logoUrl"),
    description: readOptionalString(formData, "description"),
    sortOrder: readOptionalString(formData, "sortOrder"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) return fail("Periksa kembali data organisasi.", parsed.error);

  const duplicate = await prisma.organization.findUnique({
    where: { name: parsed.data.name },
    select: { id: true },
  });
  if (duplicate) return fail("Nama organisasi sudah terdaftar.");

  await prisma.organization.create({
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      leader: parsed.data.leader ?? null,
      address: parsed.data.address ?? null,
      phone: parsed.data.phone ?? null,
      email: parsed.data.email || null,
      website: parsed.data.website ?? null,
      logoUrl: parsed.data.logoUrl ?? null,
      description: parsed.data.description ?? null,
      sortOrder: parsed.data.sortOrder ?? 0,
      isActive: parsed.data.isActive ?? true,
      createdById: user.id,
    },
  });

  await audit({
    actorId: user.id,
    action: "ORGANIZATION_CREATED",
    entity: "ORGANIZATION",
    meta: { name: parsed.data.name },
  });
  revalidatePath("/admin/organisasi");
  revalidatePath("/organisasi");
  redirect("/admin/organisasi?notice=Organisasi+ditambahkan");
}

export async function updateOrganizationAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin();
  const id = readString(formData, "id");
  const existing = await prisma.organization.findUnique({ where: { id } });
  if (!existing) return fail("Organisasi tidak ditemukan.");

  const parsed = organizationSchema.safeParse({
    name: readString(formData, "name"),
    type: readString(formData, "type"),
    leader: readOptionalString(formData, "leader"),
    address: readOptionalString(formData, "address"),
    phone: readOptionalString(formData, "phone"),
    email: readOptionalString(formData, "email"),
    website: readOptionalString(formData, "website"),
    logoUrl: readOptionalString(formData, "logoUrl"),
    description: readOptionalString(formData, "description"),
    sortOrder: readOptionalString(formData, "sortOrder"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) return fail("Periksa kembali data organisasi.", parsed.error);

  const duplicate = await prisma.organization.findFirst({
    where: { name: parsed.data.name, id: { not: id } },
    select: { id: true },
  });
  if (duplicate) return fail("Nama organisasi sudah terdaftar.");

  await prisma.organization.update({
    where: { id },
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      leader: parsed.data.leader ?? null,
      address: parsed.data.address ?? null,
      phone: parsed.data.phone ?? null,
      email: parsed.data.email || null,
      website: parsed.data.website ?? null,
      logoUrl: parsed.data.logoUrl ?? null,
      description: parsed.data.description ?? null,
      sortOrder: parsed.data.sortOrder ?? 0,
      isActive: parsed.data.isActive ?? true,
    },
  });

  await audit({
    actorId: user.id,
    action: "ORGANIZATION_UPDATED",
    entity: "ORGANIZATION",
    entityId: id,
  });
  revalidatePath("/admin/organisasi");
  revalidatePath("/organisasi");
  redirect("/admin/organisasi?notice=Organisasi+diperbarui");
}

export async function deleteOrganizationAction(formData: FormData) {
  const user = await requireAdmin();
  const id = readString(formData, "id");
  await prisma.organization.delete({ where: { id } }).catch(() => null);
  await audit({
    actorId: user.id,
    action: "ORGANIZATION_DELETED",
    entity: "ORGANIZATION",
    entityId: id,
  });
  revalidatePath("/admin/organisasi");
  revalidatePath("/organisasi");
  redirect("/admin/organisasi?notice=Organisasi+dihapus");
}

export async function updateSettingsAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin();
  const raw = Object.fromEntries(SETTING_KEYS.map((key) => [key, readString(formData, key)]));
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) return fail("Periksa kembali pengaturan situs.", parsed.error);

  const updates = SETTING_KEYS.map((key) => ({ key, value: raw[key] ?? "" }));

  await prisma.$transaction(
    updates.map((item) =>
      prisma.setting.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: { key: item.key, value: item.value },
      }),
    ),
  );

  await audit({ actorId: user.id, action: "SETTINGS_UPDATED", entity: "SETTING" });
  revalidatePath("/");
  revalidatePath("/profil");
  revalidatePath("/admin/pengaturan");
  return { ok: true, message: "Pengaturan situs disimpan." };
}
