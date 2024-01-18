import {
  allDocs,
  allIntgrations,
  allSamples,
} from "@/.content-collections/generated";
import { NavLink } from "./components/NavLink";
import { NavSection } from "./components/NavSection";

type Props = {
  children: React.ReactNode;
};

export default function DocLayout({ children }: Props) {
  return (
    <div className="flex flex-col-reverse sm:flex-row w-full">
      <aside className="w-42 text-nowrap pl-10">
        <nav>
          <NavSection title="Guides">
            {allDocs
              .filter((d) => d._meta.directory === "guides")
              .map((doc) => (
                <NavLink
                  title={doc.title}
                  key={doc._meta.path}
                  href={`/docs/${doc._meta.path}`}
                >
                  {doc.title}
                </NavLink>
              ))}
          </NavSection>
          <NavSection title="Integrations">
            {allIntgrations.map((doc) => (
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
