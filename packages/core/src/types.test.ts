import { describe, expect, it } from "vitest";
import { GetTypeByName } from "./types";
import { defineCollection, defineConfig } from "./config";

describe("types", () => {
  describe("GetTypeByName", () => {
    it("should infer type from schema", () => {
      const collection = defineCollection({
        name: "person",
        typeName: "person",
        directory: "./persons",
        include: "*.md",
        schema: (z) => ({
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
        schema: (z) => ({
          name: z.string(),
          age: z.number(),
        }),
        transform: (ctx, data) => {
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
      schema: (z) => ({
        code: z.string().length(2),
        name: z.string(),
      }),
    });

    const personCollection = defineCollection({
      name: "person",
      directory: "./persons",
      include: "*.md",
      schema: (z) => ({
        name: z.string(),
        age: z.number(),
        countryCode: z.string().length(2),
      }),
      transform: (ctx, data) => {
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
          }
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

  it("should have content if parser is not defined", () => {
    const collection = defineCollection({
      name: "person",
      typeName: "person",
      directory: "./persons",
      include: "*.md",
      schema: (z) => ({
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
      schema: (z) => ({
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
      schema: (z) => ({
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
      schema: (z) => ({
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
      schema: (z) => ({
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
