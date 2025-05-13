import { existsSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { createConfigurationReader } from "./configurationReader";

function config(name: string) {
  const configPath = path.join(__dirname, "__tests__", name);
  const readConfig = createConfigurationReader();
  return readConfig(configPath, { configName: name + ".js" });
}

describe("configurationReader", () => {
  it("should read the config", async () => {
    const cfg = await config("config.001.ts");

    expect(cfg.collections).toHaveLength(1);
  });

  it("should have a typeName", async () => {
    const cfg = await config("config.001.ts");

    expect(cfg.collections).toHaveLength(1);
    expect(cfg.collections[0]?.typeName).toBe("Post");
  });

  it("should have a directory", async () => {
    const cfg = await config("config.001.ts");

    expect(cfg.collections).toHaveLength(1);
    expect(cfg.collections[0]?.directory).toBe("sources/posts");
  });

  it("should have a include pattern", async () => {
    const cfg = await config("config.001.ts");

    expect(cfg.collections).toHaveLength(1);
    expect(cfg.collections[0]?.include).toBe("**/*.md(x)?");
  });

  it("should generate a typeName", async () => {
    const cfg = await config("config.002.ts");

    expect(cfg.collections).toHaveLength(1);
    expect(cfg.collections[0]?.typeName).toBe("Post");
  });

  it("should read the config with an imported collection", async () => {
    const cfg = await config("config.003.ts");

    expect(cfg.collections).toHaveLength(1);
    expect(cfg.collections[0]?.name).toBe("posts");
  });

  it("should have a valid standard schema", async () => {
    const cfg = await config("config.002.ts");
    const schema = cfg.collections[0]?.schema;
    if (!schema) {
      throw new Error("collection does not have a schema");
    }

    let result = await schema["~standard"].validate({
      title: "Hello",
    });
    expect(result.issues).toBeUndefined();

    result = await schema["~standard"].validate({
      greeting: "Hello",
    });
    expect(result.issues).toHaveLength(1);
  });

  it("should use different cache directory and name", async () => {
    const basedir = path.join(__dirname, "__tests__");
    const cacheDir = path.join(
      basedir,
      ".content-collections",
      "different-cache-dir",
    );
    const configPath = path.join(basedir, "config.001.ts");
    const configName = "different.config.js";
    const readConfig = createConfigurationReader();
    const cfg = await readConfig(configPath, {
      configName,
      cacheDir,
    });

    const compiledConfig = path.join(cacheDir, configName);
    expect(cfg.collections).toHaveLength(1);
    expect(existsSync(compiledConfig)).toBe(true);
  });

  it("should throw an error if the config file does not exists", async () => {
    await expect(config("non-existing")).rejects.toThrowError(
      /configuration file .*non-existing does not exist/,
    );
  });

  it("should throw an error if the config file is invalid", async () => {
    await expect(config("invalid")).rejects.toThrowError(
      /configuration file .*invalid is invalid/,
    );
  });
});
