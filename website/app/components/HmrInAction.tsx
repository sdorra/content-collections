"use client";

import { useEffect } from "react";
import { type TypewriterClass } from "typewriter-effect";
// @ts-ignore types are not available
import Typewriter from "typewriter-effect/dist/core";

function mustFind(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`element with id ${id} not found`);
  }
  return el;
}

function applyHmrSimulation() {
  const target = mustFind("hmr-target");
  if (!target) {
    throw new Error("target not found");
  }

  let typewriter: TypewriterClass = new Typewriter("#hmr-source", {
    loop: true,
  });

  function setCurrentContent(content: string) {
    target.innerText = content;
  }

  for (const c of ["cool.", "awesome.", "great."]) {
    typewriter = typewriter
      .typeString(c)
      .callFunction(() => {
        setCurrentContent(c);
      })
      .pauseFor(1000)
      .deleteAll()
      .callFunction(() => {
        setCurrentContent("");
      })
      .pauseFor(1000);
  }

  typewriter.start();

  return () => {
    typewriter.stop();
  };
}

export function HmrInAction() {
  useEffect(() => {
    return applyHmrSimulation();
  }, []);
  return null;
}
