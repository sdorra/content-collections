---
title: Transform
---

The `transform` function of a collection can be used to perform various tasks on the document before it is saved to the collection. It receives two arguments: the document, which matches the schema's shape, and a context object. The result of the `transform` function defines the TypeScript type of the document and should return an object that can be serialized to JSON. The function can be synchronous or asynchronous.

## Content

In Content Collections, the content of a document is just a string. One common use case for the `transform` function is to transform this content, such as converting markdown to HTML. While the content can be used directly with libraries like [react-markdown](https://github.com/remarkjs/react-markdown), transforming the content during build time is often beneficial.

Various libraries available in the Node.js ecosystem can be used for transformation, with the only requirement being that the result is JSON serializable. However, there are specific helper packages designed for Content Collections:

- [@content-collections/markdown](/docs/content/markdown) for converting markdown to HTML
- [@content-collections/mdx](/docs/content/mdx) for converting MDX to JSX

## Caching

The `transform` function is invoked for every document during each build or document change. While this behavior may change in the future, it currently holds true. Therefore, ensuring fast transformations is crucial. For slower operations like markdown to HTML conversion, the context object provides a `cache` function to cache costly operations.

Example:

```ts
transform: async (doc, { cache }) => {
  const html = await cache(doc.content, async (content) => {
    return markdownToHtml(content);
  });

  return {
    ...doc,
    html,
  };
};
```

In this example, the `markdownToHtml` function is only called if the content has changed.

**Note**: Caching the compilation steps of `@content-collections/markdown` or `@content-collections/mdx` is unnecessary as they already utilize the same caching mechanism.

## Access other collections

The `transform` function can access other collections using the `documents` function of the `context` object. The function requires a collection reference as parameter and returns an array of documents for that collection. But keep in mind the returned document are not transformed, they have the shape as defined in the schema of the referenced collection.

Example:

```ts
const authors = defineCollection({
  // ...
  schema: (z) => ({
    ref: z.string(),
    displayName: z.string()
  }),
});

const posts = defineCollection({
  // ...
  transform: async (doc, { documents }) => {
    const author = await documents(authors).find(
      (a) => a.ref === doc.author
    );
    return {
      ...doc,
      author: author.displayName
    };
  },
```

For a complete example have a look at the [Join collections](#join-collections) example.

## Examples

Here are some common use cases of the `transform` function:

### Generate a slug

```ts
transform: (doc) => {
  return {
    ...doc,
    slug: doc.title.toLowerCase().replace(/ /g, "-"),
  };
};
```

### Fetch external data

```ts
transform: async (author, { cache }) => {
  const bio: string = await cache(
    `https://api.authors.com/bio/${author.username}`,
    async (url) => {
      const response = await fetch(url);
      const user = await response.json();
      return user.bio;
    }
  );

  return {
    ...user,
    bio,
  };
};
```

### Get last modification date from Git

```ts
transform: async (doc, { cache }) => {
  const lastModified = await cache(doc._meta.filePath, async (filePath) => {
    const { stdout } = await exec(`git log -1 --format=%ai -- ${filePath}`);
    if (stdout) {
      return new Date(stdout.trim()).toISOString();
    }
    return new Date().toISOString();
  });

  return {
    ...doc,
    lastModified,
  };
};
```

### Join collections

```ts
import { defineCollection, defineConfig } from "@content-collections/core";

const authors = defineCollection({
  name: "authors",
  directory: "content/authors",
  include: "*.md",
  schema: (z) => ({
    ref: z.string(),
    displayName: z.string(),
    email: z.string().email(),
  }),
});

const posts = defineCollection({
  name: "posts",
  directory: "content/posts",
  include: "*.md",
  schema: (z) => ({
    title: z.string(),
    author: z.string(),
  }),
  transform: async (document, context) => {
    const author = await context
      .documents(authors)
      .find((a) => a.ref === document.author);
    return {
      ...document,
      author,
    };
  },
});

export default defineConfig({
  collections: [authors, posts],
});
```
