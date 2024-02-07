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
    <div className="grid grid-row-2 gap-2">
      <div className="bg-[#22272E] rounded-md shadow-md border border-base-600/50">
        <header className="border border-b-base-600/50 flex gap-1 rounded-t-md p-2">
          <Circle className="text-rose-500 fill-current size-3" />
          <Circle className="text-amber-500 fill-current size-3" />
          <Circle className="text-emerald-500 fill-current size-3" />
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
      <div className="bg-base-700 rounded-md shadow-md p-5">
        <p className="font-bold text-xl mb-4">{title}</p>
        <p>
          {prefix} {currentContent}
        </p>
      </div>
    </div>
  );
}
