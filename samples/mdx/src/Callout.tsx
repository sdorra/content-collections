import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function Callout({ children }: Props) {
  return (
    <div className="callout">
      <h4>Callout</h4>
      {children}
    </div>
  );
}
