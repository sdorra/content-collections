import { ZodTypeAny } from "zod";
import * as esbuild from "esbuild";
import fs from "node:fs/promises";
import path from "node:path";
import packageJson from "../package.json";

export type Collection<TSchema extends ZodTypeAny> = {
  name: string;
  typeName?: string;
  schema: TSchema;
  sources: string | string[];
};

export type AnyCollection = Collection<ZodTypeAny>;

export function defineCollection<TSchema extends ZodTypeAny>(
  collection: Collection<TSchema>
) {
  return collection;
}

export type Configuration<TCollections extends Array<AnyCollection>> = {
  collections: TCollections;
};

export type AnyConfiguration = Configuration<Array<AnyCollection>>;

export type InternalConfiguration = {
  collections: AnyCollection[];
  path: string;
};

export function defineConfig<TConfig extends AnyConfiguration>(
  config: TConfig
) {
  return config;
}

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
