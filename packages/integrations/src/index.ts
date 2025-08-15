import { Builder } from "@content-collections/core";
import path from "node:path";
import { isUnknownError, registerErrorListeners } from "./errors.js";

export function configureLogging(builder: Builder) {
  builder.on("builder:start", () => {
    console.log("build started ...");
  });

  builder.on("builder:end", (event) => {
    console.log(
      "... finished build of",
      event.stats.collections,
      event.stats.collections === 1 ? "collection" : "collections",
      "and",
      event.stats.documents,
      event.stats.documents === 1 ? "document" : "documents",
      "in",
      event.endedAt - event.startedAt + "ms",
    );
  });

  builder.on("watcher:config-changed", () => console.log("... config changed"));

  builder.on("watcher:file-changed", (event) => {
    const relativePath = path.relative(process.cwd(), event.filePath);
    if (event.modification === "delete") {
      console.log("... file", relativePath, "deleted");
    } else {
      console.log("... file", relativePath, "changed");
    }
  });

  builder.on("transformer:document-skipped", (event) => {
    const relativePath = path.relative(process.cwd(), event.filePath);
    console.log("... document", relativePath, "skipped", "due to", event.reason);
  });

  registerErrorListeners(builder);

  builder.on("_error", ({ _event, error }) => {
    if (isUnknownError(_event)) {
      console.log("... error", error.message);
    }
  });
}
