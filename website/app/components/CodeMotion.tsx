"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ReactElement, ReactNode, useEffect, useState } from "react";

type Props = {
  children: ReactNode[];
};

function isElement(node: ReactNode): node is ReactElement {
  return (node as ReactElement).props !== undefined;
}

const lineHeight = 24;

function calculateHeight(node: ReactNode) {
  if (isElement(node)) {
    const children = node.props.children;
    if (Array.isArray(children)) {
      // divide by 2 because each line is followed by a line break
      return `${(children.length / 2) * lineHeight}px`;
    }
  }
  return "auto";
}

export function CodeMotion({ children }: Props) {
  const [sample, setSample] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setSample((sample) => (sample + 1) % children.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [children]);

  const height = calculateHeight(children[sample]);

  return (
    <motion.div
      initial={false}
      animate={{ height }}
      className="overflow-hidden"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={sample}
          initial={false}
          animate={{
            opacity: 1,
          }}
          exit={{ opacity: 0 }}
        >
          {children[sample]}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
