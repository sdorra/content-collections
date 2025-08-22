import path from "node:path";
import { describe, expect } from "vitest";
import { z } from "zod";
import { defineCollection, defineConfig } from "../config";
import { createDefaultImport, createNamedImport } from "../import";
import { workspaceTest } from "./workspace";

describe("workspace tests", () => {
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
    "should cache with the same parameters",
    async ({ workspaceBuilder }) => {
      let counter = 0;

      const posts = defineCollection({
        name: "posts",
        directory: "sources/posts",
        include: "*.md",
        schema: z.object({
          title: z.string(),
          author: z.string(),
        }),
        transform: async (doc, { cache }) => {
          const val = await cache(doc.title, (title) => {
            counter++;
            return title.toUpperCase();
          });

          return {
            ...doc,
            title: val,
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

      // build the workspace twice to test the cache
      await workspace.build();

      const { collection } = await workspace.build();
      const allPosts = await collection("posts");

      expect(allPosts).toHaveLength(2);
      expect(allPosts.map((p) => p.title)).toEqual(["POST ONE", "POST TWO"]);

      // counter should be 2, because the transform function is called for each document
      // if the cache was not used, it would be 4
      expect(counter).toBe(2);
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
          const docs = await collection.documents();
          const idx = docs.indexOf(doc);
          return {
            ...doc,
            idx,
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

      expect(allPosts).toHaveLength(2);
      expect(allPosts.map((p) => p.idx)).toEqual([0, 1]);
    },
  );

  workspaceTest(
    "should be able to access documents from other collections during transform",
    async ({ workspaceBuilder }) => {
      const authors = defineCollection({
        name: "authors",
        directory: "sources/authors",
        include: "*.yaml",
        parser: "yaml",
        schema: z.object({
          name: z.string(),
          displayName: z.string(),
        }),
      });

      const posts = defineCollection({
        name: "posts",
        directory: "sources/posts",
        include: "*.md",
        schema: z.object({
          title: z.string(),
          author: z.string(),
        }),
        transform: async (doc, { documents }) => {
          const author = await documents(authors).find(
            (a) => a.name === doc.author,
          );
          if (!author) {
            throw new Error(`Author ${doc.author} not found`);
          }

          return {
            ...doc,
            author: author.displayName,
          };
        },
      });

      const config = defineConfig({
        collections: [authors, posts],
      });

      const workspace = workspaceBuilder(config);

      workspace.file(
        "sources/authors/trillian.yaml",
        `name: trillian
         displayName: Trillian McMillan
    `,
      );

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
      expect(allPosts).toHaveLength(1);
      expect(allPosts.map((p) => p.author)).toEqual(["Trillian McMillan"]);
    },
  );

  workspaceTest(
    "should create named import",
    async ({ workspaceBuilder, workspacePath }) => {
      const characters = defineCollection({
        name: "characters",
        directory: "characters",
        include: "*.yaml",
        parser: "yaml",
        schema: z.object({
          name: z.string(),
          displayName: z.string(),
        }),
        transform: async (doc) => {
          return {
            ...doc,
            greet: createNamedImport<(name: string) => string>(
              "greet",
              path.join(workspacePath, "src/greet.ts"),
            ),
          };
        },
      });

      const config = defineConfig({
        collections: [characters],
      });

      const workspace = workspaceBuilder(config);

      workspace.file(
        "characters/trillian.yaml",
        `name: trillian
       displayName: Trillian McMillan
      `,
      );

      workspace.file(
        "src/greet.ts",
        `export function greet(name: string) {
         return \`Hello, \${name}!\`;
       }
      `,
      );

      const { collection } = await workspace.build();
      const allCharacters = await collection("characters");
      expect(allCharacters).toHaveLength(1);

      const trillian = allCharacters[0];
      if (!trillian) {
        throw new Error("Trillian character not found");
      }

      expect(trillian.greet("Alice")).toBe("Hello, Alice!");
    },
  );

  workspaceTest(
    "should create default import",
    async ({ workspaceBuilder, workspacePath }) => {
      const characters = defineCollection({
        name: "characters",
        directory: "characters",
        include: "*.yaml",
        parser: "yaml",
        schema: z.object({
          name: z.string(),
          displayName: z.string(),
        }),
        transform: async (doc) => {
          return {
            ...doc,
            greet: createDefaultImport<(name: string) => string>(
              path.join(workspacePath, "src/greet.ts"),
            ),
          };
        },
      });

      const config = defineConfig({
        collections: [characters],
      });

      const workspace = workspaceBuilder(config);

      workspace.file(
        "characters/trillian.yaml",
        `name: trillian
       displayName: Trillian McMillan
      `,
      );

      workspace.file(
        "src/greet.ts",
        `export default function greet(name: string) {
         return \`Hello, \${name}!\`;
       }
      `,
      );

      const { collection } = await workspace.build();
      const allCharacters = await collection("characters");
      expect(allCharacters).toHaveLength(1);

      const trillian = allCharacters[0];
      if (!trillian) {
        throw new Error("Trillian character not found");
      }

      expect(trillian.greet("Bob")).toBe("Hello, Bob!");
    },
  );



});
