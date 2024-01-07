import { createBuilder } from "@content-collections/core";
import { isUnknownError, registerErrorListeners } from "../errors.js";

export default async function build(config: string) {
  console.log("Building collections...");

  console.time("Finished building collections");
  const builder = await createBuilder(config);

  registerErrorListeners(builder);

  let receivedError = false;
  builder.on("cc-error", ({ event, error }) => {
    if (isUnknownError(event)) {
      console.log();
      console.log("Unknown error:", error.message);
      console.log();
    }
    receivedError = true;
  });

  try {
    await builder.build();
  } finally {
    if (receivedError) {
      console.log("Failed to build collections, exiting...");
      process.exit(1);
    } else {
      console.timeEnd("Finished building collections");
    }
  }
}
