import { createFileRoute } from "@tanstack/react-router";
import { findPostBySlug, getMdxContent } from "~/utils/posts";

export const Route = createFileRoute("/posts/$slug")({
  loader: async ({ params: { slug } }) => {
    const { mdx, ...post } = findPostBySlug(slug);
    return {
      ...post,
      mdx: getMdxContent(slug)
    };
  },
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
