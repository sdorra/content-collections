import { createFileRoute, Link } from "@tanstack/react-router";
import { getAllPosts } from "~/utils/posts";

export const Route = createFileRoute("/")({
  component: Home,
  loader: () => getAllPosts(),
});

function Home() {
  const posts = Route.useLoaderData();
  return (
    <main>
      <h2>Posts</h2>
      <div className="posts">
        {posts.map((post) => (
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
