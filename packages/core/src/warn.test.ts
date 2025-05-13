import { afterAll, describe, expect, it, vitest } from "vitest";
import { configureDeprecatedWarnings, warnDeprecated } from "./warn";

describe("warnDeprecated", () => {
  it("should log deprecated warning", () => {
    const logger = vitest.fn();
    warnDeprecated("Test message", logger);
    expect(logger).toHaveBeenCalledWith("[CC DEPRECATED]: Test message");
  });

  it("should not log deprecated warning when logging is disabled", () => {
    configureDeprecatedWarnings(false);
    const logger = vitest.fn();
    warnDeprecated("Test message", logger);
    expect(logger).not.toHaveBeenCalled();
  });

  afterAll(() => {
    configureDeprecatedWarnings(true);
  });
});
