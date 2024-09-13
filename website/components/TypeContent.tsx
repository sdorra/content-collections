"use client";

import { Circle } from "lucide-react";
import { useState } from "react";
import Typewriter from "typewriter-effect";

const md = `
`;

type Props = {
  title: string;
  prefix: string;
  content: string[];
};

export function TypeContent({ title, prefix, content }: Props) {
  const [currentContent, setCurrentContent] = useState("");

  return (
    <div className="grid-row-2 grid gap-2">
      <div className="border-base-600/50 rounded-md border bg-[#22272E] shadow-md">
        <header className="border-b-base-600/50 flex gap-1 rounded-t-md border p-2">
          <Circle className="size-3 fill-current text-rose-500" />
          <Circle className="size-3 fill-current text-amber-500" />
          <Circle className="size-3 fill-current text-emerald-500" />
        </header>
        <div className="p-5">
          <pre>
            <code>
              {`---
title: ${title}
---

`}
            </code>
          </pre>
          <div className="flex gap-1.5">
            {prefix}
            <Typewriter
              onInit={(typewriter) => {
                let t = typewriter;
                for (const c of content) {
                  t = typewriter
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
                t.start();
              }}
              options={{
                loop: true,
              }}
            />
          </div>
        </div>
      </div>
      <div className="bg-base-700 rounded-md p-5 shadow-md">
        <p className="mb-4 text-xl font-bold">{title}</p>
        <p>
          {prefix} {currentContent}
        </p>
      </div>
    </div>
  );
}
