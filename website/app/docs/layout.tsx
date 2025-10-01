import { baseOptions } from "@/app/layout.config";
import { pageTree } from "@/app/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DocsLayout
      tree={pageTree}
      {...baseOptions}
      sidebar={{ defaultOpenLevel: 0 }}
    >
      {children}
    </DocsLayout>
  );
}
