import { allMovies } from "content-collections";
import { describe, expect, it } from "vitest";

describe("simple", () => {
  it("should collect 10 movies", () => {
    expect(allMovies).toHaveLength(10);
  });

  it("should collect and parse", () => {
    const titles = allMovies.map((movie) => movie.title);
    expect(titles).toContain("The Shawshank Redemption");
    expect(titles).toContain("The Godfather");
  });
});
