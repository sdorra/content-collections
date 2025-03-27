import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/posts.tsx"),
  route("posts/:slug", "routes/post.tsx"),
] satisfies RouteConfig;
