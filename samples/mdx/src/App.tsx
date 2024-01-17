import { allPosts } from "content-collections";
import { MdxContent } from "./MdxContent";

export default function App() {
  return (
    <main>
      <h1>Posts</h1>
      <ul>
        {allPosts.map((post) => (
          <li key={post._meta.path}>
            <h2>{post.title}</h2>
            <MdxContent code={post.body} />
          </li>
        ))}
      </ul>
    </main>
  );
}
