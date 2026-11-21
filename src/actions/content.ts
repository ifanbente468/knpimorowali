"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import {
  agendaSchema,
  gallerySchema,
  newsSchema,
} from "@/lib/validation";
import { fail, readNumber, readOptionalString, readString, type ActionState } from "@/lib/form";
import { uniqueAgendaSlug, uniqueNewsSlug } from "@/lib/slugs";
import { audit } from "@/lib/audit";
import { parseMakassarDate } from "@/lib/utils";

function refreshPublicContent() {
  revalidatePath("/");
  revalidatePath("/berita");
  revalidatePath("/agenda");
  revalidatePath("/galeri");
  revalidatePath("/admin");
}

export async function createNewsAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireStaff();
  const parsed = newsSchema.safeParse({
    title: readString(formData, "title"),
    slug: readString(formData, "slug") || undefined,
    excerpt: readString(formData, "excerpt"),
    content: readString(formData, "content"),
    category: readString(formData, "category"),
    coverImage: readOptionalString(formData, "coverImage"),
    status: readString(formData, "status"),
  });

  if (!parsed.success) return fail("Periksa kembali isi berita.", parsed.error);

  const slug = await uniqueNewsSlug(parsed.data.title, parsed.data.slug);
  const news = await prisma.news.create({
    data: {
      slug,
      title: parsed.data.title,
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      category: parsed.data.category,
      coverImage: parsed.data.coverImage ?? null,
      status: parsed.data.status,
      publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null,
      authorId: user.id,
    },
  });

  await audit({
    actorId: user.id,
    action: "NEWS_CREATED",
    entity: "NEWS",
    entityId: news.id,
    meta: { title: news.title, status: news.status },
  });
  refreshPublicContent();
  revalidatePath("/admin/berita");
  redirect(`/admin/berita/${news.id}?notice=Berita+berhasil+dibuat`);
}

export async function updateNewsAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireStaff();
  const id = readString(formData, "id");
  const existing = await prisma.news.findUnique({ where: { id } });
  if (!existing) return fail("Berita tidak ditemukan.");

  const parsed = newsSchema.safeParse({
    title: readString(formData, "title"),
    slug: readString(formData, "slug") || undefined,
    excerpt: readString(formData, "excerpt"),
    content: readString(formData, "content"),
    category: readString(formData, "category"),
    coverImage: readOptionalString(formData, "coverImage"),
    status: readString(formData, "status"),
  });

  if (!parsed.success) return fail("Periksa kembali isi berita.", parsed.error);

  const slug = await uniqueNewsSlug(parsed.data.title, parsed.data.slug, id);
  const publishedAt =
    parsed.data.status === "PUBLISHED" ? existing.publishedAt ?? new Date() : existing.publishedAt;

  await prisma.news.update({
    where: { id },
    data: {
      slug,
      title: parsed.data.title,
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      category: parsed.data.category,
      coverImage: parsed.data.coverImage ?? null,
      status: parsed.data.status,
      publishedAt,
    },
  });

  await audit({
    actorId: user.id,
    action: "NEWS_UPDATED",
    entity: "NEWS",
    entityId: id,
    meta: { status: parsed.data.status },
  });
  refreshPublicContent();
  revalidatePath("/admin/berita");
  revalidatePath(`/admin/berita/${id}`);
  revalidatePath(`/berita/${slug}`);
  return { ok: true, message: "Berita berhasil diperbarui." };
}

export async function deleteNewsAction(formData: FormData) {
  const user = await requireStaff();
  const id = readString(formData, "id");
  const existing = await prisma.news.findUnique({ where: { id } });
  if (!existing) redirect("/admin/berita?error=Berita+tidak+ditemukan");

  await prisma.news.delete({ where: { id } });
  await audit({
    actorId: user.id,
    action: "NEWS_DELETED",
    entity: "NEWS",
    entityId: id,
    meta: { title: existing.title },
  });
  refreshPublicContent();
  revalidatePath("/admin/berita");
  redirect("/admin/berita?notice=Berita+dihapus");
}

