import { allPosts } from "content-collections";
import type { Route } from "./+types/post";

export async function loader({ params }: Route.LoaderArgs) {
  const post = allPosts.find((post) => post.slug === params.slug);
  if (!post) {
    throw new Response("Not Found", { status: 404 });
  }
  return { post };
}

export default function Post({ loaderData }: Route.ComponentProps) {
  const post = loaderData.post;
  return (
    <article className="post">
      <header>
        <h2>{post.title}</h2>
      </header>
      <div
        className="content"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
      <footer>
        <p>By {post.author}</p>
        <time>{post.date}</time>
      </footer>
    </article>
  );
}
