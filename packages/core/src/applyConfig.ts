import * as esbuild from "esbuild";
import fs from "node:fs/promises";
import path from "node:path";
import packageJson from "../package.json";
import { Collection } from "./config";
import { ZodTypeAny } from "zod";

type InternalConfiguration = {
  collections: Array<Collection<ZodTypeAny>>;
  path: string;
};

export async function applyConfig(
  config: string
): Promise<InternalConfiguration> {
  const directory = path.dirname(config);
  const cacheDir = path.join(directory, ".mdx-collections", "cache");
  await fs.mkdir(cacheDir, { recursive: true });

  const outfile = path.join(cacheDir, "mdx-collection-config.mjs");

  await esbuild.build({
    entryPoints: [config],
    external: [...Object.keys(packageJson.dependencies), "@mdx-collections/*"],
    bundle: true,
    platform: "node",
    format: "esm",
    outfile,
  });

  const module = await import(
    `file://${path.resolve(outfile)}?x=${Date.now()}`
  );
  return {
    ...module.default,
    path: config,
  };
}
