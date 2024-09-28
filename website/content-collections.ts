import {
  type Context,
  defineCollection,
  defineConfig,
  type Document,
} from "@content-collections/core";
import {
  createMetaSchema,
  transformMDX,
} from "@fumadocs/content-collections/configuration";
import { remarkInstall, type RemarkInstallOptions } from "fumadocs-docgen";
import GithubSlugger from "github-slugger";
import { Root } from "hast";
import { selectAll } from "hast-util-select";
import { exec as cpExec } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

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
        document._meta.filePath,
      );

      const { stdout } = await exec(`git log -1 --format=%ai -- ${filePath}`);
      if (stdout) {
        return new Date(stdout.trim()).toISOString();
      }
      return new Date().toISOString();
    },
  );
}

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
    const { body, structuredData } = await transformMDX(data, ctx);
    const href = `/samples/${data._meta.directory}`;
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
      structuredData,
    };
  },
});

const docs = defineCollection({
  name: "docs",
  directory: "../docs",
  include: "**/*.mdx",
  schema: (z) => ({
    title: z.string(),
    description: z.string().optional(),
    icon: z.string().optional(),
    linkText: z.string().optional(),
    full: z.boolean().optional(),
  }),
  transform: async (data, ctx) => {
    // Fumadocs used a remark plugin to obtain data from `vfile`
    // If the result is cached, the remark plugin won't be executed again
    // and some fields will be missing.
    //
    // We cache the output directly to avoid this problem
    const out = await ctx.cache(data, (input) =>
      transformMDX(
        input,
        // avoid nested caching
        { ...ctx, cache: async (input, fn) => fn(input) },
        {
          remarkPlugins: [
            [
              remarkInstall,
              {
                Tabs: "InstallTabs",
              } satisfies RemarkInstallOptions,
            ],
          ],
          rehypePlugins: [liCodeSlug],
        },
      ),
    );

    return {
      lastModified: await lastModificationDate(ctx, data),
      ...out,
    };
  },
});

const metas = defineCollection({
  name: "meta",
  directory: "../docs",
  include: "**/*.json",
  schema: createMetaSchema,
  parser: "json",
});

export default defineConfig({
  collections: [samples, docs, metas],
});
