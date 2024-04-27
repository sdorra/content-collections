import { BrandIcon } from "@/components/BrandIcon";
import { DocContainer } from "@/components/DocContainer";
import { ExternalLink, Link } from "@/components/links";
import { allQuickstarts } from "content-collections";

export default function DocsRoot() {
  return (
    <DocContainer>
      <h1>Getting started</h1>
      <p>
        Content Collection support most of the major web frameworks. <br />
        Choose the one you are using to get started.
      </p>
      <ul className="not-prose grid grid-cols-3 gap-10 mt-10 mx-auto max-w-lg">
        {allQuickstarts.map((doc) => (
          <li key={doc.href}>
            <a
              href={doc.href}
              className="flex flex-col justify-center items-center hover:text-primary-600 gap-2"
              title={doc.description}
            >
              <BrandIcon icon={doc.icon || doc.name} className="w-20 h-10" />
              <h3>{doc.linkText}</h3>
            </a>
          </li>
        ))}
      </ul>
      <p>
        If your framework is not listed, you can still use Content Collections
        by using the <Link href="/docs/integrations/cli">CLI</Link>. Please open
        a{" "}
        <ExternalLink href="https://github.com/sdorra/content-collections/issues">
          ticket
        </ExternalLink>{" "}
        if you want to see your framework listed.
      </p>
    </DocContainer>
  );
}
