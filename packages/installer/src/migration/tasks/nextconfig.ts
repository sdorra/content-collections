import { existsSync } from "fs";
import fs from "fs/promises";
import { join } from "path";
import * as recast from "recast";

// @ts-expect-error - No types available
import tsparser from "recast/parsers/typescript";
import { Task } from "./index.js";

type NextConfig = {
  path: string;
  type: "cjs" | "esm" | "ts";
};

async function findNextConfig(directory: string): Promise<NextConfig> {
  let config = join(directory, "next.config.js");
  if (existsSync(config)) {
    return { path: config, type: "cjs" };
  }

  config = join(directory, "next.config.mjs");
  if (existsSync(config)) {
    return { path: config, type: "esm" };
  }

  config = join(directory, "next.config.ts");
  if (existsSync(config)) {
    return { path: config, type: "ts" };
  }

  throw new Error("next.config.(js|mjs|ts) not found");
}

function modifyCjsNextConfig(content: string) {
  const ast = recast.parse(content);

  const newImport = recast.parse(
    'const { withContentCollections } = require("@content-collections/next");\n',
  ).program.body[0];

  // Insert the new import statement at the beginning
  ast.program.body.unshift(newImport);

  // Find the module.exports assignment
  const moduleExports = ast.program.body.find(
    (node: any) =>
      node.type === "ExpressionStatement" &&
      node.expression.type === "AssignmentExpression" &&
      node.expression.left.type === "MemberExpression" &&
      node.expression.left.object.type === "Identifier" &&
      node.expression.left.object.name === "module" &&
      node.expression.left.property.type === "Identifier" &&
      node.expression.left.property.name === "exports",
  );

  // Add withContentCollections to the module.exports assignment
  moduleExports.expression.right = {
    type: "CallExpression",
    callee: {
      type: "Identifier",
      name: "withContentCollections",
    },
    arguments: [
      {
        type: "Identifier",
        name: "nextConfig",
      },
    ],
  };

  return recast.print(ast).code;
}

function modifyEsmNextConfig(content: string, options: Partial<recast.Options> = {}) {
  const ast = recast.parse(content, options);

  const newImport = recast.parse(
    'import { withContentCollections } from "@content-collections/next";\n',
  ).program.body[0];

  // Insert the new import statement at the beginning
  ast.program.body.unshift(newImport);

  const exportDefault = ast.program.body.find(
    (node: any) =>
      node.type === "ExportDefaultDeclaration" &&
      node.declaration.type === "Identifier",
  );

  // Replace the export default statement with withContentCollections
  exportDefault.declaration = {
    type: "CallExpression",
    callee: {
      type: "Identifier",
      name: "withContentCollections",
    },
    arguments: [
      {
        type: "Identifier",
        name: "nextConfig",
      },
    ],
  };


  return recast.print(ast).code;
}

const modifiers = {
  cjs: modifyCjsNextConfig,
  esm: modifyEsmNextConfig,
  ts: (content: string) => modifyEsmNextConfig(content, { parser: tsparser }),
};

export async function modifyNextConfig(directory: string): Promise<Task> {
  const nextConfig = await findNextConfig(directory);

  return {
    name: "Modify next.config.js",
    run: async () => {
      const content = await fs.readFile(nextConfig.path, "utf-8");

      if (content.includes("@content-collections/next")) {
        return false;
      }

      const modifiedCode = modifiers[nextConfig.type](content);

      // Write the modified code back to the file
      await fs.writeFile(nextConfig.path, modifiedCode);

      return true;
    },
  };
}
