import * as esbuild from "esbuild";
import fs from "node:fs/promises";
import path from "node:path";
import packageJson from "../package.json";
import { AnyCollection } from "./config";
import { existsSync } from "node:fs";

export type ErrorType = "Read" | "Compile";

export class ConfigurationError extends Error {
  type: ErrorType;
  constructor(type: ErrorType, message: string) {
    super(message);
    this.type = type;
  }
}

export type InternalConfiguration = {
  collections: Array<AnyCollection>;
  path: string;
  cache: string;
  generateTypes?: boolean;
};

const importPathPlugin: esbuild.Plugin = {
  name: "import-path",
  setup(build) {
    build.onResolve({ filter: /^\@content-collections\/core$/ }, () => {
      return { path: path.join(__dirname, "index.ts"), external: true };
    });
  },
};

export type Options = {
  configName: string;
  cacheDir?: string;
};

export const defaultConfigName = "content-collection-config.mjs";

function resolveCacheDir(config: string, options: Options) {
  if (options.cacheDir) {
    return options.cacheDir;
  }
  return path.join(path.dirname(config), ".content-collections", "cache");
}

async function compile(configurationPath: string, outfile: string) {
  const plugins: Array<esbuild.Plugin> = [];
  if (process.env.NODE_ENV === "test") {
    plugins.push(importPathPlugin);
  }

  await esbuild.build({
    entryPoints: [configurationPath],
    external: [
      ...Object.keys(packageJson.dependencies),
      "@content-collections/*",
    ],
    bundle: true,
    platform: "node",
    format: "esm",
    plugins,
    outfile,
  });
}

// errorHandler does not make sense here:
// because if the configuration is invalid, the program should exit

export function createConfigurationReader() {
  return async (
    configurationPath: string,
    options: Options = {
      configName: defaultConfigName,
    }
  ): Promise<InternalConfiguration> => {
    if (!existsSync(configurationPath)) {
      throw new ConfigurationError(
        "Read",
        `configuration file ${configurationPath} does not exist`
      );
    }

    const cacheDir = resolveCacheDir(configurationPath, options);
    await fs.mkdir(cacheDir, { recursive: true });

    const outfile = path.join(cacheDir, options.configName);

    try {
      await compile(configurationPath, outfile);
    } catch (error) {
      throw new ConfigurationError(
        "Compile",
        `configuration file ${configurationPath} is invalid: ${error}`
      );
    }

    const module = await import(
      `file://${path.resolve(outfile)}?x=${Date.now()}`
    );
    return {
      ...module.default,
      path: configurationPath,
      generateTypes: true,
      cache: module.default.cache || "memory",
    };
  };
}

export type ConfigurationReader = Awaited<
  ReturnType<typeof createConfigurationReader>
>;
