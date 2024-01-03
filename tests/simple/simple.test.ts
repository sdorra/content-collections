import { describe, it, expect } from "vitest";
import { allPosts } from "content-collections";

describe("simple", () => {
  it("should collect two posts", () => {
    expect(allPosts).toHaveLength(2);
  });

  it("should collect Post One", () => {
    const post = allPosts[0];
    if (!post) {
      throw new Error("Post not found");
    }
    expect(post).toEqual({
      title: "Post One",
      description: "This is the first post",
      date: "2019-01-01T00:00:00.000Z",
      author: {
        displayName: "Tricia Marie McMillan",
        email: "trillian@hitchhiker.com",
      },
      upper: "POST ONE",
      lower: "post one",
      content: "# One",
      _meta: {
        path: "one.mdx",
      },
    });
  });

  it("should collect Post Two", () => {
    const post = allPosts[1];
    if (!post) {
      throw new Error("Post not found");
    }
    expect(post).toEqual({
      title: "Post Two",
      description: "This is the second post",
      date: "2020-01-01T00:00:00.000Z",
      author: {
        displayName: "Tricia Marie McMillan",
        email: "trillian@hitchhiker.com",
      },
      upper: "POST TWO",
      lower: "post two",
      content: "## Two",
      _meta: {
        path: "two.md",
      },
    });
  });
});
