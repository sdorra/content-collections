<script lang="ts">
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<h1>Posts</h1>
<p>List of Posts</p>
<ul>
  {#each data.posts as post}
    <li>
      <a href="/posts/{post.slug}">{post.title}</a>
      <p>{post.summary}</p>
    </li>
  {/each}
</ul>
