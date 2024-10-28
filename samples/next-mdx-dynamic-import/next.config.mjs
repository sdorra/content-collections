import { withContentCollections } from "@content-collections/next";
import createMDX from "@next/mdx";
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkFrontmatter,remarkMdxFrontmatter],
    rehypePlugins: [],
  },
});

export default withContentCollections(withMDX(nextConfig));
