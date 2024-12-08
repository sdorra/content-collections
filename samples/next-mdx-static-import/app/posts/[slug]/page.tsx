import { allPosts } from "content-collections";
import { notFound } from "next/navigation";

type Props = {
  params: {
    slug: string;
  };
};

export default async function Post({ params: { slug } }: Props) {
  const post = allPosts.find((post) => post.slug === slug);
  if (!post) {
    return notFound();
  }

  const MdxContent = post.mdxContent;

  return (
    <article className="post">
      <header>
        <h2>{post.title}</h2>
      </header>
      <div className="content">
        <MdxContent />
      </div>
      <footer>
        <p>By {post.author}</p>
        <time>{post.date}</time>
      </footer>
    </article>
  );
}
