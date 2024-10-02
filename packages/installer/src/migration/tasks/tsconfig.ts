import { existsSync } from "fs";
import fs from "fs/promises";
import JSONC from "comment-json";
import { join } from "path";
import { Task } from "./index.js";

export function addAliasToTsConfig(directory: string): Task | null {
  const tsConfigPath = join(directory, "tsconfig.json");
  if (!existsSync(tsConfigPath)) {
    console.log("tsconfig.json not found, skipping");
    return null;
  }

  return {
    name: "Add alias to tsconfig",
    async run() {
      const tsConfig: any = JSONC.parse(await fs.readFile(tsConfigPath, "utf-8"));

      if (!tsConfig.compilerOptions) {
        tsConfig.compilerOptions = {};
      }

      if (!tsConfig.compilerOptions.paths) {
        tsConfig.compilerOptions.paths = {};
      }

      const alias = tsConfig.compilerOptions.paths["content-collections"];
      if (alias) {
        const [first] = alias;
        if (first) {
          if (first === "./.content-collections/generated") {
            return false;
          } else {
            throw new Error("content-collections alias already exists");
          }
        }
      }

      tsConfig.compilerOptions.paths["content-collections"] = [
        "./.content-collections/generated",
      ];

      await fs.writeFile(tsConfigPath, JSONC.stringify(tsConfig, null, 2));

      return true;
    },
  };
}
