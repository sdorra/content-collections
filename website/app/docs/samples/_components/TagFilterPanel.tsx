"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";

type Props = {
  tags: string[];
  allTags: string[];
};

export function TagFilterPanel({ tags, allTags }: Props) {
  const [optimisticTags, setOptimisticTags] = useOptimistic(tags);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="not-prose">
      <p className="text-sm mb-2">Filter by tag:</p>
      <div
        className="flex flex-wrap gap-2"
        data-pending={isPending ? "" : undefined}
      >
        {Array.from(new Set(allTags)).map((tag) => (
          <label
            key={tag}
            className={clsx(
              "border px-4 py-0.5 rounded-full font-semibold cursor-pointer",
              {
                "hover:bg-base-800 hover:text-base-300":
                  !optimisticTags.includes(tag),
                "bg-base-100 text-base-900": optimisticTags.includes(tag),
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
    </div>
  );
}
