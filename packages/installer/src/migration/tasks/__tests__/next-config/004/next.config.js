const { withContentCollections } = require("@content-collections/next");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // your next.js config
};

// withContentCollections must be the outermost plugin
module.exports = withContentCollections(nextConfig);
