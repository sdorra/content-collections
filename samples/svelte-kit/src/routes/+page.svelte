<script lang="ts">
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
  data.posts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
</script>

<main>
  <h2>Posts</h2>
  <div class="posts">
    {#each data.posts as post}
      <a href="/posts/{post.slug}">
        <header>
          <h3>{post.title}</h3>
          <time>{post.date}</time>
        </header>
        <p>{post.summary}</p>
      </a>
    {/each}
  </div>
</main>
