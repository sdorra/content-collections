"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNavigation } from "./NavigationContext";

type Props = {
  href: string;
  title: string;
  matcher?: string;
  children: React.ReactNode;
};

export function NavLink({ href, title, matcher, children }: Props) {
  const pathname = usePathname();
  const handleNavigation = useNavigation();

  let isActive = pathname === href;
  if (matcher) {
    isActive = new RegExp(matcher).test(pathname);
  }

  return (
    <li
      title={title}
      className={cn(
        "border-l-2 border-transparent -ml-[2px] hover:border-base-100 pl-2",
        {
          "border-primary-600 hover:border-primary-600 text-base-100 underline decoration-primary-600":
            isActive,
        }
      )}
    >
      <Link
        className="block"
        href={href}
        onClick={() => handleNavigation(href)}
      >
        {children}
      </Link>
    </li>
  );
}
