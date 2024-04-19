type Props = {
  title: string;
  children: React.ReactNode;
};

export function NavSection({ title, children }: Props) {
  return (
    <section>
      <div className="font-bold mt-5 mb-2 text-base-200 first-letter:uppercase">{title}</div>
      <ul>{children}</ul>
    </section>
  );
}
