import clsx from "clsx";
import { ReactNode } from "react";

type Props = {
  className?: string;
  children: ReactNode;
};

export function Main({ className, children }: Props) {
  return <main className={clsx("mt-10 flex-grow", className)}>{children}</main>;
}
