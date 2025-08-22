import { describe, expect } from "vitest";
import { defineCollection, defineConfig } from "../config";
import { workspaceTest } from "./workspace";
import { z } from "zod";

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
