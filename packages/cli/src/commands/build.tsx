import { build as buildAll } from "@mdx-collections/core";

export default async function build(config: string) {
  console.log("Building collections...");
  console.time("Finished building collections");
  await buildAll(config);
  console.timeEnd("Finished building collections");
}
