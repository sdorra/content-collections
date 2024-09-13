"use client";

import * as Fathom from "fathom-client";
import { useEffect } from "react";

export function Analytics() {
  useEffect(() => {
    Fathom.load("PQLIJXQX", {
      includedDomains: [
        "content-collections.dev",
        "www.content-collections.dev",
      ],
      spa: "auto",
    });
  }, []);

  return null;
}
