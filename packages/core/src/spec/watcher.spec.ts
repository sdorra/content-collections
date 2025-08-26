import { describe, expect, vi } from "vitest";
import { z } from "zod";
import { defineCollection, defineConfig } from "../config";
import { workspaceTest } from "./workspace";

describe("collection file changes", () => {
  workspaceTest(
    "should add new file to collection",
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
      }, 3000);

      expect(allMovies.map((m) => m.name)).toEqual([
        "Fight Club",
        "Inception",
        "Interstellar",
      ]);
    },
  );

  workspaceTest(
    "should update existing file in collection",
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
        "name": "Fight Clubbb",
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
      expect(allMovies.map((m) => m.name)).toEqual([
        "Fight Clubbb",
        "Inception",
      ]);

      await workspace.watch();

      await workspace.path("sources/movies/fight-club.json").write(
        `{
        "name": "Fight Club",
        "year": 1999
      }`,
      );

      allMovies = await vi.waitFor(async () => {
        const col = await collection("movies");
        expect(col.map((m) => m.name)).toEqual(["Fight Club", "Inception"]);
        return col;
      }, 5000);

      expect(allMovies.map((m) => m.name)).toEqual(["Fight Club", "Inception"]);
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
      }, 3000);

      expect(allMovies.map((m) => m.name)).toEqual(["Fight Club"]);
    },
  );
});

describe("configuration file changes", () => {
  workspaceTest(
    "should rebuilt on configuration change",
    async ({ workspaceBuilder }) => {
      const workspace = workspaceBuilder /* ts */ `
      import { defineCollection, defineConfig } from "@content-collections/core";
      import { z } from "zod";

      const posts = defineCollection({
        name: "posts",
        typeName: "Post",
        directory: "sources/one",
        include: "*.md",
        schema: z.object({
          title: z.string(),
        })
      });

      export default defineConfig({
        collections: [posts],
      });
    `;

      workspace.file(
        "sources/one/index.md",
        `
        ---
        title: Number One
        ---
    `,
      );

      workspace.file(
        "sources/two/index.md",
        `
        ---
        title: Number Two
        ---
    `,
      );

      const { collection } = await workspace.build();
      let allPosts = await collection("posts");
      expect(allPosts.map((p) => p.title)).toEqual(["Number One"]);

      const watcher = await workspace.watch();

      await workspace.path("content-collections.ts").write /* ts */ `
      import { defineCollection, defineConfig } from "@content-collections/core";
      import { z } from "zod";

      const posts = defineCollection({
        name: "posts",
        typeName: "Post",
        directory: "sources/two",
        include: "*.md",
        schema: z.object({
          title: z.string(),
        })
      });

      export default defineConfig({
        collections: [posts],
      });
    `;

      allPosts = await vi.waitFor(async () => {
        const col = await collection("posts");
        expect(col.map((p) => p.title)).toEqual(["Number Two"]);
        return col;
      }, 3000);

      expect(allPosts.map((p) => p.title)).toEqual(["Number Two"]);

      await watcher.unsubscribe();
    },
  );

  workspaceTest(
    "should rebuilt on configuration change",
    async ({ workspaceBuilder, emitter }) => {
      const workspace = workspaceBuilder /* ts */ `
      import { defineCollection, defineConfig } from "@content-collections/core";
      import { z } from "zod";

      const posts = defineCollection({
        name: "posts",
        typeName: "Post",
        directory: "sources/one",
        include: "*.md",
        schema: z.object({
          title: z.string(),
        })
      });

      export default defineConfig({
        collections: [posts],
      });
    `;

      workspace.file(
        "sources/one/index.md",
        `
        ---
        title: Number One
        ---
    `,
      );

      const { collection } = await workspace.build();
      let allPosts = await collection("posts");
      expect(allPosts.map((p) => p.title)).toEqual(["Number One"]);

      const watcher = await workspace.watch();

      const configErrorPromise = new Promise<Error>((resolve) => {
        emitter.on("watcher:config-reload-error", (event) => {
          resolve(event.error);
        });
      });

      await workspace
        .path("content-collections.ts")
        .write("theNewConfigurationIsBroken();");

      const error = await configErrorPromise;

      if (!error) {
        throw new Error("Expected configuration error");
      }
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("theNewConfigurationIsBroken");

      await watcher.unsubscribe();
    },
  );

  workspaceTest(
    "should rebuild on imported configuration file change",
    async ({ workspaceBuilder }) => {
      const workspace = workspaceBuilder /* ts */ `
      import { defineConfig } from "@content-collections/core";
      import { posts } from "./posts"

      export default defineConfig({
        collections: [posts],
      });
    `;

      workspace.file(
        "posts.ts",
        /* ts */ `
      import { defineCollection } from "@content-collections/core";
      import { z } from "zod";

      export const posts = defineCollection({
        name: "posts",
        typeName: "Post",
        directory: "sources/one",
        include: "*.md",
        schema: z.object({
          title: z.string(),
        })
      });
      `,
      );

      workspace.file(
        "sources/one/index.md",
        `
        ---
        title: Number One
        ---
    `,
      );

      workspace.file(
        "sources/two/index.md",
        `
        ---
        title: Number Two
        ---
    `,
      );

      const { collection } = await workspace.build();
      let allPosts = await collection("posts");
      expect(allPosts.map((p) => p.title)).toEqual(["Number One"]);

      const watcher = await workspace.watch();

      await workspace.path("posts.ts").write /* ts */ `
      import { defineCollection } from "@content-collections/core";
      import { z } from "zod";

      export const posts = defineCollection({
        name: "posts",
        typeName: "Post",
        directory: "sources/two",
        include: "*.md",
        schema: z.object({
          title: z.string(),
        })
      });
    `;

      allPosts = await vi.waitFor(async () => {
        const col = await collection("posts");
        expect(col.map((p) => p.title)).toEqual(["Number Two"]);
        return col;
      }, 3000);

      expect(allPosts.map((p) => p.title)).toEqual(["Number Two"]);

      await watcher.unsubscribe();
    },
  );

});
