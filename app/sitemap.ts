import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { STATE_SLUGS } from "@/lib/states";
import { EXTRA_TOOLS } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const states = STATE_SLUGS.map((slug) => ({
    url: `${SITE_URL}/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const tools = EXTRA_TOOLS.map((t) => ({
    url: `${SITE_URL}/${t.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  const pages = ["about", "contact", "privacy"].map((p) => ({
    url: `${SITE_URL}/${p}`,
    changeFrequency: "yearly" as const,
    priority: 0.3,
  }));

  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...tools,
    ...states,
    ...pages,
  ];
}
