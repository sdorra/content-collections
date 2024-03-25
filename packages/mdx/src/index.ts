import { Context, Meta } from "@content-collections/core";
import { Pluggable, Transformer } from "unified";
import { valueToEstree } from "estree-util-value-to-estree";
import { bundleMDX } from "mdx-bundler";
import fs from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { Root } from "mdast";
import "mdast-util-mdx";

type Document = {
  _meta: Meta;
  content: string;
};

type FileAppender = ReturnType<typeof createFileAppender>;

export type Options = {
  cwd?: string;
  files?: (appender: FileAppender) => void;
  remarkPlugins?: Pluggable[];
  rehypePlugins?: Pluggable[];
};

async function appendFile(
  files: Record<string, string>,
  importPath: string,
  filePath: string
) {
  files[importPath] = await fs.readFile(filePath, "utf-8");
}

async function appendDirectory(
  files: Record<string, string>,
  importPathPrefix: string,
  directoryPath: string
) {
  if (!existsSync(directoryPath)) {
    return;
  }
  const fileNames = await fs.readdir(directoryPath);
  for (const fileName of fileNames) {
    const filePath = path.join(directoryPath, fileName);
    const { name } = path.parse(filePath);
    files[`${importPathPrefix}/${name}`] = await fs.readFile(filePath, "utf-8");
  }
}

function createFileAppender(
  tasks: Promise<void>[],
  files: Record<string, string>
) {
  return {
    content: (importPath: string, content: string) => {
      files[importPath] = content;
    },
    file: (importPath: string, filePath: string) => {
      tasks.push(appendFile(files, importPath, filePath));
    },
    directory: (importPath: string, directoryPath: string) => {
      tasks.push(appendDirectory(files, importPath, directoryPath));
    },
  };
}

async function createFiles(options: Options): Promise<Record<string, string>> {
  const files: Record<string, string> = {};
  if (options.files) {
    const tasks: Promise<void>[] = [];
    const appender = createFileAppender(tasks, files);
    options.files(appender);
    await Promise.all(tasks);
  }
  return files;
}

function addMetaToVFile(_meta: Meta): Pluggable {
  return (): Transformer => (_, vFile) => {
    Object.assign(vFile.data, { _meta });
  };
}

function defineDocument(document: Document): Pluggable {
  return (): Transformer<Root> => (ast) => {
    ast.children.unshift({
      type: "mdxjsEsm",
      value: "",
      data: {
        estree: {
          type: "Program",
          sourceType: "module",
          body: [
            {
              type: "ExportNamedDeclaration",
              specifiers: [],
              declaration: {
                type: "VariableDeclaration",
                kind: "const",
                declarations: [
                  {
                    type: "VariableDeclarator",
                    id: { type: "Identifier", name: "_document" },
                    init: valueToEstree(document),
                  },
                ],
              },
            },
          ],
        },
      },
    });
  };
}

async function compile(document: Document, options: Options = {}) {
  const files = await createFiles(options);

  const { code } = await bundleMDX({
    source: document.content,
    cwd: options.cwd,
    files,

    mdxOptions(mdxOptions) {
      mdxOptions.rehypePlugins = [...(options.rehypePlugins ?? [])];

      mdxOptions.remarkPlugins = [
        addMetaToVFile(document._meta),
        defineDocument(document),
        ...(options.remarkPlugins ?? []),
      ];

      return mdxOptions;
    },
  });
  return code;
}

export function compileMDX(
  { cache }: Pick<Context, "cache">,
  document: Document,
  options?: Options
) {
  return cache(document, (doc) => compile(doc, options));
}
