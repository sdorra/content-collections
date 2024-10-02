import { join } from "path";
import { allPosts } from "../content.js";
import { Task } from "./index.js";
import fs from "fs/promises";

export function createDemoContent(directory: string): Task {
  return {
    name: "Create demo content",
    run: async () => {
      const contentDirectory = join(directory, "content", "posts");

      await fs.mkdir(contentDirectory, { recursive: true });

      for (const post of allPosts) {
        const filePath = join(contentDirectory, post.filename);
        await fs.writeFile(filePath, post.content);
      }

      return true;
    },
  };
}
