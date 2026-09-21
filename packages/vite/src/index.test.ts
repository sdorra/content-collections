import { createServer } from "vite";
import { beforeEach, describe, expect, it, vi } from "vitest";
import contentCollectionsPlugin from "./index.js";

const mocks = vi.hoisted(() => ({
  build: vi.fn(),
  createBuilder: vi.fn(),
  on: vi.fn(),
  unsubscribe: vi.fn(),
  watch: vi.fn(),
}));

vi.mock("@content-collections/core", () => ({
  createBuilder: mocks.createBuilder,
}));

vi.mock("@content-collections/integrations", () => ({
  configureLogging: vi.fn(),
}));

describe("contentCollectionsPlugin", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.build.mockResolvedValue(undefined);
    mocks.unsubscribe.mockResolvedValue(undefined);
    mocks.watch.mockResolvedValue({ unsubscribe: mocks.unsubscribe });
    mocks.createBuilder.mockResolvedValue({
      build: mocks.build,
      on: mocks.on,
      watch: mocks.watch,
    });
  });

  it("stops watching when the Vite server closes", async () => {
    const server = await createServer({
      configFile: false,
      logLevel: "silent",
      plugins: [contentCollectionsPlugin()],
      server: {
        middlewareMode: true,
      },
    });

    try {
      expect(mocks.watch).toHaveBeenCalledOnce();
      expect(mocks.unsubscribe).not.toHaveBeenCalled();
    } finally {
      await server.close();
    }

    expect(mocks.unsubscribe).toHaveBeenCalledOnce();
  });
});
