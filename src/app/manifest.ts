import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KNPI Morowali",
    short_name: "KNPI Morowali",
    description:
      "Platform digital DPD KNPI Kabupaten Morowali: berita, agenda, anggota, dan aspirasi pemuda.",
    start_url: "/",
    display: "standalone",
    background_color: "#F4F6FB",
    theme_color: "#0A3BC4",
    lang: "id",
    icons: [
      {
        src: "/images/logo.jpg",
        sizes: "512x512",
        type: "image/jpeg",
      },
    ],
  };
}
