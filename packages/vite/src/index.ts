import { createBuilder } from "@mdx-collections/core";
import { Plugin } from "vite";

type Options = {
  configPath: string;
};

export default function MdxCollectionsPlugin(
  options: Options = {
    configPath: "mdxcol.config.ts",
  }
): Plugin {
  return {
    name: "mdx-collections",

    async buildStart() {
      console.log("Starting mdx-collections", options.configPath);
      const builder = await createBuilder(options.configPath);
      await builder.build();
    },
  };
}
