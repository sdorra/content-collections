import { cn } from "@/lib/utils";
import Link from "next/link";

export function GettingStartedButton() {
  return (
    <Link
      href="/docs"
      className={cn(
        "inline-flex relative group justify-between items-center transition-colors h-12 bg-primary-500 hover:bg-primary-600 rounded-full px-6 gap-1 text-primary-950 font-semibold",
        "focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-offset-base-800 focus-visible:ring-offset-2 focus-visible:ring-primary-500"
      )}
    >
      <span>Getting Started</span>
      <svg className="overflow-visible size-5" viewBox="0 0 100 100">
        <polyline
          className="stroke-current duration-300 transition-transform group-hover:translate-x-3"
          strokeWidth="14"
          fill="none"
          points="40,20 85,50 40,80"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <polyline
          className="stroke-current duration-500 transition-opacity fill-none opacity-0 group-hover:opacity-100"
          strokeWidth="14"
          strokeLinejoin="round"
          strokeLinecap="round"
          points="20,50 90,50"
        />
      </svg>
    </Link>
  );
}
