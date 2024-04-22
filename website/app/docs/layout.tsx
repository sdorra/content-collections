import { Doc } from "content-collections";
import { NavLink } from "./components/NavLink";
import { NavSection } from "./components/NavSection";
import { docsTree, isLeadNode } from "@/lib/tree";
import { SheetContent, SheetTrigger } from "@/components/Sheet";
import { Main } from "@/components/Main";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Menu } from "lucide-react";
import { NavigationSheet } from "./components/NavigationSheet";

type Props = {
  children: React.ReactNode;
};

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

function Navigation() {
  return (
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
  );
}

export default function DocLayout({ children }: Props) {
  return (
    <>
      <Header>
        <NavigationSheet>
          <SheetTrigger asChild>
            <button className="md:hidden hover:text-base-100">
              <Menu />
            </button>
          </SheetTrigger>
          <SheetContent side="left">
            <Navigation />
          </SheetContent>
        </NavigationSheet>
      </Header>
      <Main className="flex w-full mx-auto max-w-5xl">
        <aside className="w-42 text-nowrap pl-10 hidden md:block">
          <Navigation />
        </aside>
        {children}
      </Main>
      <Footer />
    </>
  );
}
