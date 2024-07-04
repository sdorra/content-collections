import { allSamples } from "content-collections";
import Link from "next/link";
import { cn } from "@/lib/utils";

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

  return (
    <main className="container py-12">
      <h1 className="font-bold text-3xl mb-4">Templates</h1>
      <p className="text-muted-foreground mb-4">
        Some templates of Content Collections for you to get started.
      </p>

      <div className="flex flex-row gap-1.5 items-center flex-wrap pb-4 mb-8 border-b">
        {Array.from(allTags).map((tag) => {
          const isActive = tags.includes(tag);

          return (
            <Link
              key={tag}
              href={`?${(isActive ? tags.filter((v) => v !== tag) : [...tags, tag]).map((v) => `tag=${v}`).join("&")}`}
              prefetch={false}
              className={cn(
                "px-3 py-1.5 rounded-full bg-card border font-medium text-sm text-muted-foreground",
                isActive && "text-primary-foreground bg-primary",
              )}
            >
              {tag}
            </Link>
          );
        })}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allSamples
          .filter(
            (sample) =>
              tags.length === 0 ||
              tags.some((tag) => sample.tags.includes(tag)),
          )
          .map((sample) => (
            <Link
              key={sample.name}
              href={sample.href}
              className="flex flex-col gap-2 bg-card border rounded-xl p-4 transition-colors hover:bg-accent/80"
            >
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
