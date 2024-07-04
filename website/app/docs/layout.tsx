import { DocsLayout } from "fumadocs-ui/layout";
import { pageTree } from "@/app/source";
import { baseOptions } from "@/app/layout.config";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DocsLayout
      tree={pageTree}
      {...baseOptions}
      sidebar={{ defaultOpenLevel: 0, collapsible: false }}
    >
      {children}
    </DocsLayout>
  );
}
