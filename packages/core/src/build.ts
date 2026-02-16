import { createCacheManager } from "./cache";
import { createCollector } from "./collector";
import { InternalConfiguration } from "./configurationReader";
import { isSingleton } from "./config";
import { Emitter } from "./events";
import { createSynchronizer } from "./synchronizer";
import { createTransformer } from "./transformer";
import { isDefined } from "./utils";
import { createWriter } from "./writer";

type Dependencies = {
  emitter: Emitter;
  outputDirectory: string;
  cacheDirectory: string;
  baseDirectory: string;
  configuration: InternalConfiguration;
};

export type BuildEvents = {
  "builder:start": {
    startedAt: number;
  };
  "builder:end": {
    startedAt: number;
    endedAt: number;
    stats: {
      collections: number;
      documents: number;
    };
  };
};

export async function createBuildContext({
  emitter,
  outputDirectory,
  cacheDirectory,
  baseDirectory,
  configuration,
}: Dependencies) {
  const collector = createCollector(emitter, baseDirectory);

  const [writer, resolved, cacheManager] = await Promise.all([
    createWriter(outputDirectory),
    collector.collect(configuration.collections),
    createCacheManager(cacheDirectory, configuration.checksum),
  ]);

  const synchronizer = createSynchronizer(
    collector.collectFile,
    resolved,
    baseDirectory,
  );

  const transform = createTransformer(emitter, cacheManager);
  return {
    resolved,
    writer,
    synchronizer,
    transform,
    emitter,
    cacheManager,
    configuration,
  };
}

export type BuildContext = Awaited<ReturnType<typeof createBuildContext>>;

export async function build({
  emitter,
  transform,
  resolved,
  writer,
  configuration,
}: BuildContext) {
  const startedAt = Date.now();
  emitter.emit("builder:start", {
    startedAt,
  });

  const collections = await transform(resolved);
  await Promise.all([
    writer.createDataFiles(collections),
    writer.createTypeDefinitionFile(configuration),
    writer.createJavaScriptFile(configuration),
  ]);

  const pendingOnSuccess = collections
    .filter((collection) => Boolean(collection.onSuccess))
    .map((collection) =>
      isSingleton(collection)
        ? (collection as any).onSuccess?.(collection.documents[0]?.document)
        : (collection as any).onSuccess?.(collection.documents.map((doc) => doc.document)),
    );

  await Promise.all(pendingOnSuccess.filter(isDefined));

  const stats = collections.reduce(
    (acc, collection) => {
      acc.collections++;
      acc.documents += collection.documents.length;
      return acc;
    },
    {
      collections: 0,
      documents: 0,
    },
  );

  emitter.emit("builder:end", {
    startedAt,
    endedAt: Date.now(),
    stats,
  });
}
