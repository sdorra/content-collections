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
    <li title={title} className={cn("border-l-2 border-transparent -ml-[2px] hover:border-slate-100 pl-2", {
      "border-primary hover:border-primary text-slate-100 underline decoration-primary": isActive,
    })}>
      <Link className="block" href={href}>
        {children}
      </Link>
    </li>
  );
}
