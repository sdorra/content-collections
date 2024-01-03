import { createBuilder } from "@content-collections/core";

export default async function watch(configPath: string) {
  console.log("start initial build");
  console.time("finished initial build");
  const builder = await createBuilder(configPath);
  await builder.build();
  console.timeEnd("finished initial build");

  console.log("start watching ...");
  builder.watch();
}
