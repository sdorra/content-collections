import { allPosts } from "content-collections";
import { useState } from "react";
import Markdown from "react-markdown";

export default function App() {
  const [selectedPath, setSelectedPath] = useState<string>();
  const selected = allPosts.find(
    (post) => post._meta.fileName === selectedPath,
  );
  return (
    <main className="flex gap-5 p-10">
      <ul className="flex-shrink-0">
        {allPosts.map((post) => (
          <li key={post._meta.fileName}>
            <button onClick={() => setSelectedPath(post._meta.fileName)}>
              {post.title}
            </button>
          </li>
        ))}
      </ul>
      {selected ? (
        <article>
          <Markdown>{selected.content}</Markdown>
        </article>
      ) : (
        <p>Please select a post</p>
      )}
    </main>
  );
}
