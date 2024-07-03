import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import clsx from "clsx";

import "./globals.css";

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
    <html
      lang="en"
      className="bg-base-800 bg-fixed bg-gradient-to-bl from-base-950 to-base-800 text-base-300"
    >
      <body
        className={clsx(
          "min-h-svh flex flex-col",
          "selection:bg-primary-500 selection:text-white",
          inter.className
        )}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
