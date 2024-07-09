import type { Metadata } from "next";
import { Inter } from "next/font/google";
import clsx from "clsx";
import { RootProvider } from "fumadocs-ui/provider";

import "./globals.css";
import { Analytics } from "@/components/Analytics";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Content Collections",
  description: "Transform your content into type-safe data collections.",
  metadataBase: new URL("https://www.content-collections.dev"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={clsx(
          "min-h-svh flex flex-col",
          "selection:bg-primary-500 selection:text-white",
          inter.className,
        )}
      >
        <RootProvider>{children}</RootProvider>
        <Analytics />
      </body>
    </html>
  );
}
