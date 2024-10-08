import { existsSync } from "fs";
import fs from "fs/promises";
import { join } from "path";
import { Task } from "./index.js";

const sampleConfig = `import { defineCollection, defineConfig } from "@content-collections/core";
// import { compileMarkdown } from "@content-collections/markdown";

// for more information on configuration, visit:
// https://www.content-collections.dev/docs/configuration

// const posts = defineCollection({
//   name: "posts",
//   directory: "content",
//   include: "*.md",
//   schema: (z) => ({
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
  collections: [/* posts */],
});
`;

const demoContentConfig = `import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMarkdown } from "@content-collections/markdown";

// for more information on configuration, visit:
// https://www.content-collections.dev/docs/configuration

const posts = defineCollection({
  name: "posts",
  directory: "content/posts",
  include: "*.md",
  schema: (z) => ({
    title: z.string(),
    summary: z.string(),
    date: z.coerce().date(),
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
  collections: [posts],
});
`;

export function createConfiguration(
  directory: string,
  demoContent: boolean,
): Task {
  return {
    name: "Create configuration file",
    run: async () => {
      const filePath = join(directory, "content-collections.ts");
      if (existsSync(filePath)) {
        return {
          status: "skipped",
          message: "Configuration file already exists",
        }
      }

      await fs.writeFile(
        filePath,
        demoContent ? demoContentConfig : sampleConfig,
      );

      return {
        status: "changed",
        message: "Configuration file created",
      };
    },
  };
}
