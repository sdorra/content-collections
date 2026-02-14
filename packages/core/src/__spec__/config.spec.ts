import fs from "node:fs";
import { join } from "node:path";
import { describe, expect, test, vi } from "vitest";
import { z } from "zod";
import { createBuilder } from "../builder";
import { defineCollection, defineConfig, defineSingleton } from "../config";
import { workspaceTest } from "./workspace";

describe("config", () => {
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
          author: z.string(),
          content: z.string()
        })
      });

      export default defineConfig({
        content: [posts],
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
          content: z.string(),
        }),
      });

      const config = defineConfig({
        content: [posts],
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
          author: z.string(),
          content: z.string()
        })
      });

      export default defineConfig({
        content: [posts],
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
    "should read configuration with import",
    async ({ workspaceBuilder }) => {
      const workspace = workspaceBuilder /* ts */ `
      import { defineConfig } from "@content-collections/core";
      import { posts } from "./posts"

      export default defineConfig({
        content: [posts],
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
          content: z.string(),
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

      const { collection } = await workspace.build();
      const allPosts = await collection("posts");
      expect(allPosts.map((p) => p.title)).toEqual(["Number One"]);
    },
  );

  workspaceTest(
    "should respect tsconfigPath for configuration imports",
    async ({ workspaceBuilder }) => {
      const workspace = workspaceBuilder /* ts */ `
      import { defineConfig } from "@content-collections/core";
      import { posts } from "@posts"

      export default defineConfig({
        content: [posts],
      });
    `;

      workspace.file(
        "tsconfig.json",
        /* json */ `{
        "compilerOptions": {
          "baseUrl": ".",
          "paths": {
            "@posts": ["./posts"]
          }
        }
      }`,
      );

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
          content: z.string(),
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

      const { collection } = await workspace.build();
      const allPosts = await collection("posts");
      expect(allPosts.map((p) => p.title)).toEqual(["Number One"]);
    },
  );

  workspaceTest(
    "should call onSuccess after build",
    async ({ workspaceBuilder }) => {
      const titles: Array<string> = [];

      const posts = defineCollection({
        name: "posts",
        directory: "sources/posts",
        include: "*.yaml",
        parser: "yaml",
        schema: z.object({
          title: z.string(),
        }),
        onSuccess: (docs) => {
          titles.push(...docs.map((d) => d.title));
        },
      });

      const config = defineConfig({
        content: [posts],
      });

      const workspace = workspaceBuilder(config);

      workspace.file(
        "sources/posts/one.yaml",
        `
        title: First post
    `,
      );

      workspace.file(
        "sources/posts/two.yaml",
        `
        title: Second post
    `,
      );

      await workspace.build();

      expect(titles).toEqual(["First post", "Second post"]);
    },
  );

  workspaceTest(
    "should support singletons",
    async ({ workspaceBuilder, workspacePath }) => {
      const settings = defineSingleton({
        name: "settings",
        typeName: "Settings",
        filePath: "sources/settings.md",
        schema: z.object({
          title: z.string(),
        }),
      });

      const config = defineConfig({
        content: [settings],
      });

      const workspace = workspaceBuilder(config);

      workspace.file(
        `sources/settings.md`,
        `---
        title: Site settings
        ---`,
      );

      const { singleton } = await workspace.build();

      const loaded = await singleton("settings");
      expect(loaded?.title).toEqual("Site settings");

      const dts = fs.readFileSync(
        join(workspacePath, ".content-collections/generated/index.d.ts"),
        "utf-8",
      );
      expect(dts).toContain(
        "export declare const settings: Settings;",
      );
    },
  );

  workspaceTest(
    "should call onSuccess after build",
    async ({ workspaceBuilder }) => {
      const titles: Array<string | undefined> = [];

      const settings = defineSingleton({
        name: "settings",
        filePath: "sources/settings.yaml",
        parser: "yaml",
        schema: z.object({
          title: z.string(),
        }),
        onSuccess: (doc) => {
          titles.push(doc?.title);
        },
      });

      const config = defineConfig({
        content: [settings],
      });

      const workspace = workspaceBuilder(config);

      workspace.file(
        "sources/settings.yaml",
        `
        title: A
    `,
      );

      await workspace.build();

      expect(titles).toEqual(["A"]);
    },
  );

  workspaceTest(
    "should use specified output directory",
    async ({ workspaceBuilder, workspacePath }) => {
      const posts = defineCollection({
        name: "posts",
        directory: "sources/posts",
        include: "*.yaml",
        parser: "yaml",
        schema: z.object({
          title: z.string(),
        }),
      });

      const config = defineConfig({
        content: [posts],
      });

      const workspace = workspaceBuilder(config, {
        outputDir: "build",
      });

      workspace.file(
        "sources/posts/one.yaml",
        `
        title: First post
    `,
      );

      await workspace.build();

      expect(fs.existsSync(join(workspacePath, "build/allPosts.js"))).toBe(
        true,
      );
    },
  );

  workspaceTest(
    "should throw an error if singleton file is missing and not optional",
    async ({ workspaceBuilder }) => {
      const settings = defineSingleton({
        name: "settings",
        typeName: "Settings",
        filePath: "sources/settings.md",
        optional: false,
        schema: z.object({
          title: z.string(),
        }),
      });

      const config = defineConfig({
        content: [settings],
      });

      const workspace = workspaceBuilder(config);

      await expect(workspace.build).rejects.toThrowError(
        "Singleton file not found at path: sources/settings.md",
      );
    },
  );

  workspaceTest(
    "should support optional singleton collections (missing => undefined)",
    async ({ workspaceBuilder, emitter, workspacePath }) => {
      const warnings: Array<any> = [];
      emitter.on("transformer:singleton-warning", (event) =>
        warnings.push(event),
      );

      const settings = defineSingleton({
        name: "settings",
        typeName: "Settings",
        filePath: "sources/settings.yaml",
        parser: "yaml",
        optional: true,
        schema: z.object({
          title: z.string(),
        }),
      });

      const config = defineConfig({
        content: [settings],
      });

      const workspace = workspaceBuilder(config);

      const { singleton } = await workspace.build();

      const loaded = await singleton("settings");
      expect(loaded).toBeUndefined();

      expect(warnings).toHaveLength(1);

      const dts = fs.readFileSync(
        join(workspacePath, ".content-collections/generated/index.d.ts"),
        "utf-8",
      );
      expect(dts).toContain(
        "export declare const settings: Settings | undefined;",
      );
    },
  );

  workspaceTest(
    "should support deprecated collection property",
    async ({ workspaceBuilder }) => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      try {
        const workspace = workspaceBuilder /* ts */ `
        import { defineSingleton, defineConfig } from "@content-collections/core";
        import { z } from "zod";

        const settings = defineSingleton({
          name: "settings",
          filePath: "sources/settings.md",
          parser: "frontmatter-only",
          optional: true,
          schema: z.object({
            title: z.string(),
          }),
        });

        export default defineConfig({
          collections: [settings],
        });   
      `;

        await workspace.build();

        expect(warnSpy).toHaveBeenCalled(); // at least one call
        expect(warnSpy).toHaveBeenCalledWith(
          expect.stringContaining("config-collections-property"),
        );
      } finally {
        warnSpy.mockRestore();
      }
    },
  );
});
