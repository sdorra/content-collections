import {
  Context,
  defineCollection,
  defineConfig,
  Document,
} from "@content-collections/core";
import rehypeSlug from "rehype-slug";
import rehypeShiki from "@shikijs/rehype";
import { Options, compileMDX } from "@content-collections/mdx";
import { selectAll } from "hast-util-select";
import { Root } from "hast";
import GithubSlugger from "github-slugger";
import { exec as cpExec } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const exec = promisify(cpExec);

function liCodeSlug() {
  return (tree: Root) => {
    const slugger = new GithubSlugger();

    selectAll("li p code:first-of-type", tree).forEach((node) => {
      const children = node.children;
      if (children.length === 1 && children[0].type === "text") {
        const text = slugger.slug(children[0].value);
        node.properties.id = text;
      }
    });
  };
}

async function lastModificationDate(ctx: Context, document: Document) {
  return ctx.cache(
    // TODO: this is a dirty hack to avoid cache key conflicts
    // we should find a way which handles this automatically
    { key: "_git_last_modified", ...document },
    async (document) => {
      const filePath = path.join(
        ctx.collection.directory,
        document._meta.filePath
      );

      const { stdout } = await exec(`git log -1 --format=%ai -- ${filePath}`);
      if (stdout) {
        return new Date(stdout.trim()).toISOString();
      }
      return new Date().toISOString();
    }
  );
}

const mdxOptions: Options = {
  rehypePlugins: [
    liCodeSlug,
    rehypeSlug,
    [rehypeShiki, { theme: "one-dark-pro" }],
  ],
};

const quickstart = defineCollection({
  name: "quickstart",
  directory: "../docs/_quickstart",
  include: "*.mdx",
  schema: (z) => ({
    title: z.string(),
    description: z.string().optional(),
    linkText: z.string().optional(),
    icon: z.string().optional(),
    category: z.string(),
  }),
  transform: async (data, ctx) => {
    const body = await compileMDX(ctx, data, mdxOptions);

    let linkText = data.linkText;
    if (!linkText) {
      linkText = data.title;
    }
    const href = `/docs/quickstart/${data._meta.path}`;
    const name = data._meta.path;
    return {
      title: data.title,
      description: data.description,
      icon: data.icon,
      href,
      linkText,
      name,
      body,
      category: data.category,
      lastModified: await lastModificationDate(ctx, data),
    };
  },
});

const samples = defineCollection({
  name: "samples",
  directory: "../samples",
  include: "*/README.md",
  schema: (z) => ({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    adapter: z.string(),
    stackBlitz: z
      .object({
        file: z.string(),
      })
      .optional(),
  }),
  transform: async (data, ctx) => {
    const body = await compileMDX(ctx, data, mdxOptions);
    const href = `/docs/samples/${data._meta.directory}`;
    const name = data._meta.directory;
    return {
      title: data.title,
      description: data.description,
      stackBlitz: data.stackBlitz,
      adapter: data.adapter,
      href,
      name,
      body,
      tags: data.tags,
      lastModified: await lastModificationDate(ctx, data),
    };
  },
});

const docs = defineCollection({
  name: "docs",
  directory: "../docs",
  include: "**/*.mdx",
  exclude: "_*/**",
  schema: (z) => ({
    title: z.string(),
    linkText: z.string().optional(),
    description: z.string().optional(),
  }),
  transform: async (data, ctx) => {
    const body = await compileMDX(ctx, data, mdxOptions);

    let linkText = data.linkText;
    if (!linkText) {
      linkText = data.title;
    }

    const parts = data._meta.path.split("/");
    const lastPart = parts[parts.length - 1];
    parts[parts.length - 1] = lastPart.replace(/^\d+-/, "");

    const slug = parts.join("/");
    const href = `/docs/${slug}`;

    return {
      title: data.title,
      description: data.description,
      linkText,
      body,
      href,
      slug,
      lastModified: await lastModificationDate(ctx, data),
    };
  },
});

export default defineConfig({
  collections: [samples, quickstart, docs],
});
