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
        "px-2 flex gap-2 items-center not-italic text-base-500 dark:text-base-400",
        {
          "dark:bg-base-600 bg-sky-500 dark:text-base-200 text-sky-50":
            isActive,
        }
      )}
    >
      <Box
        className={cn("text-sky-500 size-4", {
          "text-sky-50 dark:text-base-200": isActive,
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
    <span className="relative text-base-300 select-none">
      <span className="cursor" />
      <ul className="absolute bg-base-200 border dark:border-base-700 dark:bg-base-700 py-1 top-6 left-1 rounded-md shadow-md">
        {elements.map((el) => (
          <TsPromptElement key={el} element={el} />
        ))}
      </ul>
    </span>
  );
}
