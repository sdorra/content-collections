import { cn } from "@/lib/utils";
import { Box } from "lucide-react";

type TsPromptElementProps = {
  element: string;
};

function TsPromptElement({ element }: TsPromptElementProps) {
  const isActive = element.startsWith("*");
  if (isActive) {
    element = element.substring(1);
  }

  return (
    <li
      className={cn(
        "text-base-500 dark:text-base-400 flex items-center gap-2 px-2 not-italic",
        {
          "dark:bg-base-600 dark:text-base-200 bg-sky-500 text-sky-50":
            isActive,
        },
      )}
    >
      <Box
        className={cn("size-4 text-sky-500", {
          "dark:text-base-200 text-sky-50": isActive,
        })}
      />
      {element}
    </li>
  );
}

type TsPromptProps = {
  elements: string[];
};

export function TsPrompt({ elements }: TsPromptProps) {
  return (
    <span className="text-base-300 relative select-none">
      <span className="cursor" />
      <ul className="bg-base-200 dark:border-base-700 dark:bg-base-700 absolute left-1 top-6 rounded-md border py-1 shadow-md">
        {elements.map((el) => (
          <TsPromptElement key={el} element={el} />
        ))}
      </ul>
    </span>
  );
}
