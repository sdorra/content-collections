"use client";

import { allPosts } from "content-collections";
import { MDXContent } from "@content-collections/mdx/react";

export default function ClientPage() {
  return (
    <>
      <h1>Posts (use client)</h1>
      {allPosts.map((post) => (
        <article key={post._meta.path}>
          <h2>{post.title}</h2>
          <MDXContent content={post.content} />
        </article>
      ))}
    </>
  );
}
