import { Builder } from "@content-collections/core";
import path from "node:path";

const handledErrors = ["transformer:validation-error", "collector:parse-error"];

export function isUnknownError(event: string) {
  return !handledErrors.includes(event);
}

export function registerErrorListeners(builder: Builder) {
  builder.on("transformer:singleton-warning", (event) => {
    console.log();
    console.log(`Singleton collection "${event.collection.name}" matched no documents. Export will be undefined.`);
    console.log();
  });

  builder.on("transformer:validation-error", (event) => {
    console.log();
    const location =
      "filePath" in (event.collection as any)
        ? (event.collection as any).filePath
        : path.join((event.collection as any).directory, event.file.path);
    console.log("Validation failed on", location + ":");
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
