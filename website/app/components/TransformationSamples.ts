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

const posts = defineCollection({
  name: "posts",
  directory: "content",
  include: "*.md",
  schema: (z) => ({
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

const people = defineCollection({
  name: "people",
  directory: "content",
  include: "*.md",
  schema: (z) => ({
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

const authors = defineCollection({
  name: "authors",
  directory: "content/authors",
  include: "*.md",
  schema: (z) => ({
    ref: z.string(),
    displayName: z.string(),
    email: z.string().email(),
  }),
});

const posts = defineCollection({
  name: "posts",
  directory: "content/posts",
  include: "*.md",
  schema: (z) => ({
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
    name: "MDX",
    description: "Show how to transform content with MDX",
    code: /* ts */ `
import { defineCollection, defineConfig } from "@content-collections/core";
import { compile } from "@mdx-js/mdx";

const posts = defineCollection({
  name: "posts",
  directory: "content",
  include: "*.md",
  schema: (z) => ({
    title: z.string(),
    date: z.string(),
  }),
  transform: async ({ content, ...data }) => {
    const body = String(
      await compile(content, {
        outputFormat: "function-body",
      })
    );
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
