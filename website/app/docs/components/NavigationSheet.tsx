"use client";

import { Sheet } from "@/components/Sheet";
import { ReactNode, useState } from "react";
import { NavigationContext } from "./NavigationContext";

type Props = {
  children?: ReactNode;
};

export function NavigationSheet({ children }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <NavigationContext.Provider
      value={{ handleNavigation: () => setIsOpen(false) }}
    >
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        {children}
      </Sheet>
    </NavigationContext.Provider>
  );
}
