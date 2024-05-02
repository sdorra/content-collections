---
title: Remix MDX Routes
description: Use MDX routes with Remix and Content Collections
tags:
- mdx
- markdown
- react
- remix
adapter: remix
---

In remix there are several ways to define routes. For the sake of simplicity, we will use flat routes in this example, but it should be easy to adapt this example for directory routes.

Let's assume we have the following file structure:

```text
|- app
   |- routes
      |- _index.tsx
      |- posts.hello-world.mdx
      |- posts.second-post.mdx
```

Than we can define our collection like this:

```ts
import { defineCollection, defineConfig } from "@content-collections/core";

const posts = defineCollection({
  name: "posts",
  directory: "app/routes",
  include: "posts.*.mdx",
  schema: (z) => ({
    title: z.string()
  }),
  // we can exclude the content from the data
  // because remix will load the content for us
  transform: async ({content, _meta, ...data}) => {
    // turn e.g.: posts.hello-world.mdx into hello-world
    const slug = _meta.path.replace("posts.", "");
    return {
      ...data,
      slug
    };
  },
});

export default defineConfig({
  collections: [posts],
});
```

And thats it! Now we can use our collection in our `_index.tsx` file and Remix will do the rest for us:

```tsx
import { Link } from "@remix-run/react";
import { allPosts } from "content-collections";

export default function Index() {
  return (
    <main>
      <h1>Posts</h1>
      <ul>
        {allPosts.map((post) => (
          <li key={post.slug}>
            <Link to={`/posts/${post.slug}`}>
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

```