import { describe, expect, test } from "vitest";
import { z } from "zod";
import { workspaceTest } from "./__tests__/workspace";
import { defineCollection, defineConfig } from "./config";
import { createBuilder } from "./builder";
import { defineParser } from "./parser";

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

  workspaceTest(
    "should create collection from configuration file",
    async ({ workspaceBuilder }) => {
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

      expect(allPosts.map((p) => p.title)).toEqual([
        "First post",
        "Second post",
      ]);
    },
  );

  workspaceTest(
    "should create collection from configuration object",
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

      expect(allPosts.map((p) => p.title)).toEqual([
        "First post",
        "Second post",
      ]);
    },
  );

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

  workspaceTest("should parse yaml documents", async ({ workspaceBuilder }) => {
    const movies = defineCollection({
      name: "movies",
      directory: "sources/movies",
      include: "*.yaml",
      parser: "yaml",
      schema: z.object({
        name: z.string(),
        year: z.number(),
      }),
    });

    const config = defineConfig({
      collections: [movies],
    });

    const workspace = workspaceBuilder(config);

    workspace.file(
      "sources/movies/fight-club.yaml",
      `name: Fight Club
         year: 1999
    `,
    );

    workspace.file(
      "sources/movies/inception.yaml",
      `name: Inception
         year: 2010
    `,
    );

    const { collection } = await workspace.build();
    const allMovies = await collection("movies");
    expect(allMovies).toHaveLength(2);
    expect(allMovies.map((m) => m.name)).toEqual(["Fight Club", "Inception"]);
  });

  workspaceTest("should parse json documents", async ({ workspaceBuilder }) => {
    const movies = defineCollection({
      name: "movies",
      directory: "sources/movies",
      include: "*.json",
      parser: "json",
      schema: z.object({
        name: z.string(),
        year: z.number(),
      }),
    });

    const config = defineConfig({
      collections: [movies],
    });

    const workspace = workspaceBuilder(config);

    workspace.file(
      "sources/movies/fight-club.json",
      `{
          "name": "Fight Club",
          "year": 1999
        }`,
    );

    workspace.file(
      "sources/movies/inception.json",
      `{
          "name": "Inception",
          "year": 2010
        }`,
    );

    const { collection } = await workspace.build();
    const allMovies = await collection("movies");
    expect(allMovies).toHaveLength(2);
    expect(allMovies.map((m) => m.name)).toEqual(["Fight Club", "Inception"]);
  });

  workspaceTest(
    "should parse frontmatter documents",
    async ({ workspaceBuilder }) => {
      const movies = defineCollection({
        name: "movies",
        directory: "sources/movies",
        include: "*.md",
        parser: "frontmatter",
        schema: z.object({
          name: z.string(),
          year: z.number(),
        }),
      });

      const config = defineConfig({
        collections: [movies],
      });

      const workspace = workspaceBuilder(config);

      workspace.file(
        "sources/movies/fight-club.md",
        `---
        name: Fight Club
        year: 1999
        ---
        Fight Club is a 1999 film directed by David Fincher.
        `,
      );

      workspace.file(
        "sources/movies/inception.md",
        `---
        name: Inception
        year: 2010
        ---
        Inception is a 2010 science fiction film directed by Christopher Nolan.
        `,
      );

      const { collection } = await workspace.build();
      const allMovies = await collection("movies");
      expect(allMovies).toHaveLength(2);
      expect(allMovies.map((m) => m.name)).toEqual(["Fight Club", "Inception"]);
      expect(allMovies.map((m) => m.content)).toEqual([
        "Fight Club is a 1999 film directed by David Fincher.",
        "Inception is a 2010 science fiction film directed by Christopher Nolan.",
      ]);
    },
  );

  workspaceTest(
    "should parse frontmatter documents but exclude the content",
    async ({ workspaceBuilder }) => {
      const movies = defineCollection({
        name: "movies",
        directory: "sources/movies",
        include: "*.md",
        parser: "frontmatter-only",
        schema: z.object({
          name: z.string(),
          year: z.number(),
        }),
      });

      const config = defineConfig({
        collections: [movies],
      });

      const workspace = workspaceBuilder(config);

      workspace.file(
        "sources/movies/fight-club.md",
        `---
        name: Fight Club
        year: 1999
        ---
        This is the content of the Fight Club movie.
        It should not be included in the document.
        `,
      );

      workspace.file(
        "sources/movies/inception.md",
        `---
        name: Inception
        year: 2010
        ---
        This is the content of the Inception movie.
        It should not be included in the document.
        `,
      );

      const { collection } = await workspace.build();
      const allMovies = await collection("movies");
      expect(allMovies).toHaveLength(2);
      expect(allMovies.map((m) => m.name)).toEqual(["Fight Club", "Inception"]);
      // @ts-expect-error
      expect(allMovies.map((m) => m.content)).toEqual([undefined, undefined]);
    },
  );

  workspaceTest(
    "should parse with custom parser",
    async ({ workspaceBuilder }) => {
      const specialJsonParser = defineParser({
        hasContent: false,
        parse: (fileContent) => {
          const content = fileContent.split("\n").slice(1).join("\n");
          return JSON.parse(content);
        },
      });

      const movies = defineCollection({
        name: "movies",
        directory: "sources/movies",
        include: "*.special.json",
        parser: specialJsonParser,
        schema: z.object({
          name: z.string(),
          year: z.number(),
        }),
      });

      const config = defineConfig({
        collections: [movies],
      });

      const workspace = workspaceBuilder(config);

      workspace.file(
        "sources/movies/fight-club.special.json",
        `// This is a special comment
        {
          "name": "Fight Club",
          "year": 1999
        }`,
      );

      workspace.file(
        "sources/movies/inception.special.json",
        `// This is a special comment
        {
          "name": "Inception",
          "year": 2010
        }`,
      );

      const { collection } = await workspace.build();
      const allMovies = await collection("movies");
      expect(allMovies).toHaveLength(2);
      expect(allMovies.map((m) => m.name)).toEqual(["Fight Club", "Inception"]);
    },
  );

  // TODO: it looks the parser is not checked before the build, it throws for every document
  workspaceTest.skip(
    "should throw an error if parser does not exist",
    async ({ workspaceBuilder }) => {
      const posts = defineCollection({
        name: "posts",
        directory: "sources/posts",
        include: "*.md",
        // @ts-expect-error non existing parser
        parser: "non-existing-parser",
        schema: z.object({
          title: z.string(),
          content: z.string(),
        }),
      });

      const config = defineConfig({
        collections: [posts],
      });

      const workspace = workspaceBuilder(config);
      await expect(() => workspace.build()).rejects.toThrowError(
        "Parser non-existing-parser does not exist",
      );
    },
  );

  workspaceTest(
    "should exclude non parsable documents",
    async ({ workspaceBuilder }) => {
      const movies = defineCollection({
        name: "movies",
        directory: "sources/movies",
        include: "*.json",
        parser: "json",
        schema: z.object({
          name: z.string(),
          year: z.number(),
        }),
      });

      const config = defineConfig({
        collections: [movies],
      });

      const workspace = workspaceBuilder(config);

      workspace.file(
        "sources/movies/fight-club.json",
        `// This is a non valid JSON file
          "name": "Fight Club",
          "year": 1999
        }`,
      );

      workspace.file(
        "sources/movies/inception.json",
        `{
          "name": "Inception",
          "year": 2010
        }`,
      );

      const { collection } = await workspace.build();
      const allMovies = await collection("movies");
      expect(allMovies).toHaveLength(1);
      expect(allMovies.map((m) => m.name)).toEqual(["Inception"]);
    },
  );

  workspaceTest(
    "should work with legacy schema function",
    async ({ workspaceBuilder }) => {
      const movies = defineCollection({
        name: "movies",
        directory: "sources/movies",
        include: "*.json",
        parser: "json",
        schema: (z) => ({
          name: z.string(),
          year: z.number(),
        }),
      });

      const config = defineConfig({
        collections: [movies],
      });

      const workspace = workspaceBuilder(config);

      workspace.file(
        "sources/movies/fight-club.json",
        `{
          "name": "Fight Club",
          "year": 1999
        }`,
      );

      workspace.file(
        "sources/movies/inception.json",
        `{
          "name": "Inception",
          "yearrr": 2010
        }`,
      );

      const { collection } = await workspace.build();
      const allMovies = await collection("movies");
      expect(allMovies).toHaveLength(1);
      expect(allMovies.map((m) => m.name)).toEqual(["Fight Club"]);
    },
  );
});
