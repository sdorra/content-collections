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
        "bg-[#282C34] rounded-md shadow-md border border-base-600/50 overflow-x-scroll scrollbar-hide",
        className
      )}
    >
      <header className="border-b border-b-base-600/50 flex gap-1 rounded-t-md p-2">
        <Circle className="text-rose-500 fill-current size-3" />
        <Circle className="text-amber-500 fill-current size-3" />
        <Circle className="text-emerald-500 fill-current size-3" />
      </header>
      <div className="p-5">{children}</div>
    </div>
  );
}
