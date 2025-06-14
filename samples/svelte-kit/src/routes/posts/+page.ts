import { allPosts } from "content-collections";
import type { PageLoad } from "../$types";

export const load: PageLoad = async () => {
  // Fetch all posts from the content collection and filter or sort (optional)
  const posts = allPosts;

  return {
    posts,
  };
};
