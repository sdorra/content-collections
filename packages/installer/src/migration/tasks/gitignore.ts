import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { join } from "node:path";
import { Task } from "./index.js";

function findGitIgnore(directory: string): string | null {
  let current = directory;
  while (current !== "/") {
    const gitIgnore = join(current, ".gitignore");
    if (existsSync(gitIgnore)) {
      return gitIgnore;
    }

    current = join(current, "..");
  }

  return null;
}

export function addToGitIgnore(directory: string): Task {
  return {
    name: "Add .content-collections to .gitignore",
    run: async () => {
      const gitIgnore = findGitIgnore(directory);
      if (!gitIgnore) {
        return {
          status: "skipped",
          message: "No .gitignore found",
        };
      }

      let content = await fs.readFile(gitIgnore, "utf-8");

      if (content.includes(".content-collections")) {
        return {
          status: "skipped",
          message: ".content-collections already in .gitignore",
        };
      }

      content += "\n.content-collections\n";

      await fs.writeFile(gitIgnore, content);

      return {
        status: "changed",
        message: "Added .content-collections to .gitignore",
      };
    },
  };
}
