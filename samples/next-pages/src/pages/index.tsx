import { allPosts } from "content-collections";
import Link from "next/link";
import Metadata from "../components/Metadata";
import { InferGetStaticPropsType } from "next";

type Props = InferGetStaticPropsType<typeof getStaticProps>;

export default function Home({ posts }: Props) {
  return (
    <>
      <Metadata />
      <h2>Posts</h2>
      <div className="posts">
        {posts.map((post) => (
          <Link key={post.href} href={post.href}>
            <header>
              <h3>{post.title}</h3>
              <time>{post.date}</time>
            </header>
            <p>{post.summary}</p>
          </Link>
        ))}
      </div>
    </>
  );
}

export function getStaticProps() {
  return {
    props: {
      posts: allPosts.map((post) => ({
        title: post.title,
        summary: post.summary,
        date: post.date,
        href: `/posts/${post._meta.path}`,
      })),
    },
  };
}
