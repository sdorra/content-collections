import { Link, Outlet } from "@remix-run/react";

export default function Layout() {
  return (
    <>
      <article>
        <Outlet />
      </article>
      <Link to="/">Back to overview</Link>
    </>
  );
}
