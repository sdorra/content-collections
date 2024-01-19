import { BrandIcon } from "@/components/BrandIcon";
import { allIntegrations } from "content-collections";
import Link from "next/link";

export default function DocsRoot() {
  return (
    <div className="w-full pl-10">
      <div className="prose prose-slate prose-invert">
        <h1>Getting started</h1>
        <p>
          Content Collection support most of the major web frameworks. <br />
          Choose the one you are using to get started.
        </p>
      </div>
      <ul className="grid grid-cols-3 gap-10 mt-10 mx-auto max-w-lg">
        {allIntegrations.map((doc) => (
          <li key={doc.href}>
            <a
              href={doc.href}
              className="flex flex-col justify-center items-center hover:text-primary gap-2"
              title={doc.description}
            >
              <BrandIcon icon={doc.icon || doc.name} className="w-20 h-10" />
              <h3>{doc.linkText}</h3>
            </a>
          </li>
        ))}
      </ul>
      <div className="prose prose-slate prose-invert mt-10">
        <p>
          If your framework is not listed, you can still use Content Collections
          by using the{" "}
          <Link
            className="hover:decoration-primary"
            href="/docs/integration/cli"
          >
            CLI
          </Link>
          . Please open a{" "}
          <a href="https://github.com/sdorra/content-collections/issues">
            ticket
          </a>{" "}
          if you want to see your framework listed.
        </p>
      </div>
    </div>
  );
}
