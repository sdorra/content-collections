import { Plugin } from "vite";
import contentCollectionsPlugin, { Options } from "@content-collections/vite";

export default function remixContentCollectionsPlugin(
  options?: Partial<Omit<Options, "isEnabled">>
): Plugin {
  const plugin = contentCollectionsPlugin({
    ...(options || {}),
    isEnabled(config) {
      // @ts-ignore - this is a remix specific property
      if (config.__remixPluginResolvedConfig || config.__remixPluginContext) {
        return true;
      }
      return false;
    },
  });

  return {
    ...plugin,
    name: "remix-content-collections",
  };
}