export async function createAgendaAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireStaff();
  const parsed = agendaSchema.safeParse({
    title: readString(formData, "title"),
    description: readString(formData, "description"),
    location: readString(formData, "location"),
    startsAt: readString(formData, "startsAt"),
    endsAt: readString(formData, "endsAt") || undefined,
    capacity: readString(formData, "capacity") || undefined,
    status: readString(formData, "status"),
    isPublished: formData.get("isPublished") === "on",
  });

  if (!parsed.success) return fail("Periksa kembali data agenda.", parsed.error);

  const slug = await uniqueAgendaSlug(parsed.data.title);
  await prisma.agenda.create({
    data: {
      slug,
      title: parsed.data.title,
      description: parsed.data.description,
      location: parsed.data.location,
      startsAt: parseMakassarDate(parsed.data.startsAt),
      endsAt: parsed.data.endsAt ? parseMakassarDate(parsed.data.endsAt) : null,
      capacity: parsed.data.capacity ? Number(parsed.data.capacity) : null,
      status: parsed.data.status,
      isPublished: parsed.data.isPublished,
      createdById: user.id,
    },
  });

  await audit({
    actorId: user.id,
    action: "AGENDA_CREATED",
    entity: "AGENDA",
    meta: { title: parsed.data.title },
  });
  refreshPublicContent();
  revalidatePath("/admin/agenda");
  redirect("/admin/agenda?notice=Agenda+berhasil+dibuat");
}

export async function updateAgendaAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireStaff();
  const id = readString(formData, "id");
  const existing = await prisma.agenda.findUnique({ where: { id } });
  if (!existing) return fail("Agenda tidak ditemukan.");

  const parsed = agendaSchema.safeParse({
    title: readString(formData, "title"),
    description: readString(formData, "description"),
    location: readString(formData, "location"),
    startsAt: readString(formData, "startsAt"),
    endsAt: readString(formData, "endsAt") || undefined,
    capacity: readString(formData, "capacity") || undefined,
    status: readString(formData, "status"),
    isPublished: formData.get("isPublished") === "on",
  });

  if (!parsed.success) return fail("Periksa kembali data agenda.", parsed.error);

  const slug = await uniqueAgendaSlug(parsed.data.title, id);
  await prisma.agenda.update({
    where: { id },
    data: {
      slug,
      title: parsed.data.title,
      description: parsed.data.description,
      location: parsed.data.location,
      startsAt: parseMakassarDate(parsed.data.startsAt),
      endsAt: parsed.data.endsAt ? parseMakassarDate(parsed.data.endsAt) : null,
      capacity: parsed.data.capacity ? Number(parsed.data.capacity) : null,
      status: parsed.data.status,
      isPublished: parsed.data.isPublished,
    },
  });

  await audit({
    actorId: user.id,
    action: "AGENDA_UPDATED",
    entity: "AGENDA",
    entityId: id,
  });
  refreshPublicContent();
  revalidatePath("/admin/agenda");
  return { ok: true, message: "Agenda berhasil diperbarui." };
}

export async function deleteAgendaAction(formData: FormData) {
  const user = await requireStaff();
  const id = readString(formData, "id");
  const existing = await prisma.agenda.findUnique({ where: { id } });
  if (!existing) redirect("/admin/agenda?error=Agenda+tidak+ditemukan");

  await prisma.agenda.delete({ where: { id } });
  await audit({
    actorId: user.id,
    action: "AGENDA_DELETED",
    entity: "AGENDA",
    entityId: id,
    meta: { title: existing.title },
  });
  refreshPublicContent();
  revalidatePath("/admin/agenda");
  redirect("/admin/agenda?notice=Agenda+dihapus");
}

