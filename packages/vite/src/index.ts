import { Builder, createBuilder } from "@content-collections/core";
import { Plugin } from "vite";
import path from "node:path";
import { configureLogging } from "@content-collections/integrations";

type Options = {
  configPath: string;
};

function resolveConfig(root: string, configPath: string) {
  if (!path.isAbsolute(configPath)) {
    configPath = path.resolve(root, configPath);
  }
  return configPath;
}

export default function contentCollectionsPlugin(
  options: Options = {
    configPath: "content-collections.ts",
  }
): Plugin {
  let builder: Builder;
  return {
    name: "content-collections",

    config(config) {
      let configPath = resolveConfig(
        config.root || process.cwd(),
        options.configPath
      );
      const directory = path.dirname(configPath);
      return {
        optimizeDeps: {
          exclude: ["content-collections"],
        },
        resolve: {
          alias: {
            "content-collections": path.resolve(
              directory,
              "./.content-collections/generated/index.js"
            ),
          },
        },
      };
    },

    async configResolved(config: any) {
      let configPath = resolveConfig(config.root, options.configPath);
      console.log(
        "Starting content-collections with config",
        path.relative(process.cwd(), configPath)
      );

      builder = await createBuilder(configPath);
      configureLogging(builder);

      return;
    },

    async buildStart() {
      console.log("Start initial build");
      await builder.build();
      return;
    },

    async configureServer() {
      console.log("Start watching");
      builder.watch();
      return;
    },
  };
}
