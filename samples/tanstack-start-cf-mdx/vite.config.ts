import contentCollections from "@content-collections/vite";
import mdx from "@mdx-js/rollup";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  server: {
    port: 5184,
  },
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
      }),
    },
    contentCollections({
      environment: "ssr",
    }),
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tanstackStart({
      rsc: {
        enabled: true,
      },
    }),
    rsc(),
    react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
    cloudflare({
      viteEnvironment: {
        name: "ssr",
        childEnvironments: ["rsc"]
      },
    }),
  ],
});
