import { allCharacters } from "content-collections";
import { describe, expect, it } from "vitest";

describe("simple", () => {
  it("should collect 10 characters", () => {
    expect(allCharacters).toHaveLength(10);
  });

  it("should collect and parse", () => {
    const names = allCharacters.map((character) => character.name);
    expect(names).toContain("Alien Crow");
    expect(names).toContain("Morty Smith");
  });
});
