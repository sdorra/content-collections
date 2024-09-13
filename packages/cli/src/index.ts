#!/usr/bin/env node
import { Clerc, completionsPlugin, helpPlugin, versionPlugin } from "clerc";
import packageJson from "../package.json" assert { type: "json" };
import build from "./commands/build.js";
import watch from "./commands/watch.js";

const name = "content-collections";
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
        default: "content-collections.ts",
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
        default: "content-collections.ts",
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
