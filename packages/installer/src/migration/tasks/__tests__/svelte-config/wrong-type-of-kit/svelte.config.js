import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit() {
    console.log('wrong, wrong, wrong');
  }
};

export default config;
