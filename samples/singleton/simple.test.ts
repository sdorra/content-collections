import { settings } from "content-collections";
import { describe, expect, it } from "vitest";

describe("simple", () => {
  it("should load singleton settings", () => {
    expect(settings).toBeDefined();
    expect(settings?.siteName).toBe("Singleton Sample");
    expect(settings?.theme).toBe("dark");
  });
});
