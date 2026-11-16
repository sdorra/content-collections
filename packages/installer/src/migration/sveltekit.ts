import { existsSync } from "fs";
import { join } from "path";
import type { PackageJson } from "src/packageJson.js";
import { z } from "zod";
import { defineMigrator } from "./migrator.js";
import { createConfiguration } from "./tasks/config.js";
import { createDemoContent } from "./tasks/demo.js";
import { addDependencies } from "./tasks/dependencies.js";
import { addToGitIgnore } from "./tasks/gitignore.js";
import { addSubpathImport } from "./tasks/packageimports.js";
import { modifySvelteKitConfig } from "./tasks/svelteconfig.js";
import { modifyViteConfig } from "./tasks/viteconfig.js";

function getSvelteKitMajor(packageJson: PackageJson) {
  const range =
    packageJson.dependencies?.["@sveltejs/kit"] ??
    packageJson.devDependencies?.["@sveltejs/kit"];
  const major = range?.match(/^[\^~>=v\s]*(\d+)/)?.[1];
  return major ? Number(major) : undefined;
}

// SvelteKit 3 no longer reads svelte.config.js and deprecates aliases
// in favour of subpath imports
function usesSubpathImports(directory: string, packageJson: PackageJson) {
  const major = getSvelteKitMajor(packageJson);
  if (major !== undefined && major >= 3) {
    return true;
  }
  return !existsSync(join(directory, "svelte.config.js"));
}

export const migratorSvelteKit = defineMigrator({
  name: "sveltekit",
  options: z.object({
    demoContent: z
      .enum(["none", "markdown"])
      .default("markdown")
      .describe("Type of demo content"),
  }),
  isResponsible: (packageJson) =>
    Boolean(packageJson.dependencies?.["@sveltejs/kit"]) ||
    Boolean(packageJson.devDependencies?.["@sveltejs/kit"]),
  async createMigration({ directory, packageJson }, { demoContent }) {
    const packages = [
      "@content-collections/core",
      "@content-collections/vite",
      "zod",
    ];

    if (demoContent === "markdown") {
      packages.push("@content-collections/markdown");
    }

    const tasks = [
      addDependencies(directory, packageJson, [], packages),
      usesSubpathImports(directory, packageJson)
        ? addSubpathImport(directory)
        : modifySvelteKitConfig(directory),
      modifyViteConfig(directory, "vite"),
      addToGitIgnore(directory),
      createConfiguration(directory, demoContent),
    ];

    if (demoContent !== "none") {
      tasks.push(createDemoContent(directory, demoContent));
    }

    return tasks;
  },
});
