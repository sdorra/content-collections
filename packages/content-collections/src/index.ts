#!/usr/bin/env node

import { Clerc } from "@clerc/core";
import { completionsPlugin } from "@clerc/plugin-completions";
import { helpPlugin } from "@clerc/plugin-help";
import { versionPlugin } from "@clerc/plugin-version";
import install from "./commands/install.js";

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
  .command("install", "Installs content-collection to a existing project", {
    flags: {
      directory: {
        type: String,
        description: "Path to the existing project",
        default: ".",
      },
    },
  })
  .on("install", (context) => {
    return install(context.flags.directory);
  })
  .use(helpPlugin())
  .use(versionPlugin())
  .use(completionsPlugin())
  .parse();
