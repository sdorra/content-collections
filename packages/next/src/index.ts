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

export function createContentCollectionPlugin(pluginOptions: Options) {
  const plugin = new ContentCollectionWebpackPlugin(pluginOptions);
  return (nextConfig: Partial<NextConfig> = {}): Partial<NextConfig> => {
    return {
      ...nextConfig,
      webpack(config, options) {
        config.plugins!.push(plugin);

        if (typeof nextConfig.webpack === "function") {
          return nextConfig.webpack(config, options);
        }

        return config;
      },
    };
  };
}

export const withContentCollections =
  createContentCollectionPlugin(defaultOptions);

// Fixed typos in function names, but keep the old for backwards compatibility
export {
  /**
   * @deprecated use `createContentCollectionPlugin` instead
   */
  createContentCollectionPlugin as createcontentCollectionPlugin,
  /**
   * @deprecated use `withContentCollections` instead
   */
  withContentCollections as withcontentCollections,
};
