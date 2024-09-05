import Link from "next/link";
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <header id="top">
          <h1>ContentCrafter Inc.</h1>
          <p>
            From Worldly Wonders to Polished Perfection – Crafting Content That
            Captivates and Converts.
          </p>
          <nav>
            <Link href="/">Posts</Link>
          </nav>
        </header>
        <main>
          <Main />
        </main>
        <footer>
          <a href="#top">↑ Back to top</a>
          <p>Copyright © {new Date().getFullYear()} ContentCrafter Inc.</p>
        </footer>
        <NextScript />
      </body>
    </Html>
  );
}
