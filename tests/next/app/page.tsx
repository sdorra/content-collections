import { allAuthors, allPosts } from "mdx-collections";
export default function Home() {
  return (
    <main className="space-y-5 p-10">
      <h1 className="text-4xl font-bold">Collections</h1>
      <div>
      <h2 className="text-xl font-semibold mb-2">Posts</h2>
      <ul>
        {allPosts.map((post) => (
          <li key={post._meta.path}>{post.title}</li>
        ))}
      </ul>
      </div>
      <div>
      <h2 className="text-xl font-semibold mb-2">Authors</h2>
      <ul>
        <li>
          {allAuthors.map((author) => (
            <li key={author._meta.path}>{author.displayName}</li>
          ))}
        </li>
      </ul>
      </div>
    </main>
  );
}
