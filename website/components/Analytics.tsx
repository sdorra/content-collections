"use client";

import { useEffect } from "react";
import * as Fathom from "fathom-client";

export function Analytics(){
  useEffect(() => {
    Fathom.load("PQLIJXQX", {
      includedDomains: ["content-collections.dev", "www.content-collections.dev"],
      spa: "auto"
    });
  }, []);

  return null;
};
