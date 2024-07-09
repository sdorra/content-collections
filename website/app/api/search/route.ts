import { allSamples } from "@/.content-collections/generated";
import { getPages } from "@/app/source";
import { createSearchAPI } from "fumadocs-core/search/server";

function createIndexes() {
  const pageIndexes = getPages().map((page) => ({
    title: page.data.title,
    structuredData: page.data.structuredData,
    id: page.url,
    url: page.url,
  }))

  const sampleIndexes = allSamples.map((sample) => ({
    title: sample.title,
    id: sample.href,
    url: sample.href,
    structuredData: sample.structuredData,
  }));

  return pageIndexes.concat(sampleIndexes);
}

export const { GET } = createSearchAPI("advanced", {
  indexes: createIndexes(),
});
