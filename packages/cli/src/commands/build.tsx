import { createBuilder } from "@content-collections/core";

export default async function build(config: string) {
  // TODO: add error handling

  console.log("Building collections...");
  console.time("Finished building collections");
  const builder = await createBuilder(config);
  await builder.build();
  console.timeEnd("Finished building collections");
}
