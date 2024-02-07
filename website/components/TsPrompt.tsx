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
      className={cn("px-2 flex gap-2 items-center not-italic", {
        "bg-base-600": isActive,
      })}
    >
      <Box className="text-sky-500 size-4" />
      {element}
    </li>
  );
}

type TsPromptProps = {
  elements: string[];
};

export function TsPrompt({ elements }: TsPromptProps) {
  return (
    <span className="relative text-base-300">
      <span className="cursor" />
      <ul className="absolute bg-base-700 py-1 top-6 left-1 rounded-md shadow-md">
        {elements.map((el) => (
          <TsPromptElement key={el} element={el} />
        ))}
      </ul>
    </span>
  );
}
