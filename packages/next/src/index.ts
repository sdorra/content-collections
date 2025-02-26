import { configureLogging } from "@content-collections/integrations";
import type { NextConfig } from "next";

type Options = {
  configPath: string;
};

const defaultOptions: Options = {
  configPath: "content-collections.ts",
};

const initializedState: Record<string, boolean> = {};

export function createContentCollectionPlugin(pluginOptions: Options) {
  return async (
    nextConfig: Partial<NextConfig> | Promise<Partial<NextConfig>> = {},
  ): Promise<Partial<NextConfig>> => {
    const [command] = process.argv
      .slice(2)
      .filter((arg) => !arg.startsWith("-"));
    if (command === "build" || command === "dev") {
      if (process.ppid === 1) {
        // if the parent process is 1, we assume that the parent process was killed
        // and we are running in a new process, so we skip the initialization
        // https://github.com/sdorra/content-collections/issues/499
        return nextConfig;
      }

      const initialized = initializedState[pluginOptions.configPath];

      if (initialized) {
        return nextConfig;
      }

      initializedState[pluginOptions.configPath] = true;

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
