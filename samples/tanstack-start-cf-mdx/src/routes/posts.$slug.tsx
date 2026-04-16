import { createFileRoute } from "@tanstack/react-router";
import { getPostBySlug } from "~/utils/posts";

export const Route = createFileRoute("/posts/$slug")({
  loader: ({ params: { slug } }) => getPostBySlug(slug),
  component: PostComponent,
  pendingComponent: () => <div>Loading...</div>,
});

function PostComponent() {
  const post = Route.useLoaderData();

  return (
    <article className="post">
      <header>
        <h2>{post.title}</h2>
      </header>
      <div className="content">{post.mdx}</div>
      <footer>
        <p>By {post.author}</p>
        <time>{post.date}</time>
      </footer>
    </article>
  );
}
