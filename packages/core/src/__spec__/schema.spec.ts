import { describe, expect, vi } from "vitest";
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

  workspaceTest(
    "should add implicit content property, but show deprecation warning",
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

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      try {
        const { collection } = await workspace.build();
        const allPosts = await collection("posts");

        expect(allPosts).toHaveLength(1);
        expect(allPosts.map((p) => p.content.trim())).toEqual(["# First post"]);

        // Assertions about the warning
        expect(warnSpy).toHaveBeenCalled(); // at least one call
        // check message contents (adjust substring / regex to match your deprecation text)
        expect(warnSpy).toHaveBeenCalledWith(
          expect.stringContaining("implicit-content-property"),
        );
      } finally {
        warnSpy.mockRestore();
      }
    },
  );

  workspaceTest(
    "should show only one deprecation warning for a collection with implicit content property",
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
        title: Post Two
        author: trillian
        ---

        # Second post
        `,
      );

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      try {
        const { collection } = await workspace.build();
        await collection("posts");

        // Assertions about the warning
        expect(warnSpy).toHaveBeenCalledOnce(); // at least one call
        // check message contents (adjust substring / regex to match your deprecation text)
        expect(warnSpy).toHaveBeenCalledWith(
          expect.stringContaining("implicit-content-property"),
        );
      } finally {
        warnSpy.mockRestore();
      }
    },
  );

  workspaceTest(
    "should validate with explicit content property",
    async ({ workspaceBuilder }) => {
      const posts = defineCollection({
        name: "posts",
        directory: "sources/posts",
        include: "*.md",
        schema: z.object({
          title: z.string(),
          author: z.string(),
          content: z.string().min(10),
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

        # Post
        `,
      );

      workspace.file(
        "sources/posts/two.md",
        `
        ---
        title: Post Two
        author: trillian
        ---

        # Second post with a longer title
    `,
      );

      const { collection } = await workspace.build();
      const allPosts = await collection("posts");

      expect(allPosts).toHaveLength(1);
      expect(allPosts.map((p) => p.content.trim())).toEqual([
        "# Second post with a longer title",
      ]);
    },
  );
  workspaceTest(
    "should end with an error, if legacy schema is used",
    async ({}) => {
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
    },
  );
});
