import { FQDN } from "@/lib/env";
import { allDocs, allQuickstarts, allSamples } from "content-collections";
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${FQDN}/`,
      lastModified: new Date(),
      priority: 1,
    },
    ...allQuickstarts.map((quickstart) => ({
      url: `${FQDN}/${quickstart.href}`,
      lastModified: quickstart.lastModified,
      priority: 0.8,
    })),
    ...allDocs.map((docPage) => ({
      url: `${FQDN}/${docPage.href}`,
      lastModified: docPage.lastModified,
      priority: 0.7,
    })),
    ...allSamples.map((sample) => ({
      url: `${FQDN}/${sample.href}`,
      lastModified: sample.lastModified,
      priority: 0.7,
    })),
  ];
}
