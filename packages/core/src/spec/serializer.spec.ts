import { describe, expect } from "vitest";
import { z } from "zod";
import { defineCollection, defineConfig } from "../config";
import { workspaceTest } from "./workspace";

describe("serializer", () => {
  workspaceTest(
    "should remove documents with non serializable data",
    async ({ workspaceBuilder }) => {
      const posts = defineCollection({
        name: "posts",
        directory: "sources/posts",
        include: "*.md",
        schema: z.object({
          title: z.string(),
          author: z.string(),
        }),
        transform: (doc) => {
          return {
            ...doc,
            fn: () => "I am a function",
          };
        },
      });

      const config = defineConfig({
        // @ts-expect-error non serializable data
        collections: [posts],
      });

      const workspace = workspaceBuilder(config);

      workspace.file(
        "sources/posts/one.md",
        `
        ---
        title: Post One
        author: trillian
        ---

        # First post
    `,
      );

      const { collection } = await workspace.build();
      const allPosts = await collection("posts");
      expect(allPosts).toHaveLength(0);
    },
  );
});
