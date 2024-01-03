import { createBuilder } from "@mdx-collections/core";

export default async function build(config: string) {
  console.log("Building collections...");
  console.time("Finished building collections");
  const builder = await createBuilder(config);
  await builder.build();
  console.timeEnd("Finished building collections");
}
