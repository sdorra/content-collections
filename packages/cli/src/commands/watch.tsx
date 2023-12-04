import { applyConfig, createRunner, Modification } from "@mdx-collections/core";
import path from "path";
import chokidar from "chokidar";

const modifications: Record<string, Modification> = {
  add: "added",
  change: "changed",
  unlink: "removed",
};

export default async function watch(configPath: string) {
  console.log("reading configuration", configPath);
  const config = await applyConfig(configPath);

  const baseDirectory = path.dirname(configPath);
  const directory = path.join(baseDirectory, ".mdx-collections", "generated");

  console.log("creating runner", directory);
  const runner = await createRunner(config, directory);

  console.log("start initial build");
  console.time("finished initial build");
  await runner.run();
  console.timeEnd("finished initial build");

  const paths = config.collections.map((collection) => collection.directory);
  paths.push(configPath);

  async function onChange(event: string, path: string) {
    const modification = modifications[event];
    if (modification) {
      console.log(path, "changed recreate collections");
      console.time("finished rebuilding collections");
      await runner.sync(modification, path);
      console.timeEnd("finished rebuilding collections");
    }
  }

  console.log("watching", paths.length, "paths for changes");
  chokidar
    .watch(paths, {
      ignoreInitial: true,
      cwd: baseDirectory,
    })
    .on("all", onChange);
}
