import { describe, expect, test } from "vitest";
import { z } from "zod";
import { workspaceTest } from "./__tests__/workspace";
import { defineCollection, defineConfig } from "./config";
import { createBuilder } from "./builder";

describe("workspace tests", () => {
  test("should fail with non existing configuration file", async () => {
    await expect(() =>
      createBuilder("crazy-non-existing-configuration.ts"),
    ).rejects.toThrowError(
      "configuration file crazy-non-existing-configuration.ts does not exist",
    );
  });

  workspaceTest(
    "should fail with syntax error in configuration",
    async ({ workspaceBuilder }) => {
      const workspace = workspaceBuilder("this is not a valid configuration");
      await expect(() => workspace.build()).rejects.toThrowError(
        /^configuration file .* is invalid/,
      );
    },
  );

  workspaceTest("should create collection from configuration file", async ({ workspaceBuilder }) => {
    const workspace = workspaceBuilder /* ts */ `
      import { defineCollection, defineConfig } from "@content-collections/core";
      import { z } from "zod";

      const posts = defineCollection({
        name: "posts",
        typeName: "Post",
        directory: "sources/posts",
        include: "**/*.md(x)?",
        schema: z.object({
          title: z.string(),
          author: z.string()
        })
      });

      export default defineConfig({
        collections: [posts],
      });
    `;

    workspace.file(
      "sources/posts/one.md",
      `
        ---
        title: First post
        author: trillian
        ---

        # First post
    `,
    );

    workspace.file(
      "sources/posts/two.md",
      `
        ---
        title: Second post
        author: trillian
        ---

        # Second post
    `,
    );

    const { collection } = await workspace.build();

    const allPosts = await collection("posts");

    expect(allPosts.map((p) => p.title)).toEqual(["First post", "Second post"]);
  });

  workspaceTest("should create collection from configuration object", async ({ workspaceBuilder }) => {
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
        title: First post
        author: trillian
        ---

        # First post
    `,
    );

    workspace.file(
      "sources/posts/two.md",
      `
        ---
        title: Second post
        author: trillian
        ---

        # Second post
    `,
    );

    const { collection } = await workspace.build();
    const allPosts = await collection("posts");

    expect(allPosts.map((p) => p.title)).toEqual(["First post", "Second post"]);
  });

  workspaceTest("should transform documents", async ({ workspaceBuilder }) => {
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
          title: doc.title.toUpperCase(),
        };
      },
    });

    const config = defineConfig({
      collections: [posts],
    });

    const workspace = workspaceBuilder(config);

    workspace.file(
      "sources/posts/one.md",
      `
        ---
        title: First post
        author: trillian
        ---

        # First post
    `,
    );

    workspace.file(
      "sources/posts/two.md",
      `
        ---
        title: Second post
        author: trillian
        ---

        # Second post
    `,
    );

    const { collection } = await workspace.build();
    const allPosts = await collection("posts");

    expect(allPosts.map((p) => p.title)).toEqual(["FIRST POST", "SECOND POST"]);
  });

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
    "should exclude documents with an transformation error",
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
          if (doc.title.toLowerCase().includes("one")) {
            throw new Error("I don't like titles with one in it");
          }
          return doc;
        },
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

      const { collection } = await workspace.build();
      const allPosts = await collection("posts");

      expect(allPosts).toHaveLength(1);
      expect(allPosts.map((p) => p.title)).toEqual(["Post Two"]);
    },
  );


  workspaceTest(
    "should be able to access documents from same collection during transform",
    async ({ workspaceBuilder }) => {
      const posts = defineCollection({
        name: "posts",
        directory: "sources/posts",
        include: "*.md",
        schema: z.object({
          title: z.string(),
          author: z.string(),
        }),
        transform: async (doc, { collection }) => {
          const docs = await collection.documents()
          const idx = docs.indexOf(doc);
          return {
            ...doc,
            idx
          };
        },
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

      const { collection } = await workspace.build();
      const allPosts = await collection("posts");

      expect(allPosts).toHaveLength(1);
      expect(allPosts.map((p) => p.title)).toEqual(["Post Two"]);
    },
  );


});
