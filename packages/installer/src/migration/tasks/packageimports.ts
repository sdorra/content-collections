import { existsSync } from "fs";
import fs from "fs/promises";
import { join } from "path";
import { Task } from "./index.js";

const specifier = "#content-collections";
const target = "./.content-collections/generated/index.js";

export function addSubpathImport(directory: string): Task {
  return {
    name: "Add subpath import to package.json",
    run: async () => {
      const packageJsonPath = join(directory, "package.json");
      if (!existsSync(packageJsonPath)) {
        return {
          status: "error",
          message: "could not find package.json",
        };
      }

      const content = await fs.readFile(packageJsonPath, "utf-8");
      const packageJson = JSON.parse(content);

      const existing = packageJson.imports?.[specifier];
      if (existing === target) {
        return {
          status: "skipped",
          message: `${specifier} subpath import already exists`,
        };
      }

      if (existing !== undefined) {
        return {
          status: "error",
          message: `${specifier} subpath import already exists with different value`,
        };
      }

      packageJson.imports = { ...packageJson.imports, [specifier]: target };

      // keep the indentation of the existing file
      const indent = content.match(/^([ \t]+)"/m)?.[1] ?? 2;
      const newline = content.endsWith("\n") ? "\n" : "";

      await fs.writeFile(
        packageJsonPath,
        JSON.stringify(packageJson, null, indent) + newline,
      );

      return {
        status: "changed",
        message: `Added ${specifier} subpath import to ${packageJsonPath}`,
      };
    },
  };
}
