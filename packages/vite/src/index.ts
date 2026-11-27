import { Builder, createBuilder } from "@content-collections/core";
import { configureLogging } from "@content-collections/integrations";
import path from "node:path";
import type { Logger, Plugin, UserConfig } from "vite";

export type Options = {
  configPath: string;
  isEnabled?: (config: UserConfig) => boolean;
  environment?: string;
};

const defaultOptions = {
  configPath: "content-collections.ts",
};

function resolveConfigPath(root: string, configPath: string) {
  if (!path.isAbsolute(configPath)) {
    configPath = path.resolve(root, configPath);
  }
  return configPath;
}

type WatcherSubscription = Awaited<ReturnType<Builder["watch"]>>;

export default function contentCollectionsPlugin(
  options: Partial<Options> = {},
): Plugin {
  const pluginOptions = { ...defaultOptions, ...options };

  let builder: Builder;
  let logger: Logger | undefined;
  let watcherSubscription: WatcherSubscription | undefined;

  function isEnabled(config: UserConfig) {
    return options.isEnabled ? options.isEnabled(config) : true;
  }

  function shouldRun(environment?: string) {
    if (!builder) {
      return false;
    }

    if (!environment || !pluginOptions.environment) {
      return true;
    }

    return pluginOptions.environment === environment;
  }

  return {
    name: "content-collections",

    config(config) {
      // even if the plugin is disabled, we need to configure the alias
      // vite is often executed multiple time and the plugin should only
      // run once, but the aliases must be available for all runs

      let configPath = resolveConfigPath(
        config.root || process.cwd(),
        pluginOptions.configPath,
      );

      const directory = path.resolve(
        path.dirname(configPath),
        "./.content-collections/generated",
      );

      const configPatch: Partial<UserConfig> = {
        optimizeDeps: {
          exclude: ["content-collections"],
        },
        resolve: {
          alias: {
            "content-collections": directory,
          },
        },
      };

      if ((config.server?.fs?.allow || []).length > 0) {
        // required for Svelte Kit
        configPatch.server = {
          fs: {
            allow: [directory],
          },
        };
      }

      return configPatch;
    },

    async configResolved(config: any) {
      if (!isEnabled(config)) {
        return;
      }
      // configResolved is called with `this: void`,
      // so we have to use the logger of the resolved config
      logger = config.logger;
      let configPath = resolveConfigPath(config.root, pluginOptions.configPath);
      logger?.info(
        `Starting content-collections with config ${path.relative(process.cwd(), configPath)}`,
        { timestamp: true },
      );

      builder = await createBuilder(configPath);
      configureLogging(builder);

      return;
    },

    async buildStart() {
      if (!shouldRun(this.environment?.name)) {
        return;
      }

      logger?.info("Start initial build", { timestamp: true });
      await builder.build();
      return;
    },

    async configureServer() {
      if (!builder) {
        return;
      }
      logger?.info("Start watching", { timestamp: true });
      watcherSubscription = await builder.watch();
      return;
    },

    async closeBundle() {
      const subscription = watcherSubscription;
      watcherSubscription = undefined;
      await subscription?.unsubscribe();
      return;
    },
  };
}
