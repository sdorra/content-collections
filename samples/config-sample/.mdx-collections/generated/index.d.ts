import _config from "../../config.ts";
import z from "zod";

type _Document = {
  path: string;
};

type _Collections = (typeof _config)["collections"];

type _CollectionsByName = {
  [TCollection in _Collections[number] as TCollection["name"]]: _Collections[number];
};

type _GetByName<TName extends string> = _CollectionsByName[TName];

export type Post = z.infer<_GetByName<"posts">["schema"]> & {
  _document: _Document;
};
export declare const allPosts: Array<Post>;

export {};
