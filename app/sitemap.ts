import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { STATE_SLUGS } from "@/lib/states";

export default function sitemap(): MetadataRoute.Sitemap {
  const states = STATE_SLUGS.map((slug) => ({
    url: `${SITE_URL}/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...states,
  ];
}
