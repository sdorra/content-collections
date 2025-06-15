<script>
  import "@content-collections/sample-theme/sample.css";
  let { children } = $props();
</script>

<header id="top">
  <h1>ContentCrafter Inc.</h1>
  <p>
    From Worldly Wonders to Polished Perfection – Crafting Content That
    Captivates and Converts.
  </p>
  <nav>
    <a href="/">Posts</a>
  </nav>
</header>

{@render children()}

<footer>
  <a href="#top">↑ Back to top</a>
  <p>Copyright © {new Date().getFullYear()} ContentCrafter Inc.</p>
</footer>
