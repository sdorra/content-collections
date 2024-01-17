import { configureLogging } from "@content-collections/integrations";
import type { NextConfig } from "next";
import type webpack from "webpack";

let initialized = false;

type Options = {
  configPath: string;
};

const defaultOptions: Options = {
  configPath: "content-collections.ts",
};

// use dynamic import if the next package is used in a commonjs environment
const coreImport = import("@content-collections/core");

class ContentCollectionWebpackPlugin {
  constructor(readonly options: Options) {}

  apply(compiler: webpack.Compiler) {
    compiler.hooks.beforeCompile.tapPromise(
      "contentCollectionWebpackPlugin",
      async () => {
        if (initialized) {
          return;
        }
        initialized = true;

        const { createBuilder } = await coreImport;

        console.log("Starting content-collections", this.options.configPath);
        const builder = await createBuilder(this.options.configPath);
        configureLogging(builder);
        await builder.build();

        if (compiler.watchMode) {
          console.log("start watching ...");
          await builder.watch();
        }
      }
    );
  }
}

export function createcontentCollectionPlugin(pluginOptions: Options) {
  const plugin = new ContentCollectionWebpackPlugin(pluginOptions);
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
          level: "error",
        };

        return config;
      },
    };
  };
}

export const withcontentCollections =
  createcontentCollectionPlugin(defaultOptions);
