---
title: SolidStart Integration
description: Use Content Collections with SolidStart
linkText: SolidStart
icon: solid
---

1. Install required packages:

   We have to install the following packages:

   - `@content-collections/core`
   - `@content-collections/solid-start`

   ```bash
   pnpm add -D @content-collections/core @content-collections/solid-start
   ```

1. Adjust your `tsconfig.json`:

   ```json
   {
     "compilerOptions": {
       // ...
       "paths": {
         "~/*": ["./src/*"],
         "content-collections": ["./.content-collections/generated"]
       }
     }
   }
   ```

   We require a path alias for the generated files.
   This is necessary because we will generate the files in the `.content-collections/generated` folder.

1. Modify your `app.config.ts`:

   ```ts
   import { defineConfig } from "@solidjs/start/config";
   import contentCollections from "@content-collections/solid-start";
   export default defineConfig({
     vite: {
       plugins: [contentCollections()],
     },
   });
   ```

   Add the Content Collections plugin to your Vite config.

1. Create a `content-collections.ts` file at the root of your project:

   ```ts
   import { defineCollection, defineConfig } from "@content-collections/core";

   const posts = defineCollection({
     name: "posts",
     directory: "src/posts",
     include: "**/*.md",
     schema: (z) => ({
       title: z.string(),
       summary: z.string(),
     }),
   });

   export default defineConfig({
     collections: [posts],
   });
   ```

   This file defines a collection named `posts` in the `src/posts` folder.
   The collection will include all markdown files (`**/*.md`) and the schema will validate the `title` and `summary` fields.

1. Create your content files (e.g.: `src/posts/hello-world.md`):

   ```md
   ---
   title: "Hello world"
   summary: "This is my first post!"
   ---

   # Hello world

   This is my first post!
   ... rest of the content
   ```

   You can create unlimited content files.
   These files will be validated against the schema defined in the `content-collections.ts` file.
   If the files are valid, they will be automatically added to the `posts` collection.

1. Usage in your code:

   ```tsx
   import { allPosts } from "content-collections";

   export function Posts() {
     return (
       <ul>
         {allPosts.map((post) => (
           <li>
             <a href={`/posts/${post._meta.path}`}>
               <h3>{post.title}</h3>
               <p>{post.summary}</p>
             </a>
           </li>
         ))}
       </ul>
     );
   }
   ```

   Now you can just import the `allPosts` collection and use it in your code.
   The `allPosts` collection will contain all posts that are valid.
   The `post` object will contain the `title`, `summary` and `content` fields as well as some meta information in the `_meta` field.
