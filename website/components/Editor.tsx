import { cn } from "@/lib/utils";
import { Circle } from "lucide-react";
import { ReactNode } from "react";

type Props = {
  className?: string;
  children?: ReactNode;
};

export function Editor({ className, children }: Props) {
  return (
    <div
      className={cn(
        "dark:border-base-600/50 scrollbar-hide overflow-x-scroll rounded-md border bg-white shadow-md dark:bg-[#24292E] flex flex-col",
        className,
      )}
    >
      <header className="dark:border-b-base-600/50 flex gap-1 rounded-t-md border-b p-2">
        <Circle className="size-3 fill-current text-rose-500" />
        <Circle className="size-3 fill-current text-amber-500" />
        <Circle className="size-3 fill-current text-emerald-500" />
      </header>
      <div className="p-5 grow">{children}</div>
    </div>
  );
}
