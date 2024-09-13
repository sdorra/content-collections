import { BrandIcon } from "@/components/BrandIcon";
import { allSamples } from "content-collections";
import { Callout } from "fumadocs-ui/components/callout";
import Link from "next/link";
import { TagFilterPanel } from "./_components/TagFilterPanel";

const allTags = new Set<string>();

for (const sample of allSamples) {
  for (const tag of sample.tags) {
    allTags.add(tag);
  }
}

export default function Page({
  searchParams,
}: {
  searchParams: {
    tag?: string | string[];
  };
}) {
  const tags =
    typeof searchParams.tag === "string"
      ? [searchParams.tag]
      : (searchParams.tag ?? []);

  const filteredSamples = allSamples.filter((sample) =>
    tags.every((tag) => sample.tags.includes(tag)),
  );

  return (
    <main className="container py-12">
      <h1 className="mb-4 text-3xl font-bold">Samples</h1>
      <p className="text-muted-foreground mb-4">
        Examples which demonstrates the usage of Content Collections.
      </p>

      <TagFilterPanel tags={tags} allTags={allTags} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSamples.length === 0 && (
          <Callout type="warn" className="md:col-span-2">
            <p>No samples found for the selected tag combination.</p>
            <Link href="/docs/samples" className="mt-2 block">
              Clear filters
            </Link>
          </Callout>
        )}
        {filteredSamples.map((sample) => (
          <Link
            key={sample.name}
            href={sample.href}
            className="bg-card hover:bg-accent/80 group relative flex flex-col gap-2 rounded-xl border p-4 transition-colors"
            title={`Tags: ${sample.tags.join(", ")}`}
          >
            <BrandIcon
              icon={sample.adapter}
              className="absolute right-2 top-2 size-4 opacity-50 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
            />
            <p className="font-medium">{sample.title}</p>
            <p className="text-muted-foreground text-sm">
              {sample.description}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
