import { defineCollection, applyConfig, Configuration } from "./config";
import { run } from "./run";

export async function build(config: string) {
  const configuration = await applyConfig(config);
  await run(configuration);
}

export { defineCollection, type Configuration };
export type { GetTypeByName } from "./types";
