import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { allPosts } from 'content-collections';
import { markdownPlugins } from './markdownPlugins';

export const load: PageLoad = async ({ params }) => {
	const post = allPosts.find((post) => post.slug == params.slug);
	if (!post) {
		error(404, `Could not find path ${params.slug}`);
	}

	const plugins = [markdownPlugins];

	return {
		post,
		plugins
	};
};
