import { component$ } from "@qwik.dev/core";
import type { DocumentHead } from "@qwik.dev/router";
import { allCharacters } from "content-collections";
import { MDXContent } from "~/components/mdx-content/mdx-content";

export default component$(() => {
  return (
    <main>
      <h1>Characters</h1>
      <ul>
        {allCharacters.map((character) => (
          <li key={character.name}>
            <h2>{character.name}</h2>

            <ul>
              <li>Planet of origin: {character.origin}</li>
              <li>Species: {character.species}</li>
            </ul>

            <p>{character.content}</p>

            <a href={character.source}>Source</a>
          </li>
        ))}
      </ul>
      <MDXContent code={allCharacters[0].mdx} />
    </main>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
