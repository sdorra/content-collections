import { describe, expect, it } from "vitest";
import { z } from "zod";
import { type Option, resolveOptions, zodToOptions } from "./options.js";

describe("zodToOptions", () => {
  function expectSingleOption(options: Array<Option>) {
    expect(options.length).toBe(1);

    const [option] = options;
    if (!option) {
      throw new Error("Option is not defined");
    }

    return option;
  }

  it("should fail with empty key", () => {
    const schema = z.object({
      // @ts-expect-error empty key
      name: undefined,
    });

    try {
      zodToOptions(schema);
      expect("to throw").toBe("but didn't");
    } catch (error: any) {
      expect(error.message).toBe("No value for key name");
    }
  });

  it("should convert a simple schema", () => {
    const schema = z.object({
      name: z.string(),
    });

    const options = zodToOptions(schema);

    const option = expectSingleOption(options);
    expect(option.name).toBe("name");
    expect(option.description).toBe(undefined);
    expect(option.defaultValue).toBe(undefined);
  });

  it("should convert with default value", () => {
    const schema = z.object({
      name: z.string().default("cc"),
    });

    const options = zodToOptions(schema);

    const option = expectSingleOption(options);
    expect(option.name).toBe("name");
    expect(option.defaultValue).toBe("cc");
    expect(option.description).toBe(undefined);
  });

  it("should convert with description", () => {
    const schema = z.object({
      name: z.string().describe("name of project"),
    });

    const options = zodToOptions(schema);

    const option = expectSingleOption(options);
    expect(option.name).toBe("name");
    expect(option.defaultValue).toBe(undefined);
    expect(option.description).toBe("name of project");
  });

  it("should convert with defaultValue followed by description", () => {
    const schema = z.object({
      name: z.string().default("cc").describe("name of project"),
    });

    const options = zodToOptions(schema);

    const option = expectSingleOption(options);
    expect(option.name).toBe("name");
    expect(option.defaultValue).toBe("cc");
    expect(option.description).toBe("name of project");
  });

  it("should convert a Zod schema with an enum", () => {
    const schema = z.object({
      demoContent: z
        .enum(["none", "markdown", "mdx"])
        .default("markdown")
        .describe("Type of demo content"),
    });

    const options = zodToOptions(schema);

    const option = expectSingleOption(options);
    expect(option.name).toBe("demoContent");
    expect(option.description).toBe("Type of demo content");
    expect(option.defaultValue).toBe("markdown");

    if (option.type !== "list") {
      throw new Error("Option type is not list");
    }
    expect(option.choices).toEqual(["none", "markdown", "mdx"]);
  });
});

describe("resolveOptions", () => {
  it("should resolve options", async () => {
    const schema = z.object({
      name: z.string(),
    });

    const ask = async (option: Option) => {
      if (option.name === "name") {
        return "test";
      }
      return "unknown";
    };

    const options = await resolveOptions(schema, ask);
    expect(options).toEqual({ name: "test" });
  });
});
