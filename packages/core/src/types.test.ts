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
        schema: (z) =>
          z.object({
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
        _meta: {
          path: "persons/john.md",
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
        schema: (z) =>
          z.object({
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
        _meta: {
          path: "persons/john.md",
        },
      };

      expect(person).toBeTruthy();
    });
  });
});
