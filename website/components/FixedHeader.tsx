"use client";

import clsx from "clsx";
import { ReactNode, useEffect, useState } from "react";

type Props = {
  fixed?: boolean;
  children?: ReactNode;
};

export function FixedHeader({ fixed, children }: Props) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (fixed) {
        setIsScrolled(window.scrollY > 40);
      }
    };

    window.addEventListener("scroll", checkScroll);
    return () => {
      window.removeEventListener("scroll", checkScroll);
    };
  }, [fixed]);

  return (
    <header
      className={clsx(
        "px-4 h-10 sm:px-10 py-2 max-w-5xl mx-auto w-full flex transition-colors duration-500 inset-x-0",
        {
          "absolute": !fixed,
          "fixed md:absolute": fixed,
          "bg-slate-900/80 md:bg-transparent": fixed && isScrolled,
        }
      )}
    >
      {children}
    </header>
  );
}
