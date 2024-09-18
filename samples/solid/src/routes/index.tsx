import { cache, createAsync, RouteDefinition } from "@solidjs/router";
import { allPosts } from "content-collections";
import { For } from "solid-js";

// We will load the posts only on the server to avoid sending all the posts,
// including the content, to the client.
// If we used `allPosts` directly, we would send all posts to the client.
const getPosts = cache(async () => {
  "use server";

  return allPosts
    .toSorted((a, b) => b.date.localeCompare(a.date))
    .map((post) => ({
      slug: `/posts/${post._meta.path}`,
      title: post.title,
      date: post.date,
      summary: post.summary,
    }));
}, "posts");

export const route = {
  load: () => getPosts(),
} satisfies RouteDefinition;

export default function App() {
  const posts = createAsync(() => getPosts());

  return (
    <>
      <h2>Posts</h2>
      <div class="posts">
        <For each={posts()}>
          {(post) => (
            <a href={post.slug}>
              <header>
                <h3>{post.title}</h3>
                <time>{post.date}</time>
              </header>
              <p>{post.summary}</p>
            </a>
          )}
        </For>
      </div>
    </>
  );
}
