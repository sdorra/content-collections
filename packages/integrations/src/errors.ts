import { Builder } from "@content-collections/core";
import path from "node:path";

const handledErrors = ["transformer:validation-error", "collector:parse-error"];

export function isUnknownError(event: string) {
  return !handledErrors.includes(event);
}

export function registerErrorListeners(builder: Builder) {
  builder.on("transformer:validation-error", (event) => {
    console.log();
    console.log(
      "Validation failed on",
      path.join(event.collection.directory, event.file.path) + ":",
    );
    console.log(event.error.message);
    console.log();
  });

  builder.on("collector:parse-error", (event) => {
    console.log();
    console.log("Failed to parse file", path.join(event.filePath) + ":");
    console.log(event.error.message);
    console.log();
  });
}
