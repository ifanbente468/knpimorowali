import "server-only";

import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
  fallback: string,
) {
  const root = slugify(base) || fallback;
  let candidate = root;
  let counter = 1;

  while (await exists(candidate)) {
    counter += 1;
    candidate = `${root}-${counter}`;
    if (counter > 200) {
      candidate = `${root}-${Date.now()}`;
      break;
    }
  }

  return candidate;
}

export async function uniqueNewsSlug(title: string, requested?: string, ignoreId?: string) {
  return uniqueSlug(
    requested || title,
    async (slug) => {
      const found = await prisma.news.findUnique({ where: { slug }, select: { id: true } });
      return Boolean(found && found.id !== ignoreId);
    },
    "berita",
  );
}

export async function uniqueAgendaSlug(title: string, ignoreId?: string) {
  return uniqueSlug(
    title,
    async (slug) => {
      const found = await prisma.agenda.findUnique({ where: { slug }, select: { id: true } });
      return Boolean(found && found.id !== ignoreId);
    },
    "agenda",
  );
}
