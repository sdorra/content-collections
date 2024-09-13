import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { allCharacters } from "content-collections";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <main>
      <h1>Characters</h1>
      <ul>
        {allCharacters.map((character) => (
          <li key={character.slug}>
            <Link to={`/characters/${character.slug}`}>{character.name}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
