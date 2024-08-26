import { Plugin } from "vite";
import contentCollectionsPlugin, { Options } from "@content-collections/vite";

export default function remixContentCollectionsPlugin(
  options?: Partial<Omit<Options, "isEnabled">>
): Plugin {
  const plugin = contentCollectionsPlugin({
    ...(options || {}),
    isEnabled(config) {
      return config.router?.name === "ssr";
    },
  });

  return {
    ...plugin,
    name: "solidstart-content-collections",
  };
}
