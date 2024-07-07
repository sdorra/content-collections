import type { BaseLayoutProps } from "fumadocs-ui/layout";
import LogoImage from "@/assets/logo.png";
import Image from "next/image";
import { Book, SwatchBook } from "lucide-react";

export const baseOptions: BaseLayoutProps = {
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
  ],
};
