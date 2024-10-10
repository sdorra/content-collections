import { existsSync } from "fs";
import fs from "fs/promises";
import { join } from "path";
import * as recast from "recast";
import tsparser from "recast/parsers/typescript.js";
import { Task } from "./index.js";

type NextConfig = {
  path: string;
  type: "cjs" | "esm" | "ts";
};

async function findNextConfig(directory: string): Promise<NextConfig | null> {
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

  return null;
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

function modifyEsmNextConfig(
  content: string,
  options: Partial<recast.Options> = {},
) {
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

export function modifyNextConfig(directory: string): Task {
  return {
    name: "Modify next configuration",
    run: async () => {
      const nextConfig = await findNextConfig(directory);
      if (!nextConfig) {
        return {
          status: "error",
          message: "Could not find next.config.(mjs|js|ts) found",
        };
      }

      const content = await fs.readFile(nextConfig.path, "utf-8");

      if (content.includes("@content-collections/next")) {
        return {
          status: "skipped",
          message: "@content-collections/next already configured",
        };
      }

      const modifiedCode = modifiers[nextConfig.type](content);

      // Write the modified code back to the file
      await fs.writeFile(nextConfig.path, modifiedCode);

      return {
        status: "changed",
        message: `Added @content-collections/next to ${nextConfig.path}`,
      };
    },
  };
}
