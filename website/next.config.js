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
    },
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/vjeqenuhn/launchfast-website/purple-icon.png"
      }
    ],
  },
};

module.exports = withContentCollections(nextConfig);
