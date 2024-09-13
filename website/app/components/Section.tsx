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
    <section className={cn("relative p-5 sm:p-10", className)}>
      {backgroundGrid ? <BackgroundGrid /> : null}
      {children}
    </section>
  );
}

export function Content({ className, children }: Props) {
  return (
    <div className={cn("relative mx-auto max-w-5xl", className)}>
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
        "text-foreground mb-6 flex items-center text-4xl font-bold",
        {
          "md:justify-center": center,
        },
        className,
      )}
    >
      <CheckCircle2 className="text-primary-600 mr-2 inline-block size-8 flex-shrink-0" />
      <span>{children}</span>
    </h2>
  );
}

function BackgroundGrid() {
  return (
    <svg
      aria-hidden="true"
      className="text-base-500/30 dark:text-base-500/40 absolute inset-0 h-full w-full [mask-image:radial-gradient(black,transparent)]"
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
