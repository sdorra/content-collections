import { existsSync } from "fs";
import fs from "fs/promises";
import { join } from "path";
import { allPosts } from "../content.js";
import { Task } from "./index.js";

type ContentType = Exclude<DemoContent, false>;

function createExtension(contentType: ContentType) {
  switch (contentType) {
    case "markdown":
      return ".md";
    case "mdx":
      return ".mdx";
    default:
      throw new Error(`Invalid content type: ${contentType}`);
  }
}

export function createDemoContent(
  directory: string,
  contentType: ContentType,
): Task {
  return {
    name: "Create demo content",
    run: async () => {
      const contentDirectory = join(directory, "content", "posts");
      await fs.mkdir(contentDirectory, { recursive: true });

      let changed = false;
      for (const post of allPosts) {
        const filePath = join(
          contentDirectory,
          post.filename + createExtension(contentType),
        );
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
