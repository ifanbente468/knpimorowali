import "server-only";

import { cache } from "react";
import { prisma } from "@/lib/db";
import { SITE } from "@/lib/constants";

export const getSettings = cache(async () => {
  const rows = await prisma.setting.findMany();
  const map = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  return {
    siteName: map.site_name ?? SITE.name,
    fullName: SITE.fullName,
    tagline: map.site_tagline ?? SITE.tagline,
    email: map.contact_email ?? SITE.email,
    phone: map.contact_phone ?? SITE.phone,
    address: map.address ?? SITE.address,
    chairmanName: map.chairman_name ?? "",
    chairmanTitle: map.chairman_title ?? "Ketua DPD KNPI Kabupaten Morowali",
    chairmanMessage: map.chairman_message ?? "",
    instagram: map.instagram ?? "",
    facebook: map.facebook ?? "",
    youtube: map.youtube ?? "",
    mapUrl: map.map_url ?? SITE.mapUrl,
    heroImage: map.hero_image ?? "/images/hero.jpg",
  };
});

export type SiteSettings = Awaited<ReturnType<typeof getSettings>>;
