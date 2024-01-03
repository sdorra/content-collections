import { describe, expect, it } from "vitest";
import { GetTypeByName } from "./types";
import { defineCollection, defineConfig } from "./config";
import { z } from "zod";

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
        // TODO: why we get no error, if _meta is missing?
        // if the type is inferred from the transform function, we get an error
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
        schema: z.object({
          name: z.string(),
          age: z.number(),
        }),
        transform: (ctx, data) => {
          return {
            ...data,
            city: "New York",
          };
        }
      });

      const config = defineConfig({
        collections: [collection],
      });

      type Person = GetTypeByName<typeof config, "person">;
      const person: Person = {
        name: "John",
        age: 20,
        city: "New York",
        _meta: {
          path: "persons/john.md",
        },
      };

      expect(person).toBeTruthy();
    });
  });
});
