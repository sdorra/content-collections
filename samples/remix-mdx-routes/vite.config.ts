import { unstable_vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import mdx from "@mdx-js/rollup";
import tsconfigPaths from "vite-tsconfig-paths";
import contentCollections from "@content-collections/vite";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";

export default defineConfig({
  plugins: [
    remix(),
    mdx({
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
    }),
    contentCollections(),
    tsconfigPaths(),
  ],
  server: {
    port: 5177,
  }
});
