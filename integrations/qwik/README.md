---
title: Qwik Integration
description: Use Content Collections with Qwik
linkText: Qwik
icon: qwik
---

1. Install required packages:

   We have to install the following packages:

   - `@content-collections/core`
   - `@content-collections/vite`

   <PackageInstall devDependencies={true} packages={["@content-collections/core", "@content-collections/vite"]} />

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

1. Modify your `vite.config.ts`:

   ```ts
   import { defineConfig, type UserConfig } from "vite";
   import { qwikVite } from "@builder.io/qwik/optimizer";
   import { qwikCity } from "@builder.io/qwik-city/vite";
   import tsconfigPaths from "vite-tsconfig-paths";
   import contentCollections from "@content-collections/vite";

   export default defineConfig((): UserConfig => {
     return {
       plugins: [qwikCity(), qwikVite(), tsconfigPaths(), contentCollections()],
       // ...
     };
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

   For more information about the configuration have a look at the [documentation](/docs/main/configuration).

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
   import { component$ } from "@builder.io/qwik";
   import type { DocumentHead } from "@builder.io/qwik-city";
   import { allCharacters } from "content-collections";

   export default component$(() => {
     return (
       <main>
         <h1>Characters</h1>
         <ul>
           {allCharacters.map((character) => (
             <li key={character.name}>
               <h2>{character.name}</h2>
               <ul>
                 <li>Planet of origin: {character.origin}</li>
                 <li>Species: {character.species}</li>
               </ul>
               <p>{character.content}</p>
               <a href={character.source}>Source</a>
             </li>
           ))}
         </ul>
       </main>
     );
   });

   export const head: DocumentHead = {
     title: "Welcome to Qwik",
     meta: [
       {
         name: "description",
         content: "Qwik site description",
       },
     ],
   };
   ```

   Now you can just import the `allPosts` collection and use it in your code.
   The `allPosts` collection will contain all posts that are valid.
   The `post` object will contain the `title`, `summary` and `content` fields as well as some meta information in the `_meta` field.
