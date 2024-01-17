import { createBuilder } from "@content-collections/core";
import { configureLogging } from "@content-collections/integrations";

export default async function build(config: string) {
  const builder = await createBuilder(config);
  configureLogging(builder);

  let receivedError = false;
  builder.on("_error", () => {
    receivedError = true;
  });

  try {
    await builder.build();
  } finally {
    if (receivedError) {
      console.log("Failed to build collections, exiting...");
      process.exit(1);
    }
  }
}
