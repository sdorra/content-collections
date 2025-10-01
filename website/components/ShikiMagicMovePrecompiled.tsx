// this is a copy from shiki-magic-move/react in order to fix
// https://github.com/shikijs/shiki-magic-move/issues/39

import * as React from "react";
import { syncTokenKeys, toKeyedTokens } from "shiki-magic-move/core";
import { ShikiMagicMoveRenderer } from "shiki-magic-move/react";
import type {
  KeyedTokensInfo,
  MagicMoveDifferOptions,
  MagicMoveRenderOptions,
} from "shiki-magic-move/types";

export interface ShikiMagicMovePrecompiledProps {
  steps: KeyedTokensInfo[];
  step?: number;
  animate?: boolean;
  options?: MagicMoveRenderOptions & MagicMoveDifferOptions;
  onStart?: () => void;
  onEnd?: () => void;
}

const EMPTY = /* @__PURE__ */ toKeyedTokens("", []);

/**
 * Component to render a compiled magic move step,
 * Where the tokens can be generated on build time.
 */
export function ShikiMagicMovePrecompiled({
  steps,
  step = 0,
  animate = true,
  options,
  onStart,
  onEnd,
}: ShikiMagicMovePrecompiledProps) {
  const [previous, setPrevious] = React.useState(EMPTY);

  const result = React.useMemo(() => {
    const res = syncTokenKeys(
      previous,
      steps[Math.min(step, steps.length - 1)],
      options,
    );
    setPrevious(res.to);
    return res;
  }, [steps, step, options]);

  return (
    <ShikiMagicMoveRenderer
      tokens={result.to}
      previous={result.from}
      options={options}
      animate={animate}
      onStart={onStart}
      onEnd={onEnd}
    />
  );
}
