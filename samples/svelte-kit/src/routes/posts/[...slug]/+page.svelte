<script lang="ts">
  import type { PageProps } from "./$types";
  import Markdown from "svelte-exmarkdown";
  import { markdownPlugins } from "$lib/mdSveltePlugins";

  let { data }: PageProps = $props();

  const post = $derived(data.post);
  const plugins = markdownPlugins;
  // const content = { md: post.content, plugins: data.plugins };
</script>

<div class="w-screen h-screen bg-slate-200 m-20">
  <div class="prose prose-md">
    <h1>{post.title}</h1>
    <Markdown md={post.content} {plugins} />
  </div>
</div>
