#!/usr/bin/env node
import { Clerc, helpPlugin, versionPlugin, completionsPlugin } from "clerc";
import build from "./commands/build.js";
import watch from "./commands/watch.js";
import packageJson from "../package.json";

const name = "mdx-collections";
if (!packageJson.bin[name]) {
  throw new Error(`Missing bin entry for ${name} in package.json`);
}

Clerc.create()
  .scriptName(name)
  .description(packageJson.description)
  .version(packageJson.version)
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
