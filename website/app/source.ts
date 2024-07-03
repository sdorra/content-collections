import { allDocs, allMetas, allSamples } from "content-collections";
import { loader } from "fumadocs-core/source";
import { createMDXSource } from "@fumadocs/content-collections";
import type { PageTree } from "fumadocs-core/server";

export const { getPage, getPages, pageTree } = loader({
  baseUrl: "/docs",
  source: createMDXSource(allDocs, allMetas),
});

pageTree.children.push(
  {
    type: "separator",
    name: "Samples",
  },
  ...allSamples.map<PageTree.Item>((page) => ({
    type: "page",
    name: page.title,
    url: page.href,
  })),
);
