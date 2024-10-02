import type { NextConfig } from "next";
import { withContentCollections } from "@content-collections/next";

const nextConfig: NextConfig = {
  /* config options here */
};

// withContentCollections must be the outermost plugin
export default withContentCollections(nextConfig);
