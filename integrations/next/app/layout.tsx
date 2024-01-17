import type { Metadata } from "next";
import "./globals.css";

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
        <main>{children}</main>
      </body>
    </html>
  );
}
