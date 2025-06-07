import { describe, expect, it } from "vitest";
import { z } from "zod";
import { defineCollection, defineConfig } from "./config";
import { createDefaultImport } from "./import";
import { defineParser } from "./parser";
import {
  defineSource,
  GetExtendedContext,
  GetMetaFromCollection,
} from "./source";
import { GetTypeByName } from "./types";
import { suppressDeprecatedWarnings } from "./warn";

describe("types", () => {
  describe("GetTypeByName", () => {
    it("should infer type from schema", () => {
      const collection = defineCollection({
        name: "person",
        typeName: "person",
        directory: "./persons",
        include: "*.md",
        schema: z.object({
          name: z.string(),
          age: z.number(),
        }),
      });

      const config = defineConfig({
        collections: [collection],
      });

      type Person = GetTypeByName<typeof config, "person">;

      const person: Person = {
        name: "John",
        age: 20,
        // @ts-expect-error city is not in the schema
        city: "New York",
        content: "John is 20 years old",
        _meta: {
          id: "persons/john.md",
          fileName: "john.md",
          filePath: "persons/john.md",
          directory: "persons",
          path: "persons/john",
          extension: "md",
        },
      };

      expect(person).toBeTruthy();
    });

    it("should infer type from transform function", () => {
      const collection = defineCollection({
        name: "person",
        typeName: "person",
        directory: "./persons",
        include: "*.md",
        schema: z.object({
          name: z.string(),
          age: z.number(),
        }),
        transform: (data) => {
          return {
            ...data,
            city: "New York",
          };
        },
      });

      const config = defineConfig({
        collections: [collection],
      });

      type Person = GetTypeByName<typeof config, "person">;
      const person: Person = {
        name: "John",
        city: "New York",
        // @ts-expect-error street is not in the schema
        street: "Main Street",
        content: "John is 20 years old",
        _meta: {
          id: "persons/john.md",
          fileName: "john.md",
          filePath: "persons/john.md",
          directory: "persons",
          path: "persons/john",
          extension: "md",
        },
      };

      expect(person).toBeTruthy();
    });
  });

  it("should infer type from other collection", () => {
    const countryCollection = defineCollection({
      name: "country",
      directory: "./countries",
      include: "*.md",
      schema: z.object({
        code: z.string().length(2),
        name: z.string(),
      }),
    });

    const personCollection = defineCollection({
      name: "person",
      directory: "./persons",
      include: "*.md",
      schema: z.object({
        name: z.string(),
        age: z.number(),
        countryCode: z.string().length(2),
      }),
      transform: (data, ctx) => {
        const countries = ctx.documents(countryCollection);
        const country = countries.find((c) => c.code === data.countryCode);
        if (!country) {
          throw new Error(`Country ${data.countryCode} not found`);
        }
        return {
          name: data.name,
          age: data.age,
          country: {
            code: country.code,
            name: country.name,
          },
        };
      },
    });

    const config = defineConfig({
      collections: [countryCollection, personCollection],
    });

    type Person = GetTypeByName<typeof config, "person">;

    const person: Person = {
      name: "Hans",
      age: 20,
      country: {
        code: "de",
        name: "Germany",
      },
    };

    expect(person).toBeTruthy();
  });

  it("should infer type with content from other collection", () => {
    const authors = defineCollection({
      name: "authors",
      directory: "content",
      include: "authors/*.md",
      schema: z.object({
        ref: z.string(),
        name: z.string(),
      }),
    });

    const articles = defineCollection({
      name: "articles",
      directory: "content",
      include: "articles/*.md",
      schema: z.object({
        title: z.string(),
        author: z.string(),
      }),
      transform: async (doc, context) => {
        const author = await context
          .documents(authors)
          .find((author) => author.ref === doc.author);
        if (!author) {
          throw new Error(`Author ${doc.author} not found`);
        }

        return {
          ...doc,
          author: {
            name: author.name,
            bio: author.content,
          },
        };
      },
    });

    const config = defineConfig({
      collections: [authors, articles],
    });

    type Article = Omit<GetTypeByName<typeof config, "articles">, "_meta">;

    const article: Article = {
      title: "My Article",
      author: {
        name: "John Doe",
        bio: "John is a software engineer.",
      },
      content: "This is the content of the article.",
    };

    expect(article).toBeTruthy();
  });

  it("should have content if parser is not defined", () => {
    const collection = defineCollection({
      name: "person",
      typeName: "person",
      directory: "./persons",
      include: "*.md",
      schema: z.object({
        name: z.string(),
      }),
    });

    const config = defineConfig({
      collections: [collection],
    });

    type Person = GetTypeByName<typeof config, "person">;

    const person: Person = {
      name: "John",
      content: "John is 20 years old",
      _meta: {
        id: "persons/john.md",
        fileName: "john.md",
        filePath: "persons/john.md",
        directory: "persons",
        path: "persons/john",
        extension: "md",
      },
    };

    expect(person).toBeTruthy();
  });

  it("should have content if parser is frontmatter", () => {
    const collection = defineCollection({
      name: "person",
      typeName: "person",
      directory: "./persons",
      include: "*.md",
      parser: "frontmatter",
      schema: z.object({
        name: z.string(),
      }),
    });

    const config = defineConfig({
      collections: [collection],
    });

    type Person = GetTypeByName<typeof config, "person">;

    const person: Person = {
      name: "John",
      content: "John is 20 years old",
      _meta: {
        id: "persons/john.md",
        fileName: "john.md",
        filePath: "persons/john.md",
        directory: "persons",
        path: "persons/john",
        extension: "md",
      },
    };

    expect(person).toBeTruthy();
  });

  it("should have no content if parser is yaml", () => {
    const collection = defineCollection({
      name: "person",
      typeName: "person",
      directory: "./persons",
      include: "*.md",
      parser: "yaml",
      schema: z.object({
        name: z.string(),
      }),
    });

    const config = defineConfig({
      collections: [collection],
    });

    type Person = GetTypeByName<typeof config, "person">;

    const person: Person = {
      name: "John",
      // @ts-expect-error content is defined with yaml parser
      content: "John is 20 years old",
      _meta: {
        id: "persons/john.md",
        fileName: "john.md",
        filePath: "persons/john.md",
        directory: "persons",
        path: "persons/john",
        extension: "md",
      },
    };

    expect(person).toBeTruthy();
  });

  it("should have no content if parser is json", () => {
    const collection = defineCollection({
      name: "person",
      typeName: "person",
      directory: "./persons",
      include: "*.md",
      parser: "json",
      schema: z.object({
        name: z.string(),
      }),
    });

    const config = defineConfig({
      collections: [collection],
    });

    type Person = GetTypeByName<typeof config, "person">;

    const person: Person = {
      name: "John",
      // @ts-expect-error content is defined with yaml parser
      content: "John is 20 years old",
      _meta: {
        id: "persons/john.md",
        fileName: "john.md",
        filePath: "persons/john.md",
        directory: "persons",
        path: "persons/john",
        extension: "md",
      },
    };

    expect(person).toBeTruthy();
  });

  it("should should not override content type", () => {
    const collection = defineCollection({
      name: "person",
      typeName: "person",
      directory: "./persons",
      include: "*.md",
      schema: z.object({
        name: z.string(),
        content: z.number(),
      }),
    });

    const config = defineConfig({
      collections: [collection],
    });

    type Person = GetTypeByName<typeof config, "person">;

    const person: Person = {
      name: "John",
      content: 42,
      _meta: {
        id: "persons/john.md",
        fileName: "john.md",
        filePath: "persons/john.md",
        directory: "persons",
        path: "persons/john",
        extension: "md",
      },
    };

    expect(person).toBeTruthy();
  });

  it("should return invalid type if returned schema is not serializable", () => {
    const collection = defineCollection({
      name: "person",
      directory: "./persons",
      include: "*.md",
      schema: z.object({
        // functions are not serializable
        fn: z.function(),
      }),
    });

    // @ts-expect-error content is not a valid json object
    expect(collection.name).toBeDefined();
  });

  it("should return invalid type if returned transform is not serializable", () => {
    const collection = defineCollection({
      name: "person",
      directory: "./persons",
      include: "*.md",
      schema: z.object({
        date: z.string(),
      }),
      transform: (data) => {
        return {
          // functions are not serial
          fn: () => {},
        };
      },
    });

    // @ts-expect-error content is not a valid json object
    expect(collection.name).toBeDefined();
  });

  it("should return the generic of the import", () => {
    type Content = {
      mdx: string;
    };

    const collection = defineCollection({
      name: "posts",
      directory: "./posts",
      include: "*.mdx",
      schema: z.object({
        title: z.string(),
      }),
      transform: ({ _meta, ...rest }) => {
        const content = createDefaultImport<Content>("./content");
        return {
          ...rest,
          content,
        };
      },
    });

    const config = defineConfig({
      collections: [collection],
    });

    type Post = GetTypeByName<typeof config, "posts">;

    const post: Post = {
      title: "Hello World",
      content: {
        mdx: "# MDX Content",
      },
    };

    expect(post).toBeTruthy();
  });

  it("should return the generic of a nested import", () => {
    type Content = {
      mdx: string;
    };

    const collection = defineCollection({
      name: "posts",
      directory: "./posts",
      include: "*.mdx",
      schema: z.object({
        title: z.string(),
      }),
      transform: ({ _meta, content: _, ...rest }) => {
        const content = createDefaultImport<Content>("./content");
        return {
          ...rest,
          props: {
            content,
          },
        };
      },
    });

    const config = defineConfig({
      collections: [collection],
    });

    type Post = GetTypeByName<typeof config, "posts">;

    const post: Post = {
      title: "Hello World",
      props: {
        content: {
          mdx: "# MDX Content",
        },
      },
    };

    expect(post).toBeTruthy();
  });

  it("should return a function from a resolve import", () => {
    type Content = () => string;

    const collection = defineCollection({
      name: "posts",
      directory: "./posts",
      include: "*.mdx",
      schema: z.object({
        title: z.string(),
      }),
      transform: ({ _meta, ...rest }) => {
        const content = createDefaultImport<Content>("./content");
        return {
          ...rest,
          content,
        };
      },
    });

    const config = defineConfig({
      collections: [collection],
    });

    type Post = GetTypeByName<typeof config, "posts">;

    const post: Post = {
      title: "Hello World",
      content: () => "# MDX Content",
    };

    expect(post).toBeTruthy();
  });

  it("should support custom parser", () => {
    const parser = defineParser({
      hasContent: true,
      parse: (content: string) => {
        return {
          title: content.substring(0, 10).toUpperCase(),
          content,
        };
      },
    });

    const collection = defineCollection({
      name: "posts",
      directory: "./posts",
      include: "*.mdx",
      schema: z.object({
        title: z.string(),
      }),
      parser,
    });

    const config = defineConfig({
      collections: [collection],
    });

    type Post = Omit<GetTypeByName<typeof config, "posts">, "_meta">;

    const post: Post = {
      title: "Hello World",
      content: "# MDX Content",
    };

    expect(post).toBeTruthy();
  });

  it("should support custom parser without content", () => {
    const parser = defineParser((content: string) => {
      return {
        title: content.substring(0, 10).toUpperCase(),
        content,
      };
    });

    const collection = defineCollection({
      name: "posts",
      directory: "./posts",
      include: "*.mdx",
      schema: z.object({
        title: z.string(),
      }),
      parser,
    });

    const config = defineConfig({
      collections: [collection],
    });

    type Post = Omit<GetTypeByName<typeof config, "posts">, "_meta">;

    const post: Post = {
      title: "Hello World",
      // @ts-expect-error content is not defined in the schema
      content: "# MDX Content",
    };

    expect(post).toBeTruthy();
  });

  it("should support legacy schema function", () => {
    suppressDeprecatedWarnings("legacySchema");

    const collection = defineCollection({
      name: "posts",
      directory: "./posts",
      include: "*.mdx",
      schema: (y) => ({
        title: y.string(),
      }),
    });

    const config = defineConfig({
      collections: [collection],
    });

    type Post = GetTypeByName<typeof config, "posts">;

    const post: Post = {
      title: "Hello World",
      content: "# MDX Content",
      _meta: {
        id: "posts/hello-world.mdx",
        fileName: "hello-world.mdx",
        filePath: "posts/hello-world.mdx",
        directory: "posts",
        path: "posts/hello-world",
        extension: "mdx",
      },
    };

    expect(post).toBeTruthy();
  });

  it("should infer meta from source", () => {
    const source = defineSource({
      documents: async () => [
        {
          _meta: {
            id: "1",
            url: "https://example.com",
          },
          data: {
            title: "Hello World",
            content: "This is a test document.",
          },
        }
      ],
    });

    const collection = defineCollection({
      name: "posts",
      source,
      schema: (y) => ({
        title: y.string(),
      })
    });

    const config = defineConfig({
      collections: [collection],
    });

    type Post = GetTypeByName<typeof config, "posts">;
    const post: Post = {
      title: "Hello World",
      content: "This is a test document.",
      // @ts-expect-error description is not defined in the schema
      description: "This is a test description.",
      _meta: {
        id: "1",
        url: "https://example.com",
      },
    };
    expect(post).toBeTruthy();

    type Meta = GetMetaFromCollection<typeof collection>;
    const meta: Meta = {
      id: "1",
      url: "https://example.com",
      // @ts-expect-error fileName is not defined in the source
      fileName: "example.md",
    };
    expect(meta).toBeTruthy();
  });

  it("should infer extended context from source", () => {
    const source = defineSource({
      documents: async () => [
        {
          _meta: {
            id: "1",
            url: "https://example.com",
          },
          data: {
            title: "Hello World",
            content: "This is a test document.",
          },
        }
      ],
      extendContext: (document) => {
        return {
          customData: `Custom data for ${document._meta.id}`,
        };
      },
    });

    const collection = defineCollection({
      name: "posts",
      source,
      schema: (y) => ({
        title: y.string(),
      }),
      transform: (data, context) => {
        return {
          ...data,
          custom: context.customData,
        };
      },
    });

    const config = defineConfig({
      collections: [collection],
    });

    type Post = GetTypeByName<typeof config, "posts">;
    const post: Post = {
      title: "Hello World",
      content: "This is a test document.",
      custom: "Custom data for 1",
      _meta: {
        id: "1",
        url: "https://example.com",
      },
    };
    expect(post).toBeTruthy();

    type ExtendedContext = GetExtendedContext<typeof source>;
    const extendedContext: ExtendedContext = {
      customData: "Custom data for 1",
    };
    expect(extendedContext.customData).toBe("Custom data for 1");
  });
});
