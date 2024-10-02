import { join } from "node:path";
import { Task } from "./index.js";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";

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

export function addToGitIgnore(directory: string): Task | null {
  const gitIgnore = findGitIgnore(directory);
  if (!gitIgnore) {
    console.log("No .gitignore found, skipping");
    return null;
  }

  return {
    name: "Add .content-collections to .gitignore",
    run: async () => {
      let content = await fs.readFile(gitIgnore, "utf-8");

      if (content.includes(".content-collections")) {
        return false;
      }

      content += "\n.content-collections\n";

      await fs.writeFile(gitIgnore, content);

      return true;
    },
  };
}
