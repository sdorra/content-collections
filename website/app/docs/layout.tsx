import { allIntegrations, allSamples } from "@/.content-collections/generated";
import { NavLink } from "./[category]/[page]/components/NavLink";
import { NavSection } from "./[category]/[page]/components/NavSection";

type Props = {
  children: React.ReactNode;
};

export default function DocLayout({ children }: Props) {
  return (
    <div className="flex flex-col-reverse sm:flex-row w-full">
      <aside className="w-42 text-nowrap pl-10">
        <nav>
          <NavSection title="Docs">
            <NavLink title="Getting started" href="/docs">
              Getting started
            </NavLink>
          </NavSection>
          <NavSection title="Integrations">
            {allIntegrations.map((doc) => (
              <NavLink title={doc.title} key={doc.href} href={doc.href}>
                {doc.linkText}
              </NavLink>
            ))}
          </NavSection>
          <NavSection title="Samples">
            {allSamples.map((doc) => (
              <NavLink title={doc.title} key={doc.href} href={doc.href}>
                {doc.linkText}
              </NavLink>
            ))}
          </NavSection>
        </nav>
      </aside>
      {children}
    </div>
  );
}
