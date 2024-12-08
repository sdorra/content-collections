import { allPosts } from "content-collections";
import Link from "next/link";

export default function Page() {
  return (
    <main>
      <h2>Posts</h2>
      <div className="posts">
        {allPosts.map((post) => (
          <Link key={post.slug} href={`/posts/${post.slug}`}>
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
