/// <reference types="vite/client" />
import appCss from "@content-collections/sample-theme/sample.css?url";
import type { ReactNode } from 'react'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
  Link,
} from '@tanstack/react-router'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <header id="top">
          <h1>ContentCrafter Inc.</h1>
          <p>
            From Worldly Wonders to Polished Perfection – Crafting Content That
            Captivates and Converts.
          </p>
          <nav>
            <Link to="/">Posts</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          <a href="#top">↑ Back to top</a>
          <p>Copyright © {new Date().getFullYear()} ContentCrafter Inc.</p>
        </footer>
        <Scripts />
      </body>
    </html>
  );
}
