import { EventEmitter } from "node:events";
import path from "node:path";
import type { ResolvedConfig, ViteDevServer } from "vite";
import { beforeEach, describe, expect, it, vi } from "vitest";
import contentCollectionsPlugin from "./index.js";

const mocks = vi.hoisted(() => ({
  createBuilder: vi.fn(),
  on: vi.fn(),
  sync: vi.fn(),
  watchPaths: vi.fn(),
}));

vi.mock("@content-collections/core", () => ({
  createBuilder: mocks.createBuilder,
}));

vi.mock("@content-collections/integrations", () => ({
  configureLogging: vi.fn(),
}));

const root = path.resolve("/project/app");
const shared = path.resolve("/project/shared");
const moved = path.resolve("/project/moved");
const configPath = path.join(root, "content-collections.ts");

// The plugin only uses the root, the logger and the watcher of the server.
// A fake watcher records exactly what the plugin adds, on every platform.
async function startDevServer() {
  const watcher = Object.assign(new EventEmitter(), { add: vi.fn() });
  const config = { root, logger: { error: vi.fn() } };

  const plugin = contentCollectionsPlugin();
  await (plugin.configResolved as (config: ResolvedConfig) => unknown)(
    config as unknown as ResolvedConfig,
  );
  (plugin.configureServer as (server: ViteDevServer) => unknown)({
    config,
    watcher,
  } as unknown as ViteDevServer);

  return watcher;
}

describe("contentCollectionsPlugin", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.sync.mockResolvedValue(false);
    mocks.watchPaths.mockReturnValue([root, shared]);
    mocks.createBuilder.mockResolvedValue({
      on: mocks.on,
      sync: mocks.sync,
      watchPaths: mocks.watchPaths,
    });
  });

  it("syncs files reported by the Vite watcher", async () => {
    const watcher = await startDevServer();
    const filePath = path.join(root, "posts", "post.md");

    watcher.emit("add", filePath);
    watcher.emit("change", filePath);
    watcher.emit("unlink", filePath);

    expect(mocks.sync.mock.calls).toEqual([
      ["create", filePath],
      ["update", filePath],
      ["delete", filePath],
    ]);
  });

  // Vite already watches its root, and adding a watched path again makes it
  // report new files twice.
  it("watches collection paths outside the Vite root once, also after a change", async () => {
    const watcher = await startDevServer();

    expect(watcher.add.mock.calls).toEqual([[[shared]]]);

    mocks.watchPaths.mockReturnValue([root, shared, moved]);
    mocks.sync.mockResolvedValue(true);
    watcher.emit("change", configPath);
    watcher.emit("change", configPath);

    await vi.waitFor(() => {
      expect(mocks.watchPaths).toHaveBeenCalledTimes(3);
    });
    expect(watcher.add.mock.calls).toEqual([[[shared]], [[moved]]]);
  });
});
