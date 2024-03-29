import { allPosts } from "content-collections";
import { useState } from "react";

export default function App() {
  const [selectedPath, setSelectedPath] = useState<string>();
  const selected = allPosts.find(
    (post) => post._meta.fileName === selectedPath
  );
  return (
    <main className="p-10 flex gap-5">
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
        <article dangerouslySetInnerHTML={{__html: selected.html}} />
      ) : (
        <p>Please select a post</p>
      )}
    </main>
  );
}
