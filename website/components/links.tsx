import clsx from "clsx";
import NextLink from "next/link";
import { AnchorHTMLAttributes } from "react";

type LinkProps = Parameters<typeof NextLink>[0];

export function Link({ className, children, ...props }: LinkProps) {
  return (
    <NextLink
      className={clsx("hover:decoration-primary-600 underline", className)}
      {...props}
    >
      {children}
    </NextLink>
  );
}

type ExternalLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "rel" | "target"
>;

export function ExternalLink({
  className,
  children,
  ...props
}: ExternalLinkProps) {
  return (
    <a
      className={clsx("hover:decoration-primary-600 underline", className)}
      target="_blank"
      rel="noreferrer"
      {...props}
    >
      {children}
    </a>
  );
}
