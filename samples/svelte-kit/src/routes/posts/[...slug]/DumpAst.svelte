<!-- DumpAst.svelte -->
<script lang="ts">
	import { getAstNode } from 'svelte-exmarkdown';

	const astContext = getAstNode();
</script>

<!-- Dump current node -->
<pre>{JSON.stringify(astContext.current, null, 2)}</pre>
