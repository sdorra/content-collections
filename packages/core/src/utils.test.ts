import { describe, it, expect } from "vitest";
import { generateTypeName, isDefined, removeChildPaths } from "./utils";

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

describe("removeChildPaths", () => {

  it("should remove a/b", () => {
    const paths = ["a", "a/b"];
    const filtered = removeChildPaths(paths);
    expect(filtered).toEqual(["a"]);
  });

  it("should remove a/b and a/b/c", () => {
    const paths = ["a", "a/b", "a/b/c"];
    const filtered = removeChildPaths(paths);
    expect(filtered).toEqual(["a"]);
  });

  it("should remove a/b and a/c", () => {
    const paths = ["a", "a/b", "a/c"];
    const filtered = removeChildPaths(paths);
    expect(filtered).toEqual(["a"]);
  });

  it("should keep b", () => {
    const paths = ["a", "b"];
    const filtered = removeChildPaths(paths);
    expect(filtered).toEqual(["a", "b"]);
  });

  it("should keep a and b", () => {
    const paths = ["a", "a/b", "b"];
    const filtered = removeChildPaths(paths);
    expect(filtered).toEqual(["a", "b"]);
  });

});