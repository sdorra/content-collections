import * as esbuild from "esbuild";
import fs from "node:fs/promises";
import path from "node:path";
import packageJson from "../package.json";
import { Collection } from "./config";
import { ZodTypeAny } from "zod";

export type InternalConfiguration = {
  collections: Array<Collection<ZodTypeAny>>;
  path: string;
};

const importPathPlugin: esbuild.Plugin = {
  name: "import-path",
  setup(build) {
    build.onResolve({ filter: /^\@mdx-collections\/core$/ }, () => {
      return { path: path.join(__dirname, "index.ts"), external: true };
    });
  },
};

type Options = {
  configName: string;
  cacheDir?: string;
};

function resolveCacheDir(config: string, options: Options) {
  if (options.cacheDir) {
    return options.cacheDir;
  }
  return path.join(path.dirname(config), ".mdx-collections", "cache");
}

export async function applyConfig(
  config: string,
  options: Options = {
    configName: "mdx-collection-config.js",
  }
): Promise<InternalConfiguration> {
  const cacheDir = resolveCacheDir(config, options);
  await fs.mkdir(cacheDir, { recursive: true });

  const outfile = path.join(cacheDir, options.configName);

  const plugins: Array<esbuild.Plugin> = [];
  if (process.env.NODE_ENV === "test") {
    plugins.push(importPathPlugin);
  }

  // TODO handle build errors
  await esbuild.build({
    entryPoints: [config],
    external: [...Object.keys(packageJson.dependencies), "@mdx-collections/*"],
    bundle: true,
    platform: "node",
    format: "esm",
    plugins,
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
