import { describe, expect } from "vitest";
import { z } from "zod";
import { workspaceTest } from "./__tests__/workspace";
import { defineCollection, defineConfig } from "./config";
import { defineFileSystemSource } from "./source";

describe("workspace tests", () => {

  workspaceTest("simple", async ({ workspaceBuilder }) => {
    const workspace = workspaceBuilder/* ts */ `
      import { defineCollection, defineConfig } from "@content-collections/core";
      import { z } from "zod";

      const posts = defineCollection({
        name: "posts",
        typeName: "Post",
        schema: z.object({
          title: z.string(),
          author: z.string()
        }),
        source: {
          directory: "sources/posts",
          include: "**/*.md(x)?",
        }
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

  workspaceTest("second test", async ({ workspaceBuilder }) => {
    const posts = defineCollection({
      name: "posts",
      source: {
        directory: "sources/posts",
        include: "*.md",
        // TODO: should not be required, should default to frontmatter
        parser: "yaml",
      },
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

  workspaceTest("third test", async ({ workspaceBuilder }) => {
    const source = defineFileSystemSource({
      directory: "sources/posts",
      include: "*.md",
      parser: "yaml",
    });

    const posts = defineCollection({
      name: "posts",
      source,
      schema: z.object({
        title: z.string(),
      }),
    });

    const config = defineConfig({
      collections: [posts],
    });

    const workspace = workspaceBuilder(config);
    const { collection } = await workspace.build();
    const allPosts = await collection("posts");
  });

});
