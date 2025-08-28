import { beforeEach, describe, expect, it, vitest } from "vitest";
import {
  clearSuppressedWarnings,
  suppressDeprecatedWarnings,
  warnDeprecated,
} from "./warn";

describe("warnDeprecated", () => {
  beforeEach(() => {
    clearSuppressedWarnings();
  });

  it("should log deprecated warning", () => {
    const logger = vitest.fn();
    warnDeprecated("legacySchema", logger);
    expect(logger).toHaveBeenCalled();
    //@ts-expect-error
    const message = logger.mock.calls[0][0];
    expect(message).toMatch(/\[CC DEPRECATED\]./);
    expect(message).toMatch(/StandardSchema/);
  });

  it("should not log when deprecation is disabled", () => {
    suppressDeprecatedWarnings("legacySchema");
    const logger = vitest.fn();
    warnDeprecated("legacySchema", logger);
    expect(logger).not.toHaveBeenCalled();
  });

  it("should not log when all deprecations are disabled", () => {
    suppressDeprecatedWarnings("all");
    const logger = vitest.fn();
    warnDeprecated("legacySchema", logger);
    expect(logger).not.toHaveBeenCalled();
  });

  it("should log after clearing suppressed warnings", () => {
    suppressDeprecatedWarnings("legacySchema");
    clearSuppressedWarnings();
    const logger = vitest.fn();
    warnDeprecated("legacySchema", logger);
    expect(logger).toHaveBeenCalled();
  });
});
