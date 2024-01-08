import { allDocs } from "content-collections";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <ul>
        {allDocs.map((doc) => (
          <li key={doc._meta.path}>
            <Link href={`/docs/${doc._meta.path}`}>{doc.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
