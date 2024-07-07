"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";

type Props = {
  tags: string[];
  allTags: Set<string>;
};

export function TagFilterPanel({ tags, allTags }: Props) {
  const [optimisticTags, setOptimisticTags] = useOptimistic(tags);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  console.log({tags});

  return (
    <div className="flex flex-row gap-1.5 items-center flex-wrap pb-4 mb-8 border-b">
      {Array.from(new Set(allTags)).map((tag) => (
        <label
          key={tag}
          className={clsx(
            "px-3 py-1.5 rounded-full bg-card border font-medium text-sm text-muted-foreground cursor-pointer",
            {
              "hover:bg-base-100 hover:border-primary-300 dark:hover:bg-base-800":
                !optimisticTags.includes(tag),
              "text-primary-foreground bg-primary":
                optimisticTags.includes(tag),
            }
          )}
        >
          <input
            type="checkbox"
            name={tag}
            className="hidden"
            checked={optimisticTags.includes(tag)}
            onChange={(e) => {
              let { name, checked } = e.target;
              let newTags = checked
                ? [...optimisticTags, name]
                : optimisticTags.filter((tag) => tag !== name);

              let newParams = new URLSearchParams(
                newTags.map((t) => ["tag", t])
              );

              startTransition(() => {
                setOptimisticTags(newTags);
                router.push(`?${newParams}`);
              });
            }}
          />
          {tag}
        </label>
      ))}
    </div>
  );
}
