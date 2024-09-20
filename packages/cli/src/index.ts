#!/usr/bin/env node
import { Clerc, completionsPlugin, helpPlugin, versionPlugin } from "clerc";
import build from "./commands/build.js";
import watch from "./commands/watch.js";

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const packageJson = require("../package.json");

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
