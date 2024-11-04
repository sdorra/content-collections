import LogoImage from "@/assets/logo.png";
import type { DocsLayoutProps } from "fumadocs-ui/layout";
import { Book, HandCoins, SwatchBook } from "lucide-react";
import Image from "next/image";

export const baseOptions: Partial<DocsLayoutProps> = {
  nav: {
    title: (
      <>
        <Image src={LogoImage} alt="logo" width={32} height={32} />
        Content Collections
      </>
    ),
  },
  githubUrl: "https://github.com/sdorra/content-collections",
  links: [
    {
      url: "/docs",
      type: "main",
      active: "none",
      text: "Documentation",
      icon: <Book />,
    },
    {
      url: "/samples",
      type: "main",
      active: "nested-url",
      text: "Samples",
      icon: <SwatchBook />,
    },
    {
      url: "/sponsors",
      type: "main",
      active: "url",
      text: "Sponsors",
      icon: <HandCoins />,
    },
  ],
};
