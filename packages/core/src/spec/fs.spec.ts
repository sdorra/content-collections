import { describe, expect } from "vitest";
import { z } from "zod";
import { defineCollection, defineConfig } from "../config";
import { workspaceTest } from "./workspace";

describe("fs", () => {
  workspaceTest(
    "should include files from multiple directories",
    async ({ workspaceBuilder }) => {
      const posts = defineCollection({
        name: "posts",
        directory: "posts",
        include: ["published/*.md", "drafts/*.md"],
        schema: z.object({
          title: z.string(),
        }),
      });

      const config = defineConfig({
        collections: [posts],
      });

      const workspace = workspaceBuilder(config);

      workspace.file(
        "posts/published/one.md",
        `
        ---
        title: First post
        ---

        # First post
    `,
      );

      workspace.file(
        "posts/drafts/two.md",
        `
        ---
        title: Second post
        ---

        # Second post
    `,
      );

      const { collection } = await workspace.build();
      const allPosts = await collection("posts");

      expect(allPosts.map((p) => p.title).sort()).toEqual([
        "First post",
        "Second post",
      ]);
    },
  );

  workspaceTest(
    "should exclude files matching pattern",
    async ({ workspaceBuilder }) => {
      const posts = defineCollection({
        name: "posts",
        directory: "posts",
        include: "*.yaml",
        exclude: "**/two.yaml",
        parser: "yaml",
        schema: z.object({
          title: z.string(),
        }),
      });

      const config = defineConfig({
        collections: [posts],
      });

      const workspace = workspaceBuilder(config);

      workspace.file("posts/one.yaml", `title: First post`);

      workspace.file("posts/two.yaml", `title: Second post`);

      const { collection } = await workspace.build();
      const allPosts = await collection("posts");

      expect(allPosts.map((p) => p.title).sort()).toEqual(["First post"]);
    },
  );

  workspaceTest(
    "should exclude files matching one of the exclude patterns",
    async ({ workspaceBuilder }) => {
      const posts = defineCollection({
        name: "posts",
        directory: "posts",
        include: "*.yaml",
        exclude: ["**/one.yaml", "**/two.yaml"],
        parser: "yaml",
        schema: z.object({
          title: z.string(),
        }),
      });

      const config = defineConfig({
        collections: [posts],
      });

      const workspace = workspaceBuilder(config);

      workspace.file("posts/one.yaml", `title: First post`);

      workspace.file("posts/two.yaml", `title: Second post`);

      const { collection } = await workspace.build();
      const allPosts = await collection("posts");
      expect(allPosts).toHaveLength(0);
    },
  );
});
