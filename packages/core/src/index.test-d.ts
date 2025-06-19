import { describe, expectTypeOf, it } from "vitest";
import { z } from "zod";
import { defineCollection } from "./config";
import { defineParser } from "./parser";
import {
  defineFileSystemSource,
  defineSource,
  FileSystemMeta,
  MetaBase,
} from "./source";
import { GetDocument } from "./types";

describe("Infer collection type tests", () => {
  it("should infer type from schema", () => {
    const collection = defineCollection({
      name: "people",
      source: {
        directory: "sources/people",
        include: "**/*.md(x)?",
        parser: "frontmatter",
      },
      schema: z.object({
        name: z.string(),
        age: z.number(),
        hobbies: z.array(z.string()),
      }),
    });

    type People = GetDocument<typeof collection>;
    expectTypeOf<People>().branded.toEqualTypeOf<{
      name: string;
      age: number;
      hobbies: string[];
      content: string;
      _meta: FileSystemMeta;
    }>();
  });

  it("should infer type from transform function", () => {
    const collection = defineCollection({
      name: "people",
      source: {
        directory: "sources/people",
        include: "**/*.md(x)?",
        parser: "yaml",
      },
      schema: z.object({
        name: z.string(),
        age: z.string(),
      }),
      transform: ({ name, age }) => ({
        name,
        age: parseInt(age, 10),
      }),
    });

    type People = GetDocument<typeof collection>;
    expectTypeOf<People>().branded.toEqualTypeOf<{
      name: string;
      age: number;
    }>();
  });

  it("should infer meta from source", () => {
    const source = defineSource(() => ({
      documents: () =>
        Promise.resolve([
          {
            data: { name: "John Doe", age: 30, hobbies: ["reading", "gaming"] },
            _meta: {
              id: "1",
              type: "file",
              createdAt: 1750190278,
              updatedAt: 1750190278,
            },
          },
        ]),
    }));

    const collection = defineCollection({
      name: "people",
      source,
      schema: z.object({
        name: z.string(),
        age: z.number(),
        hobbies: z.array(z.string()),
      }),
    });

    type Meta = GetDocument<typeof collection>["_meta"];
    expectTypeOf<Meta>().branded.toEqualTypeOf<{
      id: string;
      type: string;
      createdAt: number;
      updatedAt: number;
    }>();
  });
});

describe("Infer types from joined collections", () => {
  it("should infer type from author collections", () => {
    const authors = defineCollection({
      name: "authors",
      source: {
        directory: "sources/authors",
        include: "**/*.yaml(x)?",
        parser: "yaml",
      },
      schema: z.object({
        name: z.string(),
        bio: z.string(),
      }),
    });

    const posts = defineCollection({
      name: "posts",
      source: {
        directory: "sources/posts",
        include: "**/*.md(x)?",
        parser: "frontmatter",
      },
      schema: z.object({
        title: z.string(),
        author: z.string(),
      }),
      transform: async (doc, ctx) => {
        const author = await ctx
          .documents(authors)
          .find((a) => a.name === doc.author);
        if (!author) {
          throw new Error(`Author not found: ${doc.author}`);
        }
        return {
          ...doc,
          author,
        };
      },
    });

    type Post = GetDocument<typeof posts>;
    expectTypeOf<Post>().branded.toEqualTypeOf<{
      title: string;
      content: string;
      author: {
        name: string;
        bio: string;
        _meta: FileSystemMeta;
      };
      _meta: FileSystemMeta;
    }>();
  });

  it("Infer types with content from joined collections", () => {
    const authors = defineCollection({
      name: "authors",
      source: {
        directory: "sources/authors",
        include: "**/*.md(x)?",
        parser: "frontmatter",
      },
      schema: z.object({
        name: z.string(),
      }),
    });

    const posts = defineCollection({
      name: "posts",
      source: {
        directory: "sources/posts",
        include: "**/*.md(x)?",
        parser: "frontmatter",
      },
      schema: z.object({
        title: z.string(),
        author: z.string(),
      }),
      transform: async (doc, ctx) => {
        const author = await ctx
          .documents(authors)
          .find((a) => a.name === doc.author);
        if (!author) {
          throw new Error(`Author not found: ${doc.author}`);
        }
        return {
          ...doc,
          author,
        };
      },
    });

    type Post = GetDocument<typeof posts>;
    expectTypeOf<Post>().branded.toEqualTypeOf<{
      title: string;
      content: string;
      author: {
        name: string;
        content: string;
        _meta: FileSystemMeta;
      };
      _meta: FileSystemMeta;
    }>();
  });
});

