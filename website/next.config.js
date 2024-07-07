const { withContentCollections } = require("@content-collections/next");

/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects: () => [
    {
      source: "/docs/guides/getting-started",
      destination: "/docs/",
      permanent: true,
    },
    {
      source: "/docs/integrations/:slug",
      destination: "/docs/quickstart/:slug",
      permanent: true,
    },
    {
      source: "/docs/samples",
      destination: "/samples",
      permanent: true,
    },
    {
      source: "/docs/samples/:slug",
      destination: "/samples/:slug",
      permanent: true,
    }
  ],
};

module.exports = withContentCollections(nextConfig);
