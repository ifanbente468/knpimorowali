import "server-only";

import { prisma } from "@/lib/db";

export async function audit(input: {
  actorId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  meta?: Record<string, unknown>;
  ip?: string | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        meta: input.meta ? JSON.stringify(input.meta).slice(0, 4000) : null,
        ip: input.ip?.slice(0, 100) ?? null,
      },
    });
  } catch {
    console.error("Gagal menulis audit log");
  }
}
