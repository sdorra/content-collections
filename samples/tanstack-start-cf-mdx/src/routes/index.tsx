import { createFileRoute, Link } from "@tanstack/react-router";
import { allPosts } from "content-collections";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main>
      <h2>Posts</h2>
      <div className="posts">
        {allPosts.map((post) => (
          <Link
            key={post.slug}
            to={`/posts/$slug`}
            params={{ slug: post.slug }}
          >
            <header>
              <h3>{post.title}</h3>
              <time>{post.date}</time>
            </header>
            <p>{post.summary}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
