#!/usr/bin/env node
import { Clerc, helpPlugin, versionPlugin, completionsPlugin } from "clerc";
import build from "./commands/build.js";
import watch from "./commands/watch.js";

Clerc.create()
  .scriptName("mdx-collections")
  .description("Build collections from MDX files")
  .version("1.0.0")
  .command("build", "Build collections", {
    flags: {
      config: {
        type: String,
        description: "Path to config file",
        default: "mdxcol.config.ts",
      },
    },
  })
  .on("build", (context) => {
    return build(context.flags.config);
  })
  .command("watch", "Build collections and watch for changes", {
    flags: {
      config: {
        type: String,
        description: "Path to config file",
        default: "mdxcol.config.ts",
      },
    },
  })
  .on("watch", async (context) => {
    return watch(context.flags.config);
  })
  .use(helpPlugin())
  .use(versionPlugin())
  .use(completionsPlugin())
  .parse();
