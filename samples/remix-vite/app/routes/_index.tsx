import type { MetaFunction } from "@remix-run/node";
import { allCharacters } from "content-collections";

export const meta: MetaFunction = () => {
  return [
    { title: "Remix + Content Collections" },
    { name: "description", content: "Integrate Content Collection into Remix" },
  ];
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Characters</h1>
      <ul>
        {allCharacters.map((character) => (
          <li key={character._meta.path}>
            <h2>{character.name}</h2>
            <p>{character.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
