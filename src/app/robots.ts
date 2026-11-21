import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/akun", "/masuk", "/api", "/uploads", "/install"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
