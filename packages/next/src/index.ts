import { createBuilder } from "@content-collections/core";
import type { NextConfig } from "next";
import type webpack from "webpack";

let initialized = false;

type Options = {
  configPath: string;
};

const defaultOptions: Options = {
  configPath: "content-collections.ts",
};

class contentCollectionWebpackPlugin {
  constructor(readonly options: Options) {}

  apply(compiler: webpack.Compiler) {

    compiler.hooks.beforeCompile.tapPromise(
      "contentCollectionWebpackPlugin",
      async () => {
        if (initialized) {
          return;
        }
        initialized = true;

        console.log("Starting content-collections", this.options.configPath);
        const builder = await createBuilder(this.options.configPath);
        await builder.build();
      }
    );

  }
}


export function createcontentCollectionPlugin(pluginOptions: Options) {
  const plugin = new contentCollectionWebpackPlugin(pluginOptions);
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

export const withcontentCollections = createcontentCollectionPlugin(defaultOptions);
