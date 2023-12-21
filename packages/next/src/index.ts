import { applyConfig, createRunner } from "@mdx-collections/core";
import type { NextConfig } from "next";
import type webpack from "webpack";
import path from "path";

let initialized = false;

type Options = {
  configPath: string;
};

const defaultOptions: Options = {
  configPath: "mdxcol.config.ts",
};

class MdxCollectionWebpackPlugin {
  constructor(readonly options: Options) {}

  apply(compiler: webpack.Compiler) {

    compiler.hooks.beforeCompile.tapPromise(
      "MdxCollectionWebpackPlugin",
      async () => {
        if (initialized) {
          return;
        }
        initialized = true;

        console.log("Starting mdx-collections", this.options.configPath);
        const config = await applyConfig(this.options.configPath);

        const baseDirectory = path.dirname(this.options.configPath);
        const directory = path.join(baseDirectory, ".mdx-collections", "generated");

        const runner = await createRunner(config, directory);
        await runner.run();
      }
    );

  }
}


export function createMdxCollectionPlugin(pluginOptions: Options) {
  const plugin = new MdxCollectionWebpackPlugin(pluginOptions);
  return (nextConfig: Partial<NextConfig> = {}): Partial<NextConfig> => {
    return {
      ...nextConfig,
      webpack(config, options) {
        config.plugins!.push(plugin);

        if (typeof nextConfig.webpack === "function") {
          return nextConfig.webpack(config, options);
        }

        config.infrastructureLogging = {
          ...config.infrastructureLogging,
          // TODO: not the best way to do this, but it works for now.
          // Silence warning about dynamic import of next.config file.
          // > [webpack.cache.PackFileCacheStrategy/webpack.FileSystemInfo] Parsing of /Users/wes/Sites/mux/next-video/dist/config.js for build dependencies failed at 'import(path.resolve("next.config.js"))'.
          // > Build dependencies behind this expression are ignored and might cause incorrect cache invalidation.
          level: 'error',
        };

        return config;
      },
    };
  };
}

export const withMdxCollections = createMdxCollectionPlugin(defaultOptions);
