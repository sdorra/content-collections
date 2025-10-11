import { configureLogging } from "@content-collections/integrations";
import type { NextConfig } from "next";
import {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} from "next/constants.js";

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
  return function withContentCollectionsPlugin(
    nextConfig: NextConfigInput = {},
  ) {
    return async function wrappedNextConfig(
      phase: string,
      defaults: { defaultConfig: NextConfig },
    ): Promise<Partial<NextConfig>> {
      const isBuild = phase === PHASE_PRODUCTION_BUILD;
      const isDev =
        phase === PHASE_DEVELOPMENT_SERVER ||
        process.env.NODE_ENV === "development";

      if (isBuild || isDev) {
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

      if (typeof nextConfig === "function") {
        return await nextConfig(phase, defaults);
      }

      return nextConfig;
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
