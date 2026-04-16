import fs from "node:fs";
import { join } from "node:path";
import { describe, expect } from "vitest";
import { z } from "zod";
import { defineCollection, defineConfig } from "../config";
import { workspaceTest } from "./workspace";

describe("writer", () => {
  workspaceTest(
    "should prepend imports to generated files via writer hooks",
    async ({ workspaceBuilder, workspacePath }) => {
      const posts = defineCollection({
        name: "posts",
        directory: "sources/posts",
        include: "*.md",
        schema: z.object({
          title: z.string(),
          content: z.string(),
        }),
      });

      const config = defineConfig({
        content: [posts],
        hooks: {
          writer: [
            ({ content, fileType }) => ({
              content:
                fileType === "data" || fileType === "javascript"
                  ? `import "server-only";\n${content}`
                  : content,
            }),
          ],
        },
      });

      const workspace = workspaceBuilder(config);

      workspace.file(
        "sources/posts/one.md",
        `
        ---
        title: First post
        ---

        # First post
    `,
      );

      await workspace.build();

      const dataFile = fs.readFileSync(
        join(workspacePath, ".content-collections/generated/allPosts.js"),
        "utf-8",
      );
      expect(dataFile).toContain('import "server-only";');
      expect(dataFile).toContain('"title": "First post"');

      const indexFile = fs.readFileSync(
        join(workspacePath, ".content-collections/generated/index.js"),
        "utf-8",
      );
      expect(indexFile).toContain('import "server-only";');
      expect(indexFile).toContain('import allPosts from "./allPosts.js";');
    },
  );

  workspaceTest(
    "should pass the generated file path to writer hooks",
    async ({ workspaceBuilder, workspacePath }) => {
      const touchedFiles: Array<string> = [];

      const posts = defineCollection({
        name: "posts",
        directory: "sources/posts",
        include: "*.md",
        schema: z.object({
          title: z.string(),
          content: z.string(),
        }),
      });

      const config = defineConfig({
        content: [posts],
        hooks: {
          writer: [
            ({ content, filePath, fileType }) => {
              if (fileType === "data") {
                touchedFiles.push(filePath);
              }
              return { content };
            },
          ],
        },
      });

      const workspace = workspaceBuilder(config);

      workspace.file(
        "sources/posts/one.md",
        `
        ---
        title: First post
        ---

        # First post
    `,
      );

      await workspace.build();

      expect(touchedFiles).toEqual([
        join(workspacePath, ".content-collections/generated/allPosts.js"),
      ]);
    },
  );
});
