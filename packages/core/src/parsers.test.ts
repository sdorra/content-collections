import { describe, expect, it } from "vitest";
import { defineParser, getParser, parsers } from "./parser";

const mdContent = `---
name: John
---

John is 20 years old
`;

const jsonContent = `{
  "name": "John"
}`;

const yamlContent = `name: John`;

describe("parsers", () => {
  it("should parse frontmatter", () => {
    const parser = parsers["frontmatter"];
    expect(parser.hasContent).toBe(true);

    const data = parser.parse(mdContent);
    expect(data).toEqual({
      name: "John",
      content: "John is 20 years old",
    });
  });

  it("should parse frontmatter without content", () => {
    const parser = parsers["frontmatter-only"];
    expect(parser.hasContent).toBe(false);

    const data = parser.parse(mdContent);
    expect(data).toEqual({
      name: "John"
    });
  });

  it("should parse json", () => {
    const parser = parsers["json"];
    expect(parser.hasContent).toBe(false);

    const data = parser.parse(jsonContent);
    expect(data).toEqual({
      name: "John",
    });
  });

  it("should parse yaml", () => {
    const parser = parsers["yaml"];
    expect(parser.hasContent).toBe(false);

    const data = parser.parse(yamlContent);
    expect(data).toEqual({
      name: "John",
    });
  });
});

describe("defineParser", () => {

  it("should define a parser", () => {
    const parser = defineParser({
      hasContent: true,
      parse: (content: string) => {
        return {
          content
        };
      },
    });

    expect(parser).toEqual({
      hasContent: true,
      parse: expect.any(Function),
    });
  });

  it("should define a parser with only a function", () => {
    const parser = defineParser((content: string) => {
      return {
        content
      };
    });

    expect(parser).toEqual({
      hasContent: false,
      parse: expect.any(Function),
    });
  });

});

describe("getParser", () => {
  it("should get a parser by name", () => {
    const parser = parsers["frontmatter"];
    expect(parser).toEqual({
      hasContent: true,
      parse: expect.any(Function),
    });
  });

  it("should throw an error if the parser does not exist", () => {
    expect(() => {
      // @ts-expect-error parser does not exist
      getParser("non-existing-parser");
    }).toThrowError(
      "Parser non-existing-parser does not exist",
    );
  });

  it("should return the parser if it is already a parser", () => {
    const configuredParser = {
      hasContent: false,
      parse: (content: string) => {
        return {
          content
        };
      },
    };
    const parser = getParser(configuredParser);
    expect(parser).toEqual({
      hasContent: false,
      parse: expect.any(Function),
    });
  });
});
