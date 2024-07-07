import { allSamples } from "content-collections";
import Link from "next/link";
import { TagFilterPanel } from "./_components/TagFilterPanel";
import { BrandIcon } from "@/components/BrandIcon";
import { Callout } from "fumadocs-ui/components/callout";

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
      : searchParams.tag ?? [];

  const filteredSamples = allSamples.filter((sample) =>
    tags.every((tag) => sample.tags.includes(tag))
  );

  return (
    <main className="container py-12">
      <h1 className="font-bold text-3xl mb-4">Samples</h1>
      <p className="text-muted-foreground mb-4">
        Examples which demonstrates the usage of Content Collections.
      </p>

      <TagFilterPanel tags={tags} allTags={allTags} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSamples.length === 0 && (
          <Callout type="warn" className="md:col-span-2">
            <p>No samples found for the selected tag combination.</p>
            <Link href="/docs/samples" className="block mt-2">
              Clear filters
            </Link>
          </Callout>
        )}
        {filteredSamples.map((sample) => (
          <Link
            key={sample.name}
            href={sample.href}
            className="flex flex-col gap-2 bg-card border rounded-xl p-4 transition-colors hover:bg-accent/80 relative group"
            title={`Tags: ${sample.tags.join(", ")}`}
          >
            <BrandIcon
              icon={sample.adapter}
              className="absolute size-4 top-2 right-2 grayscale group-hover:grayscale-0 opacity-50 group-hover:opacity-100 transition-all duration-300"
            />
            <p className="font-medium">{sample.title}</p>
            <p className="text-sm text-muted-foreground">
              {sample.description}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
