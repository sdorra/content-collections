import Metadata from "@/src/components/Metadata";
import { MDXContent } from "@content-collections/mdx/react";
import { allPosts } from "content-collections";
import { GetServerSidePropsContext, InferGetStaticPropsType } from "next";

type Props = InferGetStaticPropsType<typeof getStaticProps>;

export default function Post({ title, summary, code, author, date }: Props) {
  return (
    <article className="post">
      <Metadata title={title} description={summary} />
      <header>
        <h2>{title}</h2>
      </header>
      <div className="content">
        <MDXContent code={code} />
      </div>
      <footer>
        <p>By {author}</p>
        <time>{date}</time>
      </footer>
    </article>
  );
}

type Params = {
  slug: string;
};

export function getStaticPaths() {
  return {
    paths: allPosts.map((post) => ({ params: { slug: post._meta.path } })),
    fallback: false,
  };
}

export function getStaticProps({ params }: GetServerSidePropsContext<Params>) {
  const post = allPosts.find((post) => post._meta.path === params?.slug);
  if (!post) {
    return { notFound: true };
  }

  return {
    props: {
      title: post.title,
      summary: post.summary,
      code: post.code,
      author: post.author,
      date: post.date,
    },
  };
}
