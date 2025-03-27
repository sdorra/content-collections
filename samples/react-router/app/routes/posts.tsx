import { allPosts } from "content-collections";
import { Link } from "react-router";
import type { Route } from "./+types/posts";

export async function loader() {
  const posts = allPosts
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      date: post.date,
      summary: post.summary,
    }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  return { posts };
}

export default function Posts({ loaderData }: Route.ComponentProps) {
  const posts = loaderData.posts;
  return (
    <main>
      <h2>Posts</h2>
      <div className="posts">
        {posts.map((post) => (
          <Link key={post.slug} to={`/posts/${post.slug}`}>
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
