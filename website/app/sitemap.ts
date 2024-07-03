import { FQDN } from "@/lib/env";
import { allSamples } from "content-collections";
import { MetadataRoute } from "next";
import { getPages } from "@/app/source";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${FQDN}/`,
      lastModified: new Date(),
      priority: 1,
    },
    ...getPages().map((docPage) => ({
      url: `${FQDN}${docPage.url}`,
      lastModified: docPage.data.lastModified,
      priority: 0.7,
    })),
    ...allSamples.map((sample) => ({
      url: `${FQDN}${sample.href}`,
      lastModified: sample.lastModified,
      priority: 0.7,
    })),
  ];
}
