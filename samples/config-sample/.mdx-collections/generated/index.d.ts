import mdxConfiguration from "../../config.ts";
import { GetTypeByName } from "@mdx-collections/core";

export type Post = GetTypeByName<typeof mdxConfiguration, "posts">;
export declare const allPosts: Array<Post>;

export {};
