import clsx from "clsx";
import { AlertTriangle, CheckCircle, Lightbulb, XOctagon } from "lucide-react";
import { ReactNode } from "react";

export const types = ["info", "success", "warning", "error"] as const;

type Type = typeof types[number];

type Props = {
  type?: Type;
  title?: string;
  children: ReactNode;
  prose?: boolean;
};

const icons = {
  info: Lightbulb,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XOctagon,
};

export const Notification = ({ title, children, type = "warning", prose = false}: Props) => {
  const Icon = icons[type];
  return (
    <div
      className={clsx(
        "rounded-md border-l-8 border-r border-t border-b p-5 shadow-md [&_a]:underline hover:[&_a]:decoration-2",
        {
          "border-info-600 dark:border-info-500 hover:[&_a]:decoration-info-500": type === "info",
          "border-warn-600 dark:border-warn-500 hover:[&_a]:decoration-warn-500": type === "warning",
          "border-error-600 dark:border-error-500 hover:[&_a]:decoration-error-500": type === "error",
          "border-success-600 dark:border-success-500 hover:[&_a]:decoration-success-500": type === "success",
          "not-prose": !prose
        }
      )}
    >
      <div
        className={clsx("mb-2 flex items-center justify-between", {
          "text-info-700 dark:text-info-500": type === "info",
          "text-warn-700 dark:text-warn-500": type === "warning",
          "text-error-600 dark:text-error-500": type === "error",
          "text-success-700 dark:text-success-500": type === "success",
        })}
      >
        <div className="font-semibold first-letter:uppercase">{title ? title : type}</div>
        <Icon />
      </div>
      {children}
    </div>
  );
};
