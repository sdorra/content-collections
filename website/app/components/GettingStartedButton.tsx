import { cn } from "@/lib/utils";
import Link from "next/link";

export function GettingStartedButton() {
  return (
    <Link
      href="/docs"
      className={cn(
        "bg-primary-500 hover:bg-primary-600 text-primary-950 group relative inline-flex h-12 items-center justify-between gap-1 rounded-full px-6 font-semibold transition-colors",
        "focus-visible:ring-offset-base-800 focus-visible:ring-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      )}
    >
      <span>Getting Started</span>
      <svg className="size-5 overflow-visible" viewBox="0 0 100 100">
        <polyline
          className="stroke-current transition-transform duration-300 group-hover:translate-x-3"
          strokeWidth="14"
          fill="none"
          points="40,20 85,50 40,80"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <polyline
          className="fill-none stroke-current opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          strokeWidth="14"
          strokeLinejoin="round"
          strokeLinecap="round"
          points="20,50 90,50"
        />
      </svg>
    </Link>
  );
}
