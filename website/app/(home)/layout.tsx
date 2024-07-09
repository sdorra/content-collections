import type { ReactNode } from "react";
import { Layout as HomeLayout } from "fumadocs-ui/layout";
import { baseOptions } from "@/app/layout.config";

export default function Layout({ children }: { children: ReactNode }) {
  return <HomeLayout {...baseOptions}>{children}</HomeLayout>;
}
