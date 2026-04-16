import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import {
  createFromReadableStream,
  renderToReadableStream,
} from "@tanstack/react-start/rsc";
import { allPosts } from "content-collections";

const getPostServerFn = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const post = allPosts.find((post) => post.slug === slug);
    if (!post) {
      throw notFound();
    }
    const MDXContent = post.mdx;

    return {
      ...post,
      mdx: renderToReadableStream(<MDXContent />),
    };
  });

export async function getPostBySlug(slug: string) {
  const { mdx, ...post } = await getPostServerFn({ data: slug });
  return {
    ...post,
    mdx: await createFromReadableStream(mdx),
  };
}

export const getAllPosts = createServerFn({ method: "GET" }).handler(
  async () => {
    return allPosts.map(({ mdx, ...post }) => post);
  },
);
