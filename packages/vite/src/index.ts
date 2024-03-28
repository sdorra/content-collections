import { Builder, createBuilder } from "@content-collections/core";
import { Plugin, UserConfig } from "vite";
import path from "node:path";
import { configureLogging } from "@content-collections/integrations";

export type Options = {
  configPath: string;
  isEnabled?: (config: UserConfig) => boolean;
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

export default function contentCollectionsPlugin(
  options: Partial<Options> = {}
): Plugin {
  const pluginOptions = { ...defaultOptions, ...options };

  let builder: Builder;
  let isEnabled = false;

  return {
    name: "content-collections",

    config(config) {
      isEnabled = options.isEnabled ? options.isEnabled(config) : true;

      // even if the plugin is disabled, we need to configure the alias
      // vite is often executed multiple time and the plugin should only
      // run once, but the aliases must be available for all runs

      let configPath = resolveConfigPath(
        config.root || process.cwd(),
        pluginOptions.configPath
      );

      const directory = path.resolve(
        path.dirname(configPath),
        "./.content-collections/generated"
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
      if (!isEnabled) {
        return;
      }
      let configPath = resolveConfigPath(config.root, pluginOptions.configPath);
      console.log(
        "Starting content-collections with config",
        path.relative(process.cwd(), configPath)
      );

      builder = await createBuilder(configPath);
      configureLogging(builder);

      console.log("Start initial build");
      await builder.build();

      return;
    },

    async configureServer() {
      if (!isEnabled) {
        return;
      }
      console.log("Start watching");
      builder.watch();
      return;
    },
  };
}
