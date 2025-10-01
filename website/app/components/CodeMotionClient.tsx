"use client";

import { ShikiMagicMovePrecompiled } from "@/components/ShikiMagicMovePrecompiled";
import { useTheme } from "@/lib/useTheme";
import { LoaderCircle } from "lucide-react";
import {  useEffect, useState } from "react";

import "shiki-magic-move/dist/style.css";
import { KeyedTokensInfo } from "shiki-magic-move/types";

type Props = {
  light: KeyedTokensInfo[];
  dark: KeyedTokensInfo[];
};

export function CodeMotionClient({ light, dark }: Props) {
  const theme = useTheme();
  const snippets = theme === "dark" ? dark : light;
  const [snippet, setSnippet] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSnippet((snippet) => (snippet + 1) % snippets.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [snippets]);

  if (!theme) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex animate-pulse items-center gap-2">
          <LoaderCircle className="animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  const currentTheme = theme === "dark" ? "github-dark" : "github-light";
  return (
    <ShikiMagicMovePrecompiled
      key={currentTheme}
      steps={snippets}
      step={snippet}
      options={{ duration: 800, stagger: 0.3, lineNumbers: false }}
    />
  );
}
