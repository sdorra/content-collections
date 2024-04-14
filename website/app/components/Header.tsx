import Link from "next/link";

type ExternalLinkProps = {
  href: string;
  title?: string;
  className?: string;
  children: React.ReactNode;
};

function ExternalLink({ href, title, className, children }: ExternalLinkProps) {
  return (
    <a
      href={href}
      title={title}
      className={className}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
}

type LinkCmp = typeof ExternalLink | typeof Link;

function createLinkCmp(href: string): LinkCmp {
  if (href.includes("://")) {
    return ExternalLink;
  }
  return Link;
}

type NavLinkProps = {
  href: string;
  title?: string;
  children: React.ReactNode;
};

function NavLink({ href, title, children }: NavLinkProps) {
  const LinkCmp = createLinkCmp(href);
  return (
    <li>
      <LinkCmp
        href={href}
        title={title}
        className="relative hover:text-white after:h-0.5 after:absolute after:bottom-0 after:bg-primary-600 after:left-0 after:w-0 after:transition-all after:hover:w-full"
      >
        {children}
      </LinkCmp>
    </li>
  );
}

export function Header() {
  return (
    <header>
      <nav className="px-4 py-2 max-w-5xl mx-auto">
        <ul className="flex gap-4 justify-end font-semibold">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/docs" title="Documentation">
            Docs
          </NavLink>
          <NavLink
            href="https://github.com/sdorra/content-collections"
            title="GitHub repository of Content Collections"
          >
            GitHub
          </NavLink>
        </ul>
      </nav>
    </header>
  );
}
