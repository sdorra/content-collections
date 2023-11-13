import { allPosts } from "mdx-collections";

for (const post of allPosts) {
  console.log(post._document.path, post.upper);
}
