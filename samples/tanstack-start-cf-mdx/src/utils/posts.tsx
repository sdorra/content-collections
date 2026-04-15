import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import {
  createFromReadableStream,
  renderToReadableStream,
} from "@tanstack/react-start/rsc";
import { allPosts } from "content-collections";

const getMdxContentServerFn = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const post = findPostBySlug(slug);
    const MDXContent = post.mdx;

    return renderToReadableStream(<MDXContent />);
  });

export async function getMdxContent(slug: string) {
  const mdx = await getMdxContentServerFn({ data: slug });
  return createFromReadableStream(mdx);
}

export function findPostBySlug(slug: string) {
  const post = allPosts.find((post) => post.slug === slug);
  if (!post) {
    throw notFound();
  }
  return post;
}
