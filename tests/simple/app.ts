import { allPosts } from "mdx-collections";

for (const post of allPosts) {
  console.log("---");
  console.log(post._meta.path);
  console.log(post.title);
  console.log(post.upper);
  console.log(post.lower);
  console.log(post.description);
  console.log(post.date);
  // @ts-expect-error unknown property should be an error
  console.log(post.unknown);
  console.log("---");
}
