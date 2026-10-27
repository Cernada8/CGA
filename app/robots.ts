import type { MetadataRoute } from "next";
import { SITIO_URL } from "@/lib/marca";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dev/", "/admin"] }],
    sitemap: `${SITIO_URL}/sitemap.xml`,
  };
}
