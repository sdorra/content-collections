import contentCollectionsPlugin, { Options } from "@content-collections/vite";
import { Plugin } from "vite";

export default function vinxiContentCollectionsPlugin(
  options?: Partial<Omit<Options, "isEnabled">>,
): Plugin {
  const plugin = contentCollectionsPlugin({
    ...(options || {}),
    isEnabled(config) {
      // @ts-expect-error vinxi internal types
      const routerConfig = config.app?.config?.routers?.find(
        (router: any) => router.type !== "static",
      );

      const router = routerConfig?.name || "ssr";

      // @ts-expect-error vinxi internal types
      return config.router?.name === router;
    },
  });

  return {
    ...plugin,
    name: "vinxi-content-collections",
  };
}
