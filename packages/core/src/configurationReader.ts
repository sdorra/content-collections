import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { AnyContent } from "./config";
import { compile } from "./esbuild";
import { deprecated } from "./features";

export type ErrorType = "Read" | "Compile";

export class ConfigurationError extends Error {
  type: ErrorType;
  constructor(type: ErrorType, message: string) {
    super(message);
    this.type = type;
  }
}

export type InternalConfiguration = {
  collections: Array<AnyContent>;
  path: string;
  inputPaths: Array<string>;
  checksum: string;
  generateTypes?: boolean;
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

// errorHandler does not make sense here:
// because if the configuration is invalid, the program should exit

export function createConfigurationReader() {
  return async (
    configurationPath: string,
    options: Options = {
      configName: defaultConfigName,
    },
  ): Promise<InternalConfiguration> => {
    if (!existsSync(configurationPath)) {
      throw new ConfigurationError(
        "Read",
        `configuration file ${configurationPath} does not exist`,
      );
    }

    const cacheDir = resolveCacheDir(configurationPath, options);
    await fs.mkdir(cacheDir, { recursive: true });

    const outfile = path.join(cacheDir, options.configName);

    try {
      const configurationPaths = await compile(configurationPath, outfile);

      const module = await import(
        `file://${path.resolve(outfile)}?x=${Date.now()}`
      );

      const { content, collections, ...rest } = module.default;
        if (!content && collections) {
        deprecated("collectionsConfigProperty");
      }

      const hash = createHash("sha256");
      hash.update(await fs.readFile(outfile, "utf-8"));
      const checksum = hash.digest("hex");

      return {
        ...rest,
        collections: content ?? collections ?? [],
        path: configurationPath,
        inputPaths: configurationPaths.map((p) => path.resolve(p)),
        generateTypes: true,
        checksum,
      };
    } catch (error) {
      throw new ConfigurationError(
        "Compile",
        `configuration file ${configurationPath} is invalid: ${error}`,
      );
    }
  };
}

export type ConfigurationReader = Awaited<
  ReturnType<typeof createConfigurationReader>
>;
