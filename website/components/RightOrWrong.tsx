import { Ban, CheckCircle } from "lucide-react";

type Props = {
  children: React.ReactNode;
};

export function Right({ children }: Props) {
  return (
    <RightOrWrong
      icon={<CheckCircle className="text-success-600 size-6" />}
      title="Correct"
    >
      {children}
    </RightOrWrong>
  );
}

export const Correct = Right;

export function Wrong({ children }: Props) {
  return (
    <RightOrWrong
      icon={<Ban className="text-error-600 size-6" />}
      title="Wrong"
    >
      {children}
    </RightOrWrong>
  );
}

type RightOrWrongProps = {
  className?: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
};

function RightOrWrong({ icon, title, className, children }: RightOrWrongProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        {icon} <strong>{title}</strong>
      </div>
      <div>{children}</div>
    </div>
  );
}
