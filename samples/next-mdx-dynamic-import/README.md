---
title: Next.js MDX Dynamic Import
description: Discover MDX files with Content Collections, but let Next.js compile them
tags:
  - next.js
  - react
  - rsc
  - mdx
adapter: next
---

<Callout type="warn">
  The method used in this sample does not currently work with turborepo.
</Callout>

## Installation

- Follow the instructions to [configure MDX routes in your Next.js project](https://nextjs.org/docs/app/building-your-application/configuring/mdx)
- Install Content Collections: [Next.js Quick Start](https://www.content-collections.dev/docs/quickstart/next)

## Configuration

Configure Content Collections that it discover the MDX files, but we exclude the content from the generated files e.g.:

```ts
import { defineCollection, defineConfig } from "@content-collections/core";
import { z } from "zod";

const posts = defineCollection({
  name: "posts",
  directory: "./content/posts",
  include: "*.mdx",
  schema: z.object({
    title: z.string(),
  }),
  transform: ({ content: _, ...post }) => {
    return post;
  },
});

export default defineConfig({
  collections: [posts],
});
```

We have to tell Next.js to remove the frontmatter from the MDX files during the compilation because the frontmatter is handled by Content Collections. For this, we have to configure the remark plugins remarkFrontmatter and remarkMdxFrontmatter in the Next.js configuration, e.g.:

```js
import { withContentCollections } from "@content-collections/next";
import createMDX from "@next/mdx";
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkFrontmatter,remarkMdxFrontmatter],
    rehypePlugins: [],
  },
});

export default withContentCollections(withMDX(nextConfig));
```

## Usage

Now we can use the generated `allPosts` collections as usual:

```tsx
<ul>
  {allPosts.map((post) => (
    <li key={post.slug}>
      <Link href={`/posts/${post.slug}`}>
        {post.title}
      </Link>
    </li>
  ))}
</ul>
```

But when we want to render the content of a post, we can use a dynamic import to let Next.js compile the MDX file for us:

```tsx
export default async function Post({ params: { slug } }: Props) {
  const post = allPosts.find((post) => post.slug === slug);
  if (!post) {
    return notFound();
  }

  const { default: Content } = await import(`../../content/posts/${post.slug}.mdx`);

  return (
    <article className="post">
      <h2>{post.title}</h2>
      <div className="content">
        <Content />
      </div>
    </article>
  );
}
```
