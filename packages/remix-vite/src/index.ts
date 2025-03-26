import contentCollectionsPlugin, { Options } from "@content-collections/vite";
import { Plugin } from "vite";

export default function remixContentCollectionsPlugin(
  options?: Partial<Omit<Options, "isEnabled">>,
): Plugin {
  const plugin = contentCollectionsPlugin({
    ...(options || {}),
    isEnabled(config) {
      if (
        !config.build?.ssr &&
        // @ts-expect-error - this is a remix specific property
        (config.__remixPluginResolvedConfig || config.__remixPluginContext || config.__reactRouterPluginContext?.environmentBuildContext?.name === "client")
      ) {
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
