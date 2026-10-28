import type { MetadataRoute } from "next";
import { getPrendas } from "@/lib/drops";
import { SITIO_URL } from "@/lib/marca";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const prendas = await getPrendas();
  return [
    { url: SITIO_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITIO_URL}/colaboraciones`, changeFrequency: "monthly", priority: 0.6 },
    ...prendas.map(({ producto, agotada }) => ({
      url: `${SITIO_URL}/prenda/${producto.slug}`,
      changeFrequency: "weekly" as const,
      priority: agotada ? 0.4 : 0.8,
    })),
  ];
}
