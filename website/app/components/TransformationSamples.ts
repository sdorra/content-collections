export type Sample = {
  name: string;
  description: string;
  code: string;
};

export const sampleSources: Array<Sample> = [
  {
    name: "Simple",
    description: "Simple transformation",
    code: /* ts */ `
import { defineCollection, defineConfig } from "@content-collections/core";
import { z } from "zod";

const posts = defineCollection({
  name: "posts",
  directory: "content",
  include: "*.md",
  schema: z.object({
    title: z.string(),
    date: z.string(),
  }),
  transform: (data) => {
    const slug = data._meta.path;
    return {
      ...data,
      slug
    };
  },
});

export default defineConfig({
  collections: [posts],
});
`,
  },
  {
    name: "Fetch",
    description: "Fetch data from the web",
    code: /* ts */ `
import { defineCollection, defineConfig } from "@content-collections/core";
import { z } from "zod";

const people = defineCollection({
  name: "people",
  directory: "content",
  include: "*.md",
  schema: z.object({
    name: z.string(),
    homeworld: z.string().url(),
  }),
  transform: async (data) => {
    const response = await fetch(data.homeworld);
    const planet = await response.json();
    return {
      ...data,
      planet: {
        name: planet.name,
        population: planet.population,
      }
    };
  },
});

export default defineConfig({
  collections: [people],
});
`,
  },
  {
    name: "Join Collections",
    description: "Join data from multiple collections",
    code: /* ts */ `
import { defineCollection, defineConfig } from "@content-collections/core";
import { z } from "zod";

const authors = defineCollection({
  name: "authors",
  directory: "content/authors",
  include: "*.md",
  schema: z.object({
    ref: z.string(),
    displayName: z.string(),
    email: z.string().email(),
  }),
});

const posts = defineCollection({
  name: "posts",
  directory: "content/posts",
  include: "*.md",
  schema: z.object({
    title: z.string(),
    author: z.string(),
  }),
  transform: async (document, context) => {
    const author = await context
      .documents(authors)
      .find((a) => a.ref === document.author);
    return {
      ...document,
      author
    };
  },
});

export default defineConfig({
  collections: [authors, posts],
});
`,
  },
  {
    name: "Markdown",
    description: "Tranform markdown content to html",
    code: /* ts */ `
import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMarkdown } from "@content-collections/markdown";
import { z } from "zod";

const posts = defineCollection({
  name: "posts",
  directory: "content",
  include: "*.md",
  schema: z.object({
    title: z.string()
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
    `,
  },
  {
    name: "MDX",
    description: "Show how to transform content with MDX",
    code: /* ts */ `
import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import { z } from "zod";

const posts = defineCollection({
  name: "posts",
  directory: "content",
  include: "*.mdx",
  schema: z.object({
    title: z.string(),
    date: z.string(),
  }),
  transform: async (document, context) => {
    const body = await compileMDX(context, document);
    return {
      ...data,
      body,
    };
  },
});

export default defineConfig({
  collections: [posts],
});
`,
  },
];
