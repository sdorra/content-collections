import { describe, expect } from "vitest";
import { z } from "zod";
import { defineCollection, defineConfig } from "../config";
import { isRetiredFeatureError } from "../features";
import { workspaceTest } from "./workspace";

describe("schema", () => {
  workspaceTest(
    "should exclude documents with an validation error",
    async ({ workspaceBuilder }) => {
      const posts = defineCollection({
        name: "posts",
        directory: "sources/posts",
        include: "*.md",
        schema: z.object({
          title: z.string(),
          author: z.string(),
        }),
      });

      const config = defineConfig({
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

      workspace.file(
        "sources/posts/two.md",
        `
        ---
        tittle: Post Two
        author: trillian
        ---

        # Second post
    `,
      );

      const { collection } = await workspace.build();
      const allPosts = await collection("posts");

      expect(allPosts).toHaveLength(1);
      expect(allPosts.map((p) => p.title)).toEqual(["Post One"]);
    },
  );

  workspaceTest("should end with an error, if legacy schema is used", ({}) => {
    expect(() =>
      defineCollection({
        name: "movies",
        directory: "sources/movies",
        include: "*.json",
        parser: "json",
        // @ts-expect-error legacy schema
        schema: (z) => ({
          name: z.string(),
          year: z.number(),
        }),
      }),
    ).toThrowError(
      expect.toSatisfy(
        (err) => isRetiredFeatureError(err) && err.feature === "legacySchema",
        "is RetiredFeatureError",
      ),
    );
  });
});
