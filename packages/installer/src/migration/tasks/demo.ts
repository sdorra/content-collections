import { existsSync } from "fs";
import fs from "fs/promises";
import { join } from "path";
import { allPosts } from "../content.js";
import { Task } from "./index.js";

export function createDemoContent(directory: string): Task {
  return {
    name: "Create demo content",
    run: async () => {
      const contentDirectory = join(directory, "content", "posts");
      await fs.mkdir(contentDirectory, { recursive: true });

      let changed = false;
      for (const post of allPosts) {
        const filePath = join(contentDirectory, post.filename);
        if (!existsSync(filePath)) {
          changed = true;
          await fs.writeFile(filePath, post.content);
        }
      }

      if (changed) {
        return {
          status: "changed",
          message: "Created demo content",
        };
      }

      return {
        status: "skipped",
        message: "Demo content already exists",
      };
    },
  };
}
