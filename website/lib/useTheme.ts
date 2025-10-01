import { useEffect, useState } from "react";

type Theme = "light" | "dark" | undefined;

// this a ugly workaround,
// but i could not find a way to access the current theme of fumadocs

export function useTheme() {
  const [state, setState] = useState<Theme>();

  useEffect(() => {
    if (typeof document === "undefined") {
      console.log("Document is undefined, skipping theme detection");
      return;
    }

    const checkTheme = () => {
      if (document.querySelector("html")?.classList.contains("dark")) {
        setState("dark");
      } else {
        setState("light");
      }
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);

    const html = document.querySelector("html");
    if (html) {
      console.log("Observing theme changes");
      observer.observe(html, { attributes: true, attributeFilter: ["class"] });
    }

    return () => observer.disconnect();
  }, []);

  return state;
}
