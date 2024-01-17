import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Analytics } from "@/components/Analytics";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Content Collections",
  description: "Transform your content into type-safe data collections.",
  metadataBase: new URL("https://content-collections.dev"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          "bg-fixed bg-gradient-to-bl from-slate-950 to-slate-800 text-slate-300",
          "max-w-5xl min-h-svh mx-auto flex flex-col",
          "selection:bg-orange-500 selection:text-white",
          inter.className
        )}
      >
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
