import { describe, expect } from "vitest";
import { z } from "zod";
import { defineCollection, defineConfig } from "../config";
import { createDefaultImport } from "../import";
import { workspaceTest } from "./workspace";

describe("serializer", () => {
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
          content: z.string(),
        }),
        transform: (doc) => {
          return {
            ...doc,
            fn: () => "I am a function",
          };
        },
      });

      // @ts-expect-error non serializable data
      const config = defineConfig({
        content: [posts],
      });

      const workspace = workspaceBuilder(config as any);

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
    "should serialize imports in arrays like direct imports",
    async ({ workspaceBuilder, workspacePath }) => {
      const albums = defineCollection({
        name: "albums",
        directory: "sources/albums",
        include: "*.md",
        schema: z.object({
          title: z.string(),
          cover: z.string(),
          contents: z.array(z.string()),
          content: z.string(),
        }),
        transform: (doc) => {
          return {
            ...doc,
            cover: createDefaultImport<string>(
              `${workspacePath}/images/${doc.cover}.ts`,
            ),
            contents: doc.contents.map((image) =>
              createDefaultImport<string>(
                `${workspacePath}/images/${image}.ts`,
              ),
            ),
          };
        },
      });

      const config = defineConfig({
        content: [albums],
      });

      const workspace = workspaceBuilder(config);

      workspace.file(
        "sources/albums/demo.md",
        `
        ---
        title: Demo Album
        cover: cover
        contents:
          - image-01
          - image-02
        ---

        # Demo
    `,
      );

      workspace.file("images/cover.ts", `export default "cover-image";`);
      workspace.file("images/image-01.ts", `export default "first-image";`);
      workspace.file("images/image-02.ts", `export default "second-image";`);

      const { collection } = await workspace.build();
      const allAlbums = await collection("albums");
      expect(allAlbums).toHaveLength(1);

      const album = allAlbums[0];
      if (!album) {
        throw new Error("Demo album not found");
      }

      expect(album.cover).toBe("cover-image");
      expect(album.contents).toEqual(["first-image", "second-image"]);
    },
  );
});
