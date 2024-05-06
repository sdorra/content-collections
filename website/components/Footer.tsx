import { GitHub } from "./icons";

type FooterLinkProps = {
  href: string;
  title: string;
  children: React.ReactNode;
};

function FooterLink({ href, title, children }: FooterLinkProps) {
  return (
    <a
      href={href}
      title={title}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-primary-600"
    >
      {children}
    </a>
  );
}

function XIcon() {
  return (
    <svg className="w-6 h-5" role="img" aria-label="X/Twitter Logo" viewBox="0 0 24 24">
      <path
        className="stroke-current fill-current"
        d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
      />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="flex justify-between px-10 py-5 text-muted-foreground">
      <p>
        Made with ❤️ by{" "}
        <a
          href="https://sdorra.dev"
          target="_blank"
          className="hover:text-base-100 hover:underline hover:decoration-primary-600"
        >
          Sebastian Sdorra
        </a>
      </p>
      <div className="flex gap-2 items-center">
        <FooterLink
          href="https://twitter.com/ssdorra"
          title="X Account of Sebastian Sdorra"
        >
          <XIcon />
        </FooterLink>
        <FooterLink
          href="https://github.com/sdorra/content-collections"
          title="GitHub repository of Content Collections"
        >
          <GitHub />
        </FooterLink>
      </div>
    </footer>
  );
}
