import "server-only";

import { prisma } from "@/lib/db";

export async function nextMemberNumber() {
  const year = new Date().getFullYear();
  const prefix = `KNPI-MOR-${year}-`;
  const latest = await prisma.member.findFirst({
    where: { memberNo: { startsWith: prefix } },
    orderBy: { memberNo: "desc" },
    select: { memberNo: true },
  });

  const lastSequence = latest?.memberNo
    ? Number(latest.memberNo.slice(prefix.length)) || 0
    : 0;

  return `${prefix}${String(lastSequence + 1).padStart(5, "0")}`;
}

export async function nextTrackingCode() {
  const year = new Date().getFullYear();
  const prefix = `ASP-${year}-`;
  const latest = await prisma.aspiration.findFirst({
    where: { trackingCode: { startsWith: prefix } },
    orderBy: { trackingCode: "desc" },
    select: { trackingCode: true },
  });

  const lastSequence = latest?.trackingCode
    ? Number(latest.trackingCode.slice(prefix.length)) || 0
    : 0;

  return `${prefix}${String(lastSequence + 1).padStart(4, "0")}`;
}
