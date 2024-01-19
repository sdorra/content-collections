const { withcontentCollections } = require("@content-collections/next");

/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects: () => ([
    {
      source: "/docs/guides/getting-started",
      destination: "/docs/",
      permanent: true,
    },
  ])
}

module.exports = withcontentCollections(nextConfig);
