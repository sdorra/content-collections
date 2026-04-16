import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { allPosts } from "content-collections";

const getPostBySlugServerFn = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const post = allPosts.find((post) => post.slug === slug);
    if (!post) {
      throw notFound();
    }

    const MDXContent = post.mdx;

    return {
      ...post,
      mdx: await renderServerComponent(<MDXContent />)
    }
  });

export const getPostBySlug = async (slug: string) =>
  getPostBySlugServerFn({ data: slug });

export const getAllPosts = createServerFn({ method: "GET" }).handler(
  async () => {
    return allPosts.map(({ mdx, ...post }) => post);
  },
);
