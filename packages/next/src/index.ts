import { configureLogging } from "@content-collections/integrations";
import type { NextConfig } from "next";

type Options = {
  configPath: string;
};

const defaultOptions: Options = {
  configPath: "content-collections.ts",
};

const initializedState: Record<string, boolean> = {};

type NextConfigInput =
  | Partial<NextConfig>
  | Promise<Partial<NextConfig>>
  | ((
      phase: string,
      defaults: { defaultConfig: NextConfig },
    ) => Partial<NextConfig> | Promise<Partial<NextConfig>>);

export function createContentCollectionPlugin(pluginOptions: Options) {
  const [command] = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));

  // typegen loads next.config.js
  const isTypegen = command === "typegen";

  // the build step loads next.config.js
  const isBuild = command === "build";

  // starting with v16 next dev doesn't load next.config.js
  // next dev - calls next-start in a forked process
  // next-start loads next.config.js
  // process.argv are not visible by next-start
  const isDev =
    // to make this compatible with previous versions
    // check if command is NOT set (next-start) and we are in development mode
    typeof command === "undefined" && process.env.NODE_ENV === "development";

  return async function withContentCollectionsPlugin(
    nextConfig: NextConfigInput = {},
  ): Promise<Partial<NextConfig>> {
    if (isBuild || isDev || isTypegen) {
      // In dev, avoid re-running in re-spawned child whose parent is PID 1

      // If the parent process is 1, we assume that the parent process was killed
      // and we are running in a new process, so we skip the initialization
      // https://github.com/sdorra/content-collections/issues/499

      // we do the check only in dev mode, because in environment like docker
      // it is common that the build is directly started by the init process (pid 1).
      // https://github.com/sdorra/content-collections/issues/511
      const shouldInitialize = !(isDev && process.ppid === 1);

      if (shouldInitialize) {
        const key = pluginOptions.configPath;
        if (!initializedState[key]) {
          initializedState[key] = true;

          const { createBuilder } = await import("@content-collections/core");
          console.log("Starting content-collections", key);

          const builder = await createBuilder(key);
          configureLogging(builder);

          await builder.build();

          if (isDev) {
            console.log("start watching ...");
            await builder.watch();
          }
        }
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
