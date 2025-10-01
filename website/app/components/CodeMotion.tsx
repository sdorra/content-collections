import { createHighlighter } from "shiki";
import {
  codeToKeyedTokens,
  createMagicMoveMachine,
  type KeyedTokensInfo,
} from "shiki-magic-move/core";
import { CodeMotionClient } from "./CodeMotionClient";

const themes = {
  light: "github-light",
  dark: "github-dark",
};

const lang = "typescript";

export type MotionCodeSnippets = {
  light: KeyedTokensInfo[];
  dark: KeyedTokensInfo[];
};

export async function createMotionCodeSnippets(snippets: string[]) {
  const shiki = await createHighlighter({
    langs: [lang],
    themes: [themes.light, themes.dark],
  });

  const machineOptions = {
    lineNumbers: false,
  };

  const light = createMagicMoveMachine(
    (code) =>
      codeToKeyedTokens(shiki, code, {
        lang: lang,
        theme: themes.light,
      }),
    machineOptions,
  );

  const dark = createMagicMoveMachine(
    (code) =>
      codeToKeyedTokens(shiki, code, {
        lang: lang,
        theme: themes.dark,
      }),
    machineOptions,
  );

  return {
    light: snippets.map((code) => light.commit(code).current),
    dark: snippets.map((code) => dark.commit(code).current),
  };
}

type Props = {
  snippets: string[];
};

export async function CodeMotion({ snippets }: Props) {
  const motionSnippets = await createMotionCodeSnippets(snippets);
  return (
    <CodeMotionClient light={motionSnippets.light} dark={motionSnippets.dark} />
  );
}
