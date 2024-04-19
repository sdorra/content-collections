import { Doc, allDocs } from "content-collections";
import { NavLink } from "./components/NavLink";
import { NavSection } from "./components/NavSection";
import { docsTree, isLeadNode } from "@/lib/tree";

type Props = {
  children: React.ReactNode;
};

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

export default function DocLayout({ children }: Props) {
  return (
    <div className="flex flex-col-reverse sm:flex-row w-full mx-auto max-w-5xl">
      <aside className="w-42 text-nowrap pl-10">
        <nav>
          <NavSection title="Docs">
            {docsTree.children
              .filter(isLeadNode)
              .map((node) => node.data)
              .filter(isDefined)
              .map((doc: Doc) => (
                <NavLink key={doc.slug} title={doc.title} href={doc.href}>
                  {doc.linkText}
                </NavLink>
              ))}
          </NavSection>
          {docsTree.children
            .filter((node) => !isLeadNode(node))
            .map((node) => (
              <NavSection key={node.name} title={node.name}>
                {node.children
                  .filter(isLeadNode)
                  .map((node) => node.data)
                  .filter(isDefined)
                  .map((doc: Doc) => (
                    <NavLink key={doc.slug} title={doc.title} href={doc.href}>
                      {doc.linkText}
                    </NavLink>
                  ))}
              </NavSection>
            ))}
        </nav>
      </aside>
      {children}
    </div>
  );
}
