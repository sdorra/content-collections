import { describe, it, expect } from "vitest";
import { generateTypeName, isDefined } from "./utils";

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

describe("isDefined", () => {

  it("should filter null values", () => {
    const values = [1, 2, null, 3, null];
    const defined = values.filter(isDefined);
    expect(defined).toEqual([1, 2, 3]);
  });

  it("should filter undefined values", () => {
    const values = [1, 2, undefined, 3, undefined];
    const defined = values.filter(isDefined);
    expect(defined).toEqual([1, 2, 3]);
  });

  it("should filter null and undefined values", () => {
    const values = [1, 2, undefined, 3, null];
    const defined = values.filter(isDefined);
    expect(defined).toEqual([1, 2, 3]);
  });

});