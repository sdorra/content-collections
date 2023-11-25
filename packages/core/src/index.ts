import path from "path";
import { applyConfig } from "./applyConfig";
import { run } from "./run";

export async function build(config: string) {
  const configuration = await applyConfig(config);
  const baseDirectory = path.dirname(config);
  const directory = path.join(baseDirectory, ".mdx-collections", "generated");
  await run(configuration, directory);
}

export * from "./config";
export type { GetTypeByName } from "./types";
