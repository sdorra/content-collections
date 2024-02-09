import { describe, it, expect } from "vitest";
import { parsers } from "./parser";

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
