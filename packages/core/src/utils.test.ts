import { describe, it, expect } from "vitest";
import { generateTypeName } from "./utils";

describe("generateTypeName", () => {

  it("should return same as collection name", () => {
    const typeName = generateTypeName("Post");
    expect(typeName).toBe("Post");
  });

  it("should return typeName with first letter upper case", () => {
    const typeName = generateTypeName("post");
    expect(typeName).toBe("Post");
  });

  it("should remove spaces", () => {
    const typeName = generateTypeName("post title");
    expect(typeName).toBe("PostTitle");
  });

  it("should return the singular form", () => {
    const typeName = generateTypeName("posts");
    expect(typeName).toBe("Post");
  });

});