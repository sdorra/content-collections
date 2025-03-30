import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { allCharacters } from "content-collections";
import { MDXContent } from "@content-collections/mdx/qwik";

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
      <MDXContent />
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