export async function createGalleryAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireStaff();
  const parsed = gallerySchema.safeParse({
    title: readString(formData, "title"),
    album: readString(formData, "album"),
    imageUrl: readString(formData, "imageUrl"),
    caption: readOptionalString(formData, "caption"),
    sortOrder: readNumber(formData, "sortOrder"),
  });

  if (!parsed.success) return fail("Periksa kembali data galeri.", parsed.error);

  await prisma.galleryItem.create({
    data: {
      title: parsed.data.title,
      album: parsed.data.album,
      imageUrl: parsed.data.imageUrl,
      caption: parsed.data.caption ?? null,
      sortOrder: parsed.data.sortOrder ?? 0,
      createdById: user.id,
    },
  });

  await audit({ actorId: user.id, action: "GALLERY_CREATED", entity: "GALLERY" });
  refreshPublicContent();
  revalidatePath("/admin/galeri");
  redirect("/admin/galeri?notice=Foto+ditambahkan");
}

export async function updateGalleryAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireStaff();
  const id = readString(formData, "id");
  const existing = await prisma.galleryItem.findUnique({ where: { id } });
  if (!existing) return fail("Foto tidak ditemukan.");

  const parsed = gallerySchema.safeParse({
    title: readString(formData, "title"),
    album: readString(formData, "album"),
    imageUrl: readString(formData, "imageUrl"),
    caption: readOptionalString(formData, "caption"),
    sortOrder: readNumber(formData, "sortOrder"),
  });

  if (!parsed.success) return fail("Periksa kembali data galeri.", parsed.error);

  await prisma.galleryItem.update({
    where: { id },
    data: {
      title: parsed.data.title,
      album: parsed.data.album,
      imageUrl: parsed.data.imageUrl,
      caption: parsed.data.caption ?? null,
      sortOrder: parsed.data.sortOrder ?? 0,
    },
  });

  await audit({ actorId: user.id, action: "GALLERY_UPDATED", entity: "GALLERY", entityId: id });
  refreshPublicContent();
  revalidatePath("/admin/galeri");
  redirect("/admin/galeri?notice=Foto+diperbarui");
}

export async function deleteGalleryAction(formData: FormData) {
  const user = await requireStaff();
  const id = readString(formData, "id");
  await prisma.galleryItem.delete({ where: { id } }).catch(() => null);
  await audit({ actorId: user.id, action: "GALLERY_DELETED", entity: "GALLERY", entityId: id });
  refreshPublicContent();
  revalidatePath("/admin/galeri");
  redirect("/admin/galeri?notice=Foto+dihapus");
}

export async function updateAspirationAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireStaff();
  const id = readString(formData, "id");
  const status = readString(formData, "status");
  const response = readString(formData, "response");
  const isPublic = formData.get("isPublic") === "on";

  if (!["NEW", "IN_PROGRESS", "RESOLVED", "REJECTED"].includes(status)) {
    return fail("Status aspirasi tidak valid.");
  }

  const existing = await prisma.aspiration.findUnique({ where: { id } });
  if (!existing) return fail("Aspirasi tidak ditemukan.");

  if (status === "RESOLVED" && !response) {
    return fail("Tanggapan wajib diisi sebelum menandai selesai.");
  }

  await prisma.aspiration.update({
    where: { id },
    data: {
      status: status as "NEW" | "IN_PROGRESS" | "RESOLVED" | "REJECTED",
      response: response || existing.response,
      isPublic,
      respondedAt: new Date(),
      respondedById: user.id,
    },
  });

  await audit({
    actorId: user.id,
    action: "ASPIRATION_RESPONDED",
    entity: "ASPIRATION",
    entityId: id,
    meta: { status },
  });
  revalidatePath("/admin/aspirasi");
  revalidatePath(`/admin/aspirasi/${id}`);
  revalidatePath("/aspirasi");
  return { ok: true, message: "Tanggapan aspirasi disimpan." };
}

