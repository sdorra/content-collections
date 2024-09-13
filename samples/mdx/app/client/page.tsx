"use client";

import { MDXContent } from "@content-collections/mdx/react";
import { allPosts } from "content-collections";

export default function ClientPage() {
  return (
    <>
      <h1>Posts (use client)</h1>
      {allPosts.map((post) => (
        <article key={post._meta.path}>
          <h2>{post.title}</h2>
          <MDXContent code={post.content} />
        </article>
      ))}
    </>
  );
}
