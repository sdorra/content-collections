import { existsSync } from "fs";
import fs from "fs/promises";
import { join } from "path";
import { Task } from "./index.js";

const sampleConfig = `import { defineCollection, defineConfig } from "@content-collections/core";
// import { compileMarkdown } from "@content-collections/markdown";
import { z } from "zod";

// for more information on configuration, visit:
// https://www.content-collections.dev/docs/configuration

// const posts = defineCollection({
//   name: "posts",
//   directory: "content",
//   include: "*.md",
//   schema: z.object({
//     title: z.string(),
//     author: z.string(),
//     date: z.string(),
//   }),
//   transform: async (document, context) => {
//     const html = await compileMarkdown(context, document);
//     return {
//       ...document,
//       html,
//     };
//   },
// });

export default defineConfig({
  content: [/* posts */],
});
`;

const sampleMarkdownConfig = `import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMarkdown } from "@content-collections/markdown";
import { z } from "zod";

// for more information on configuration, visit:
// https://www.content-collections.dev/docs/configuration

const posts = defineCollection({
  name: "posts",
  directory: "content/posts",
  include: "*.md",
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    author: z.string(),
  }),
  transform: async (document, context) => {
    const html = await compileMarkdown(context, document);
    return {
      ...document,
      html,
    };
  },
});

export default defineConfig({
  content: [posts],
});
`;

const sampleMdxConfig = `import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import { z } from "zod";

// for more information on configuration, visit:
// https://www.content-collections.dev/docs/configuration

const posts = defineCollection({
  name: "posts",
  directory: "content/posts",
  include: "*.mdx",
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    author: z.string(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document);
    return {
      ...document,
      mdx,
    };
  },
});

export default defineConfig({
  content: [posts],
});
`;

export function createConfiguration(
  directory: string,
  demoContent: "none" | "markdown" | "mdx",
): Task {
  return {
    name: "Create configuration file",
    run: async () => {
      const filePath = join(directory, "content-collections.ts");
      if (existsSync(filePath)) {
        return {
          status: "skipped",
          message: "Configuration file already exists",
        };
      }

      switch (demoContent) {
        case "markdown":
          await fs.writeFile(filePath, sampleMarkdownConfig);
          break;
        case "mdx":
          await fs.writeFile(filePath, sampleMdxConfig);
          break;
        default:
          await fs.writeFile(filePath, sampleConfig);
      }

      return {
        status: "changed",
        message: "Configuration file created",
      };
    },
  };
}
