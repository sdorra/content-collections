---
title: Next.js MDX Static Import
description: Let Next.js compile MDX, and simply import the files
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

Configure Content Collections that it discover the MDX files, exclude the content and create a static import to the mdx file e.g.:

```ts
import {
  createDefaultImport,
  defineCollection,
  defineConfig,
} from "@content-collections/core";
import { MDXContent } from "mdx/types";

const posts = defineCollection({
  name: "posts",
  directory: "./content/posts",
  include: "*.mdx",
  parser: "frontmatter-only",
  schema: (z) => ({
    title: z.string(),
  }),
  transform: ({ _meta, ...post }) => {
    const mdxContent = createDefaultImport<MDXContent>(`@/content/posts/${_meta.filePath}`);
    return {
      ...post,
      mdxContent,
    };
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
    remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
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

When we want to render the content of a post, we can use our content as a component:

```tsx
export default async function Post({ params: { slug } }: Props) {
  const post = allPosts.find((post) => post.slug === slug);
  if (!post) {
    return notFound();
  }

  const MdxContent = post.mdxContent;

  return (
    <article className="post">
      <h2>{post.title}</h2>
      <div className="content">
        <MdxContent />
      </div>
    </article>
  );
}
```
