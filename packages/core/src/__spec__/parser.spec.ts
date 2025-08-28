import { describe, expect, test } from "vitest";
import { z } from "zod";
import { defineCollection, defineConfig } from "../config";
import { defineParser } from "../parser";
import { workspaceTest } from "./workspace";

describe("parser", () => {
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
    "should parse with simple custom parser",
    async ({ workspaceBuilder }) => {
      const specialJsonParser = defineParser((fileContent) => {
        const content = fileContent.split("\n").slice(1).join("\n");
        return JSON.parse(content);
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

  test("should throw an error if parser does not exist", () => {
    expect(() =>
      defineCollection({
        name: "posts",
        directory: "sources/posts",
        include: "*.md",
        // @ts-expect-error non existing parser
        parser: "non-existing-parser",
        schema: z.object({
          title: z.string(),
          content: z.string(),
        }),
      }),
    ).toThrowError("Parser non-existing-parser is not valid a parser");
  });

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
});
