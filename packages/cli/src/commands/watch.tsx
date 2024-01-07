import { createBuilder } from "@content-collections/core";
import path from "path";

export default async function watch(configPath: string) {
  const builder = await createBuilder(configPath);

  // TODO: log errors

  builder.on("build:start", () => {
    console.log("build started ...");
  });
  builder.on("build:end", (event) => {
    console.log(
      "... finished build in",
      event.endedAt - event.startedAt + "ms"
    );
  });
  builder.on("watch:file-changed", (event) => {
    const relativePath = path.relative(process.cwd(), event.filePath);
    if (event.modification === "delete") {
      console.log("... file deleted", relativePath);
    } else {
      console.log("... file changed", relativePath);
    }
  });

  await builder.build();

  console.log("start watching ...");
  builder.watch();
}
