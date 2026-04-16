---
title: TanStack Start Cloudflare MDX
description: Use Content Collections with TanStack Start, MDX, RSC on Cloudflare
tags:
  - tanstack
  - vite
  - react
  - rsc
  - mdx
  - cloudflare
adapter: vite
---

This sample demonstrates the usage of static imports with Content Collections to use MDX on Cloudflare Workers.
In this sample, we use the [@mdx-js/rollup](https://mdxjs.com/packages/rollup/) as a Vite plugin to do the MDX compilation.

You may ask why not [@content-collections/mdx](https://www.content-collections.dev/docs/content/mdx)? 
This package uses [mdx-bundler](https://github.com/kentcdodds/mdx-bundler) to compile the MDX files. The [mdx-bundler](https://github.com/kentcdodds/mdx-bundler) uses `new Function()` to evaluate the code at runtime, which is blocked by Cloudflare Workers, see [#744](https://github.com/sdorra/content-collections/issues/744).
Besides this, it has several benefits to let the bundler, which already bundles the rest of the application, bundle the MDX files too, see the extract of the [Content Collections docs](https://www.content-collections.dev/docs/transform#content):

> This approach is particularly beneficial for larger sites using mdx. If the bundler that compiles the rest of the application also includes the mdx content files, it can optimize the resulting bundle. This way, imports in mdx files are resolved by the bundler and function like those in the rest of the application. Using an external bundler, as we do with @content-collections/mdx, may lead to larger bundles because the external bundler must re-bundle every used component, even if it is already utilized elsewhere in the application.

## Setup mdx rendering

We have to set up MDX rendering in Vite and we have to remove the frontmatter.
The MDX plugin must be enforced as a pre plugin in order to ensure it runs before the React plugin.
To remove the frontmatter we use the `remark-frontmatter` and `remark-mdx-frontmatter` remark plugins.
We also have to inform the React plugin about the MDX file extension.
A complete `vite.config.ts` could look like the following:

```ts
import contentCollections from "@content-collections/vite";
import mdx from "@mdx-js/rollup";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
      }),
    },
    contentCollections(),
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tanstackStart(),
    react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
    cloudflare({
      viteEnvironment: {
        name: "ssr",
      },
    }),
  ],
});
```

## Static Importing MDX

Now we can use a static import to get our MDX.
At the moment, we can't use TypeScript aliases for the static import, so we have to use a relative path for now.

```ts
import {
  createDefaultImport,
  defineCollection,
  defineConfig,
} from "@content-collections/core";
import { MDXContent } from "mdx/types";
import { z } from "zod";

const posts = defineCollection({
  name: "posts",
  directory: "content/posts",
  include: "*.mdx",
  parser: "frontmatter-only",
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    author: z.string(),
  }),
  transform: async ({ _meta, ...post }) => {
    const mdx = createDefaultImport<MDXContent>(
      `../../content/posts/${_meta.filePath}`,
    );
    return {
      ...post,
      slug: _meta.path,
      mdx,
    };
  },
});

export default defineConfig({
  content: [posts],
});
```

## Using the MDX

With this setup, we can start using MDX in our routes:

```tsx
import { createFileRoute, notFound } from "@tanstack/react-router";
import { allPosts } from "content-collections";

export const Route = createFileRoute("/posts/$slug")({
  component: PostComponent,
});

function PostComponent() {
  const { slug } = Route.useParams();
  
  const post = allPosts.find((post) => post.slug === slug);
  if (!post) {
    throw notFound();
  }

  const MDXContent = post.mdx;

  return (
    <article className="post">
      <header>
        <h2>{post.title}</h2>
      </header>
      <div className="content">
        <MDXContent />
      </div>
      <footer>
        <p>By {post.author}</p>
        <time>{post.date}</time>
      </footer>
    </article>
  );
}
```

## The Problem

The problem with the setup above is that every one of our MDX files ends up in the client bundle, which can be fine if the files do not have secret information and if there are only a few of them.
But in larger setups, we want to have our collections only on the server side, and this is the part where it becomes tricky.
First, we should ensure that our collection never ends up in a client bundle. For this, we can use the import protection of TanStack Start (https://tanstack.com/start/latest/docs/framework/react/guide/import-protection) with a writer hook (https://www.content-collections.dev/docs/configuration#writer):

```ts
const serverOnlyHook: WriterHook = async ({ fileType, content }) => {
  if (fileType === "typeDefinition") {
    return { content };
  }
  return {
    content: `import '@tanstack/react-start/server-only';\n\n${content}`,
  };
};

export default defineConfig({
  content: [posts],
  hooks: {
    writer: [serverOnlyHook],
  },
});
```

This will add the `@tanstack/react-start/server-only` import to the generated collection files.

The next thing we have to do is to ensure that Content Collections only runs within the `ssr` environment of Vite, so we have to pass the environment option to the Content Collections Vite plugin in our `vite.config.ts`:

```ts
contentCollections({
  environment: "ssr",
}),
```

At this point, we create our collections only if the `ssr` bundle is built, and we get an error whenever our collection is used in the client environment.

Now we have to use a [Server Function](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions) to access our collection. The plan is to use a server function to access our collection and return the data within a [loader](https://tanstack.com/router/latest/docs/guide/data-loading), but we can't return the compiled MDX in a loader because it is not serializable.

Luckily, TanStack now has support for RSC, which makes it possible to stream our MDX from the server to the client.

## RSC

In order to use RSC, we have to enable it in the `vite.config.ts`:

- Import the `@vitejs/plugin-rsc` plugin
- Enable RSC in the `tanstackStart` plugin
- Set the Vite childEnvironments to RSC in the Cloudflare plugin

```ts
import rsc from "@vitejs/plugin-rsc";
// ... (unchanged imports)
export default defineConfig({
  plugins: [
    // ... (unchanged plugins)
    tanstackStart({
      rsc: {
        enabled: true,
      },
    }),
    rsc(),
    react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
    cloudflare({
      viteEnvironment: {
        name: "ssr",
        childEnvironments: ["rsc"]
      },
    }),
  ],
});

```

Now we have everything in place, so we can use RSC in our Routes:

```tsx
import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";

const getPostBySlug = createServerFn({ method: "GET" })
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

export const Route = createFileRoute("/posts/$slug")({
  loader: ({ params: { slug } }) => getPostBySlug({data: slug}),
  component: PostComponent,
  pendingComponent: () => <div>Loading...</div>,
});

function PostComponent() {
  const post = Route.useLoaderData();

  return (
    <article className="post">
      <header>
        <h2>{post.title}</h2>
      </header>
      <div className="content">{post.mdx}</div>
      <footer>
        <p>By {post.author}</p>
        <time>{post.date}</time>
      </footer>
    </article>
  );
}
```

And thats it!
