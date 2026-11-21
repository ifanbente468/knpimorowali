"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { aspirationSchema } from "@/lib/validation";
import { fail, readBoolean, readString, type ActionState } from "@/lib/form";
import { getClientIp } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { nextTrackingCode } from "@/lib/identifiers";
import { audit } from "@/lib/audit";

export async function submitAspirationAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (readString(formData, "website")) {
    return fail("Aspirasi tidak dapat dikirim.");
  }

  const headerStore = await headers();
  const ip = getClientIp(headerStore);
  const limit = rateLimit(`aspiration:${ip}`, { limit: 3, windowMs: 60 * 60 * 1000 });
  if (!limit.allowed) {
    return fail(
      `Terlalu banyak pengiriman aspirasi. Silakan coba lagi dalam ${limit.retryAfterSeconds} detik.`,
    );
  }

  const parsed = aspirationSchema.safeParse({
    name: readString(formData, "name"),
    email: readString(formData, "email"),
    phone: readString(formData, "phone"),
    category: readString(formData, "category"),
    subject: readString(formData, "subject"),
    message: readString(formData, "message"),
    isPublic: readBoolean(formData, "isPublic"),
  });

  if (!parsed.success) {
    return fail("Periksa kembali isian aspirasi Anda.", parsed.error);
  }

  const user = await getCurrentUser();
  const trackingCode = await nextTrackingCode();

  const aspiration = await prisma.aspiration.create({
    data: {
      trackingCode,
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      category: parsed.data.category,
      subject: parsed.data.subject,
      message: parsed.data.message,
      isPublic: parsed.data.isPublic ?? false,
      authorId: user?.id ?? null,
    },
  });

  await audit({
    actorId: user?.id ?? null,
    action: "ASPIRATION_SUBMITTED",
    entity: "ASPIRATION",
    entityId: aspiration.id,
    ip,
  });

  redirect(`/aspirasi/sukses?kode=${encodeURIComponent(trackingCode)}`);
}
