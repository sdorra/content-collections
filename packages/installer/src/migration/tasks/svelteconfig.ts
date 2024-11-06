import { existsSync } from "fs";
import fs from "fs/promises";
import { join } from "path";
import * as recast from "recast";
import babelparser from "recast/parsers/babel.js";
import {
  addOrGetObjectProperty,
  findObjectProperty,
  isProperty,
  propertyHasStringValue,
} from "../utils/recast.js";
import { Result, Task } from "./index.js";

const b = recast.types.builders;

function modifyConfig(
  svelteKitConfigPath: string,
  ast: recast.types.namedTypes.ASTNode,
) {
  let result: Result = {
    status: "changed",
    message: `Added content collections alias to ${svelteKitConfigPath}`,
  };

  function modifyConfigObject(
    configObject: recast.types.namedTypes.ObjectExpression,
  ) {
    const kit = addOrGetObjectProperty(configObject, "kit");
    const alias = addOrGetObjectProperty(kit, "alias");
    const existingAlias = findObjectProperty(alias, "content-collections");

    if (existingAlias && isProperty(existingAlias)) {
      if (
        propertyHasStringValue(
          existingAlias,
          "./.content-collections/generated",
        )
      ) {
        result = {
          status: "skipped",
          message: "content-collections alias already exists",
        };
      } else {
        result = {
          status: "error",
          message:
            "content-collections alias already exists with different value",
        };
      }
    } else {
      alias.properties.push(
        b.property(
          "init",
          b.literal("content-collections"),
          b.literal("./.content-collections/generated"),
        ),
      );
    }
  }

  recast.visit(ast, {
    visitExportDefaultDeclaration(path) {
      const declaration = path.node.declaration;
      if (declaration.type === "Identifier") {
        const varName = declaration.name;
        recast.visit(path.scope.getBindings()[varName][0].parentPath, {
          visitVariableDeclarator(varPath) {
            if (
              varPath.node.id.type === "Identifier" &&
              varPath.node.id.name === varName &&
              varPath.node.init &&
              varPath.node.init.type === "ObjectExpression"
            ) {
              modifyConfigObject(varPath.node.init);
            }
            return false;
          },
        });
      } else if (declaration.type === "ObjectExpression") {
        modifyConfigObject(declaration);
      }
      return false;
    },
  });

  return result;
}

export function modifySvelteKitConfig(directory: string): Task {
  return {
    name: "Modify svelte-kit configuration",
    run: async () => {
      const svelteKitConfigPath = join(directory, "svelte.config.js");
      if (!existsSync(svelteKitConfigPath)) {
        return {
          status: "error",
          message: "could not find svelte.config.js",
        };
      }

      const content = await fs.readFile(svelteKitConfigPath, "utf-8");

      const ast = recast.parse(content, {
        parser: babelparser,
      });

      try {
        const result = modifyConfig(svelteKitConfigPath, ast);
        if (result.status === "changed") {
          await fs.writeFile(svelteKitConfigPath, recast.print(ast).code);
        }

        return result;
      } catch (error: any) {
        return {
          status: "error",
          message: error.message,
        };
      }
    },
  };
}
