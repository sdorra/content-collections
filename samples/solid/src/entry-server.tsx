// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
          {assets}
        </head>
        <body>
          <header id="top">
            <h1>ContentCrafter Inc.</h1>
            <p>
              From Worldly Wonders to Polished Perfection – Crafting Content
              That Captivates and Converts.
            </p>
            <nav>
              <a href="/">Posts</a>
            </nav>
          </header>
          <main id="app">{children}</main>
          <footer>
            <a href="#top">↑ Back to top</a>
            <p>Copyright © {new Date().getFullYear()} ContentCrafter Inc.</p>
          </footer>
          {scripts}
        </body>
      </html>
    )}
  />
));
