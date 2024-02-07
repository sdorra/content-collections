"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  href: string;
  title: string;
  children: React.ReactNode;
};

export function NavLink({ href, title, children }: Props) {
  const pathname = usePathname();
  const isActive = pathname === href;
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
      <Link className="block" href={href}>
        {children}
      </Link>
    </li>
  );
}
