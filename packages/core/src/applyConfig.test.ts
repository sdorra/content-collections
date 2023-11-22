import path from "path";
import { describe, it, expect } from "vitest";
import { applyConfig } from "./applyConfig";
import { existsSync } from "fs";

function config(name: string) {
  const configPath = path.join(__dirname, "__tests__", name + ".ts");
  return applyConfig(configPath, { configName: name + ".js" });
}

describe("applyConfig", () => {
  it("should apply the config", async () => {
    const cfg = await config("config.001");

    expect(cfg.collections).toHaveLength(1);
  });

  it("should have a typeName", async () => {
    const cfg = await config("config.001");

    expect(cfg.collections).toHaveLength(1);
    expect(cfg.collections[0]?.typeName).toBe("Post");
  });

  it("should have a source pattern", async () => {
    const cfg = await config("config.001");

    expect(cfg.collections).toHaveLength(1);
    expect(cfg.collections[0]?.sources).toBe("posts/**/*.md(x)?");
  });

  it("should generate a typeName", async () => {
    const cfg = await config("config.002");

    expect(cfg.collections).toHaveLength(1);
    expect(cfg.collections[0]?.typeName).toBe("Post");
  });

  it("should apply the config with an imported collection", async () => {
    const cfg = await config("config.003");

    expect(cfg.collections).toHaveLength(1);
    expect(cfg.collections[0]?.name).toBe("posts");
  });

  it("should have a valid zod schema", async () => {
    const cfg = await config("config.002");
    const schema = cfg.collections[0]?.schema;
    if (!schema) {
      throw new Error("collection does not have a schema");
    }

    let result = schema.safeParse({
      title: "Hello",
    });
    expect(result.success).toBe(true);

    result = schema.safeParse({
      greeting: "Hello",
    });
    expect(result.success).toBe(false);
  });

  it("should use different cache directory and name", async () => {
    const basedir = path.join(__dirname, "__tests__");
    const cacheDir = path.join(
      basedir,
      ".mdx-collections",
      "different-cache-dir"
    );
    const configPath = path.join(basedir, "config.001.ts");
    const configName = "different.config.js";
    const cfg = await applyConfig(configPath, {
      configName,
      cacheDir,
    });

    const compiledConfig = path.join(cacheDir, configName);
    expect(cfg.collections).toHaveLength(1);
    expect(existsSync(compiledConfig)).toBe(true);
  });
});
