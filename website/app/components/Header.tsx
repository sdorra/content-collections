import Link from "next/link";

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
};

function NavLink({ href, children }: NavLinkProps) {
  return (
    <li>
      <Link
        href={href}
        className="relative after:h-0.5 after:absolute after:bottom-0 after:bg-primary after:left-0 after:w-0 after:transition-all after:hover:w-full"
      >
        {children}
      </Link>
    </li>
  );
}

export function Header() {
  return (
    <header>
      <nav className="px-4 py-2">
        <ul className="flex gap-4 justify-end font-semibold">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/docs/guides/getting-started">Docs</NavLink>
        </ul>
      </nav>
    </header>
  );
}
