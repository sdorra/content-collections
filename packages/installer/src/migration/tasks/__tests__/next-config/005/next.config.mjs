import { withContentCollections } from "@content-collections/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // your next.js config
};

// withContentCollections must be the outermost plugin
export default withContentCollections(nextConfig);
