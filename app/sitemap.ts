import type { MetadataRoute } from "next";
import { SITIO_URL } from "@/lib/marca";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITIO_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITIO_URL}/colaboraciones`, changeFrequency: "monthly", priority: 0.6 },
  ];
}
