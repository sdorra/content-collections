import { existsSync } from "fs";
import fs from "fs/promises";
import JSONC from "comment-json";
import { join } from "path";
import { Task } from "./index.js";

export function addAliasToTsConfig(directory: string): Task {
  return {
    name: "Add alias to tsconfig",
    async run() {
      const tsConfigPath = join(directory, "tsconfig.json");
      if (!existsSync(tsConfigPath)) {
        return {
          status: "skipped",
          message: "tsconfig.json not found",
        }
      }

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
            return {
              status: "skipped",
              message: "content-collections alias already exists",
            }
          } else {
            return {
              status: "error",
              message: "content-collections alias already exists and is pointing to a different path",
            }
          }
        }
      }

      tsConfig.compilerOptions.paths["content-collections"] = [
        "./.content-collections/generated",
      ];

      await fs.writeFile(tsConfigPath, JSONC.stringify(tsConfig, null, 2));

      return {
        status: "changed",
        message: "Added content-collections alias to tsconfig",
      };
    },
  };
}
