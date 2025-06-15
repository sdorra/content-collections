<script lang="ts">
  import type { PageProps } from "./$types";
  import Markdown from "svelte-exmarkdown";
  import { markdownPlugins } from "$lib/mdSveltePlugins";

  let { data }: PageProps = $props();

  const post = $derived(data.post);
  const plugins = markdownPlugins;
</script>

<article class="post">
  <header>
    <h2>{post.title}</h2>
  </header>
  <div class="content">
    <Markdown md={post.content} {plugins} />
  </div>
  <footer>
    <p>By {post.author}</p>
    <time>{post.date}</time>
  </footer>
</article>
