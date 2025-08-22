import { describe, expect, vi } from "vitest";
import { z } from "zod";
import { defineCollection, defineConfig } from "../config";
import { workspaceTest } from "./workspace";

describe("watcher", () => {
  workspaceTest(
    "should add new files to workspace",
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

      let { collection } = await workspace.build();

      let allMovies = await collection("movies");
      expect(allMovies).toHaveLength(2);
      expect(allMovies.map((m) => m.name)).toEqual(["Fight Club", "Inception"]);

      await workspace.watch();

      await workspace.path("sources/movies/interstellar.json").write(
        `{
        "name": "Interstellar",
        "year": 2014
      }`,
      );

      allMovies = await vi.waitFor(async () => {
        const col = await collection("movies");
        expect(col).toHaveLength(3);
        return col;
      });

      expect(allMovies.map((m) => m.name)).toEqual([
        "Fight Club",
        "Inception",
        "Interstellar",
      ]);
    },
  );

  workspaceTest(
    "should remove file from collection",
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

      let { collection } = await workspace.build();

      let allMovies = await collection("movies");
      expect(allMovies).toHaveLength(2);
      expect(allMovies.map((m) => m.name)).toEqual(["Fight Club", "Inception"]);

      await workspace.watch();

      await workspace.path("sources/movies/inception.json").unlink();

      allMovies = await vi.waitFor(async () => {
        const col = await collection("movies");
        expect(col).toHaveLength(1);
        return col;
      });

      expect(allMovies.map((m) => m.name)).toEqual(["Fight Club"]);
    },
  );
});
