import { Builder } from "@content-collections/core";
import path from "node:path";

const handledErrors = ["transformer:validation-error", "collector:parse-error"];

export function isUnknownError(event: string) {
  return !handledErrors.includes(event);
}

export function registerErrorListeners(builder: Builder) {
  builder.on("transformer:singleton-warning", (event) => {
    console.log();
    if (event.kind === "missing") {
      console.log(`Singleton collection "${event.collection.name}" matched no documents. Export will be undefined.`);
    } else {
      console.log(`Singleton collection "${event.collection.name}" matched ${event.documentCount} documents. Using the first match and the rest is ignored.`);
      if (event.filePaths?.length) {
        console.log("Matches:");
        for (const filePath of event.filePaths) {
          console.log("-", path.join(filePath));
        }
      }
    }
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
