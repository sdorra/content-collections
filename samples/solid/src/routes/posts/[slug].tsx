import {
  cache,
  createAsync,
  RouteDefinition,
  RouteSectionProps,
} from "@solidjs/router";
import { allPosts } from "content-collections";
import { Show } from "solid-js";

const getPost = cache(async (slug: string) => {
  "use server";

  const post = allPosts.find((post) => post._meta.path === slug);
  if (post) {
    return {
      title: post.title,
      html: post.html,
      date: post.date,
      author: post.author,
    };
  }
}, "posts");

export const route = {
  load: ({ params }) => getPost(params.slug),
} satisfies RouteDefinition;

export default function Post(props: RouteSectionProps) {
  const post = createAsync(() => getPost(props.params.slug));

  return (
    <Show when={post()}>
      <Show when={post()} fallback={<h2>Post not found.</h2>}>
        <article class="post">
          <header>
            <h2>{post()?.title}</h2>
          </header>
          <div class="content" innerHTML={post()?.html}></div>
          <footer>
            <p>By {post()?.author}</p>
            <time>{post()?.date}</time>
          </footer>
        </article>
      </Show>
    </Show>
  );
}
