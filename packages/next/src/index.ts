import { configureLogging } from "@content-collections/integrations";
import type { NextConfig } from "next";

type Options = {
  configPath: string;
};

const defaultOptions: Options = {
  configPath: "content-collections.ts",
};

export function createContentCollectionPlugin(pluginOptions: Options) {
  return async (
    nextConfig: Partial<NextConfig> | Promise<Partial<NextConfig>> = {}
  ): Promise<Partial<NextConfig>> => {
    const [command] = process.argv
      .slice(2)
      .filter((arg) => !arg.startsWith("-"));
    if (command === "build" || command === "dev") {
      const { createBuilder } = await import("@content-collections/core");

      console.log("Starting content-collections", pluginOptions.configPath);
      const builder = await createBuilder(pluginOptions.configPath);
      configureLogging(builder);

      await builder.build();

      if (command === "dev") {
        console.log("start watching ...");
        await builder.watch();
      }
    }

    return nextConfig;
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