describe("Add content tests", () => {
  it("should add content to posts for frontmatter parser", () => {
    const collection = defineCollection({
      name: "posts",
      source: {
        directory: "sources/posts",
        include: "**/*.md(x)?",
        parser: "frontmatter",
      },
      schema: z.object({
        title: z.string(),
      }),
    });

    type Post = GetDocument<typeof collection>;
    expectTypeOf<Post>().toHaveProperty("content");
  });

  it("should add content to posts if parser is undefined", () => {
    const collection = defineCollection({
      name: "posts",
      source: {
        directory: "sources/posts",
        include: "**/*.md(x)?",
      },
      schema: z.object({
        title: z.string(),
      }),
    });

    type Post = GetDocument<typeof collection>;
    expectTypeOf<Post>().toHaveProperty("content");
  });

  it("should not add content to posts for yaml parser", () => {
    const collection = defineCollection({
      name: "posts",
      source: {
        directory: "sources/posts",
        include: "**/*.md(x)?",
        parser: "yaml",
      },
      schema: z.object({
        title: z.string(),
      }),
    });

    type Post = GetDocument<typeof collection>;
    expectTypeOf<Post>().not.toHaveProperty("content");
  });

  it("should not add content to posts for json parser", () => {
    const collection = defineCollection({
      name: "posts",
      source: {
        directory: "sources/posts",
        include: "**/*.md(x)?",
        parser: "json",
      },
      schema: z.object({
        title: z.string(),
      }),
    });

    type Post = GetDocument<typeof collection>;
    expectTypeOf<Post>().not.toHaveProperty("content");
  });

  it("should not add content to posts for frontmatter-only parser", () => {
    const collection = defineCollection({
      name: "posts",
      source: {
        directory: "sources/posts",
        include: "**/*.md(x)?",
        parser: "frontmatter-only",
      },
      schema: z.object({
        title: z.string(),
      }),
    });

    type Post = GetDocument<typeof collection>;
    expectTypeOf<Post>().not.toHaveProperty("content");
  });

  it("should not add content to posts for custom parser", () => {
    const parser = defineParser({
      hasContent: false,
      parse: (fileContent: string) => {
        const { data } = JSON.parse(fileContent);
        return data;
      },
    });

    const collection = defineCollection({
      name: "posts",
      source: {
        directory: "sources/posts",
        include: "**/*.md(x)?",
        parser,
      },
      schema: z.object({
        title: z.string(),
      }),
    });

    type Post = GetDocument<typeof collection>;
    expectTypeOf<Post>().not.toHaveProperty("content");
  });

  it("should add content to posts for custom parser", () => {
    const parser = defineParser({
      hasContent: true,
      parse: (fileContent: string) => {
        const { data } = JSON.parse(fileContent);
        return data;
      },
    });

    const collection = defineCollection({
      name: "posts",
      source: {
        directory: "sources/posts",
        include: "**/*.md(x)?",
        parser,
      },
      schema: z.object({
        title: z.string(),
      }),
    });

    type Post = GetDocument<typeof collection>;
    expectTypeOf<Post>().toHaveProperty("content");
  });

  it("should add content to posts for filesystem source", () => {
    const source = defineFileSystemSource({
      directory: "sources/posts",
      include: "**/*.md(x)?",
      parser: "frontmatter",
    });

    const collection = defineCollection({
      name: "posts",
      source,
      schema: z.object({
        title: z.string(),
      }),
    });

    type Post = GetDocument<typeof collection>;
    expectTypeOf<Post>().toHaveProperty("content");
  });

  it("should not add content to posts for filesystem source", () => {
    const source = defineFileSystemSource({
      directory: "sources/posts",
      include: "**/*.md(x)?",
      parser: "json",
    });

    const collection = defineCollection({
      name: "posts",
      source,
      schema: z.object({
        title: z.string(),
      }),
    });

    type Post = GetDocument<typeof collection>;
    expectTypeOf<Post>().not.toHaveProperty("content");
  });

  it("should add content to posts for custom source", () => {
    const source = defineSource<MetaBase, {}, true>(() => ({
      documents: () => Promise.resolve([]),
    }));

    const collection = defineCollection({
      name: "posts",
      source,
      schema: z.object({
        title: z.string(),
      }),
    });

    type Post = GetDocument<typeof collection>;
    expectTypeOf<Post>().toHaveProperty("content");
  });

  it("should not add content to posts for custom source", () => {
    const source = defineSource<MetaBase, {}, false>(() => ({
      documents: () => Promise.resolve([]),
    }));

    const collection = defineCollection({
      name: "posts",
      source,
      schema: z.object({
        title: z.string(),
      }),
    });

    type Post = GetDocument<typeof collection>;
    expectTypeOf<Post>().not.toHaveProperty("content");
  });

  it("should add content from inferred custom source", () => {
    const source = defineSource(() => ({
      documents: () => Promise.resolve([]),
      documentsHaveContent: true,
    }));

    const collection = defineCollection({
      name: "posts",
      source,
      schema: z.object({
        title: z.string(),
      }),
    });

    type Post = GetDocument<typeof collection>;
    expectTypeOf<Post>().toHaveProperty("content");
  });

  it("should add content to posts for legacy frontmatter parser", () => {
    const collection = defineCollection({
      name: "posts",
      directory: "sources/posts",
      include: "**/*.md(x)?",
      parser: "frontmatter",
      schema: z.object({
        title: z.string(),
      }),
    });

    type Post = GetDocument<typeof collection>;
    expectTypeOf<Post>().toHaveProperty("content");
  });

  it("should add content to posts for legacy props without parser", () => {
    const collection = defineCollection({
      name: "posts",
      directory: "sources/posts",
      include: "**/*.md(x)?",
      schema: z.object({
        title: z.string(),
      }),
    });

    type Post = GetDocument<typeof collection>;
    expectTypeOf<Post>().toHaveProperty("content");
  });

  it("should not add content to posts for legacy yaml parser", () => {
    const collection = defineCollection({
      name: "posts",
      directory: "sources/posts",
      include: "**/*.md(x)?",
      parser: "yaml",
      schema: z.object({
        title: z.string(),
      }),
    });

    type Post = GetDocument<typeof collection>;
    expectTypeOf<Post>().not.toHaveProperty("content");
  });

  it("should get correct types for meta using legacy props", () => {
    const collection = defineCollection({
      name: "posts",
      directory: "sources/posts",
      include: "**/*.md(x)?",
      parser: "yaml",
      schema: z.object({
        title: z.string(),
      }),
    });

    type Post = GetDocument<typeof collection>;
    expectTypeOf<Post>().branded.toEqualTypeOf<{
      title: string;
      _meta: FileSystemMeta;
    }>();
  });
});

describe("Extend context tests", () => {
  it("should extend context with custom function", () => {
    const source = defineSource(() => ({
      documents: () => Promise.resolve([]),
      extendContext: (document) => ({
        computeSid: () => `sid-${document._meta.id}`,
      }),
    }));

    const collection = defineCollection({
      name: "posts",
      source,
      schema: z.object({
        title: z.string(),
      }),
      transform: (doc, ctx) => {
        return {
          ...doc,
          sid: ctx.computeSid(),
        };
      },
    });

    type Post = GetDocument<typeof collection>;
    expectTypeOf<Post>().toHaveProperty("sid");
  });
});
