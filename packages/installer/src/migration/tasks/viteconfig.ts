import { existsSync } from "fs";
import fs from "fs/promises";
import { join } from "path";
import * as recast from "recast";
import tsparser from "recast/parsers/typescript.js";
// we use babel parser for js because it looks like esprisma doesn't support spread elements
// @see https://github.com/benjamn/recast/issues/1154
import babelparser from "recast/parsers/babel.js";
import { Task } from "./index.js";

const b = recast.types.builders;

type ViteConfig = {
  path: string;
  type: "esm" | "ts";
};

async function findViteConfig(directory: string): Promise<ViteConfig | null> {
  let config = join(directory, "vite.config.ts");
  if (existsSync(config)) {
    return { path: config, type: "ts" };
  }

  config = join(directory, "vite.config.js");
  if (existsSync(config)) {
    return { path: config, type: "esm" };
  }

  return null;
}

function findConfigObject(
  node: recast.types.namedTypes.Node,
): recast.types.namedTypes.ObjectExpression | undefined {
  if (recast.types.namedTypes.ObjectExpression.check(node)) {
    return node;
  }

  if (
    recast.types.namedTypes.ArrowFunctionExpression.check(node) ||
    recast.types.namedTypes.FunctionExpression.check(node)
  ) {
    let configObject: recast.types.namedTypes.ObjectExpression | undefined;
    recast.visit(node, {
      visitReturnStatement(path) {
        const { node } = path;
        if (recast.types.namedTypes.ObjectExpression.check(node.argument)) {
          configObject = node.argument;
          return false;
        }
      },
    });

    return configObject;
  }
}

export function modifyViteConfig(directory: string, pkg: string): Task {
  return {
    name: "Modify vite configuration",
    run: async () => {
      const viteConfig = await findViteConfig(directory);
      if (!viteConfig) {
        return {
          status: "error",
          message: "Could not find vite.config.(js|ts) found",
        };
      }

      const content = await fs.readFile(viteConfig.path, "utf-8");

      if (content.includes(`@content-collections/${pkg}`)) {
        return {
          status: "skipped",
          message: `@content-collections/${pkg} already configured`,
        };
      }

      const ast = recast.parse(
        content,
        {
          parser: viteConfig.type === "ts" ? tsparser : babelparser,
        }
      );

      const newImport = recast.parse(
        `import contentCollections from "@content-collections/${pkg}";\n`,
      ).program.body[0];

      // Insert the new import statement at the beginning
      ast.program.body.unshift(newImport);

      let error: string | null = "could not find defineConfig";

      recast.visit(ast, {
        visitCallExpression(path) {
          const { node } = path;

          if (
            node.callee.type === "Identifier" &&
            node.callee.name === "defineConfig"
          ) {
            error = null;

           const firstArgument = node.arguments[0];
            if (!firstArgument) {
              error = "First argument of defineConfig is missing";
              return false;
            }

            const configObject = findConfigObject(firstArgument);
            if (!configObject) {
              error = "First argument of defineConfig is not an ObjectExpression";
              return false;
            }

            let pluginsProperty = configObject.properties.find(
              (prop) =>
                prop.type !== "SpreadElement" && prop.type !== "SpreadProperty"  &&
                prop.key.type === "Identifier" &&
                prop.key.name === "plugins",
            );

            if (!pluginsProperty) {
              // If 'plugins' doesn't exist, create it
              pluginsProperty = b.property(
                "init",
                b.identifier("plugins"),
                b.arrayExpression([]),
              );
              configObject.properties.push(pluginsProperty);
            }

            if (recast.types.namedTypes.ObjectProperty.check(pluginsProperty) || recast.types.namedTypes.Property.check(pluginsProperty)) {
              const value = pluginsProperty.value;
              if (recast.types.namedTypes.ArrayExpression.check(value)) {
                value.elements.push(
                  b.callExpression(b.identifier("contentCollections"), []),
                );
              } else {
                error = "plugins property is not an ArrayExpression";
              }
            } else {
              error = "plugins property is not an ObjectProperty or Property";
            }

            return false; // Stop further traversal
          }

          this.traverse(path);
        },
      });

      if (error) {
        return {
          status: "error",
          message: error,
        };
      }

      // Write the modified code back to the file
      await fs.writeFile(viteConfig.path, recast.print(ast).code);

      return {
        status: "changed",
        message: `Added @content-collections/${pkg} to ${viteConfig.path}`,
      };
    },
  };
}
