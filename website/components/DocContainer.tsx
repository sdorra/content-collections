import clsx from "clsx";
import { ReactNode } from "react";

type Props = {
  className?: string;
  children: ReactNode;
};

export function DocContainer({ className, children }: Props) {
  return (
    <article
      className={clsx(
        "prose prose-base prose-code:text-base hover:prose-a:decoration-primary-600 max-w-3xl prose-invert py-5 px-5 sm:px-10",
        className
      )}
    >
      {children}
    </article>
  );
}
