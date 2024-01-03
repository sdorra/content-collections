import { defineCollection, defineConfig } from "@content-collections/core";
import fs from "node:fs";
import z from "zod";

function mkdir(directory: string) {
  if (fs.existsSync(directory)) {
    return;
  }
  fs.mkdirSync(directory);
}

const posts = defineCollection({
  name: "posts",
  schema: z.object({
    title: z.string(),
  }),
  directory: "sources/posts",
  include: "**/*.md(x)?",
  onSuccess: (documents) => {
    mkdir("tmp");
    fs.writeFileSync(
      "tmp/posts.length",
      JSON.stringify(documents.length),
      "utf-8"
    );
  },
});

const authors = defineCollection({
  name: "authors",
  schema: z.object({
    displayName: z.string(),
  }),
  directory: "sources/authors",
  include: "**/*.md(x)?",
  onSuccess: (documents) => {
    mkdir("tmp");
    fs.writeFileSync(
      "tmp/authors.length",
      JSON.stringify(documents.length),
      "utf-8"
    );
  },
});

export default defineConfig({
  collections: [posts, authors],
});
