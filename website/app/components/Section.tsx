import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { ReactNode } from "react";

type Props = {
  className?: string;
  children: ReactNode;
};

type SectionProps = Props & {
  backgroundGrid?: boolean;
};

export function Section({ backgroundGrid, className, children }: SectionProps) {
  return (
    <section className={cn("p-5 sm:p-10 relative", className)}>
      {backgroundGrid ? <BackgroundGrid /> : null}
      {children}
    </section>
  );
}

export function Content({ className, children }: Props) {
  return (
    <div className={cn("relative max-w-5xl mx-auto", className)}>
      {children}
    </div>
  );
}

type TitleProps = Props & {
  center?: boolean;
};

export function Title({ center, className, children }: TitleProps) {
  return (
    <h2
      className={cn(
        "text-4xl font-bold mb-6 flex items-center text-foreground",
        {
          "md:justify-center": center,
        },
        className
      )}
    >
      <CheckCircle2 className="inline-block mr-2 size-8 text-primary-600 flex-shrink-0" />
      <span>{children}</span>
    </h2>
  );
}

function BackgroundGrid() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full text-base-500/30 dark:text-base-500/40 [mask-image:radial-gradient(black,transparent)]"
    >
      <defs>
        <pattern
          id="rectangles"
          width="64"
          height="64"
          patternUnits="userSpaceOnUse"
          x="50%"
          patternTransform="translate(0 80)"
        >
          <path d="M0 128V.5H128" fill="none" stroke="currentColor"></path>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#rectangles)"></rect>
    </svg>
  );
}
