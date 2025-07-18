import { createFileRoute } from "@tanstack/react-router";
import { findPostBySlug } from "~/utils/posts";

export const Route = createFileRoute("/posts/$slug")({
  loader: ({ params: { slug } }) => findPostBySlug(slug),
  component: PostComponent,
});

function PostComponent() {
  const post = Route.useLoaderData();

  return (
    <article className="post">
      <header>
        <h2>{post.title}</h2>
      </header>
      <div className="content" dangerouslySetInnerHTML={{ __html: post.content }} />
      <footer>
        <p>By {post.author}</p>
        <time>{post.date}</time>
      </footer>
    </article>
  );
}
