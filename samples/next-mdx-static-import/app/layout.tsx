import type { Metadata } from "next";
import "@content-collections/sample-theme/sample.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Content Collections",
  description: "Using Content Collections with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
        <main>{children}</main>
        <footer>
          <a href="#top">↑ Back to top</a>
          <p>Copyright © {new Date().getFullYear()} ContentCrafter Inc.</p>
        </footer>
      </body>
    </html>
  );
}
