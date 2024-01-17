import { createBuilder } from "@content-collections/core";
import { configureLogging } from "@content-collections/integrations";

export default async function watch(configPath: string) {
  const builder = await createBuilder(configPath);
  configureLogging(builder);

  await builder.build();

  console.log("start watching ...");
  builder.watch();
}
