import { createBuilder } from "@content-collections/core";
import { Plugin } from "vite";

type Options = {
  configPath: string;
};

export default function contentCollectionsPlugin(
  options: Options = {
    configPath: "content-collections.ts",
  }
): Plugin {
  return {
    name: "content-collections",

    async buildStart() {
      console.log("Starting content-collections", options.configPath);
      const builder = await createBuilder(options.configPath);
      await builder.build();
    },
  };
}
