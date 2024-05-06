"use client";

import { Quickstart, allQuickstarts } from "content-collections";
import { BrandIcon } from "@/components/BrandIcon";
import * as Select from "@radix-ui/react-select";
import clsx from "clsx";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import React from "react";

const quickstartsByCategory = allQuickstarts.reduce(
  (acc, quickstart) => {
    if (!acc[quickstart.category]) {
      acc[quickstart.category] = [];
    }
    acc[quickstart.category].push(quickstart);
    return acc;
  },
  {} as Record<string, Quickstart[]>
);

const categories = Object.keys(quickstartsByCategory).sort();

type GroupProps = {
  label: string;
  children: ReactNode;
};

function Group({ label, children }: GroupProps) {
  return (
    <Select.Group>
      <Select.Label className="text-xs text-base-400 font-semibold border-0 mb-1 px-2 first-letter:uppercase">
        {label}
      </Select.Label>
      {children}
    </Select.Group>
  );
}

function Item(quickstart: Quickstart) {
  return (
    <Select.Item
      className={clsx(
        "flex items-center gap-2 cursor-pointer px-2 border-l-2 border-l-transparent",
        "data-[highlighted]:bg-base-500 data-[highlighted]:font-semibold data-[highlighted]:text-base-100 data-[highlighted]:border-l-base-100",
        "decoration-primary-500 data-[state=checked]:text-base-100 data-[state=checked]:underline data-[state=checked]:border-l-primary-600",
        "focus:ring-0 focus:ring-offset-0"
      )}
      key={quickstart.name}
      value={quickstart.name}
    >
      <Select.Icon>
        <BrandIcon
          icon={quickstart.icon || quickstart.name}
          className="w-4 h-4"
        />
      </Select.Icon>
      <Select.ItemText>{quickstart.linkText}</Select.ItemText>
    </Select.Item>
  );
}

type Props = {
  value: string;
  className?: string;
};

export function QuickstartSelector({ value, className }: Props) {
  const router = useRouter();

  const onValueChange = (newValue: string) => {
    const qs = allQuickstarts.find(
      (quickstart) => quickstart.name === newValue
    );
    if (qs) {
      router.push(qs.href);
    }
  };

  const quickstart =
    allQuickstarts.find((quickstart) => quickstart.name === value) ||
    allQuickstarts[0];

  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger
        title="Choose an integration"
        className={clsx(
          "flex data-[placeholder]:text-sm relative items-center justify-between w-44 border p-1 rounded-md border-base-500",
          className
        )}
        aria-label="Integration"
      >
        <Select.Value placeholder="select an integration…">
          <div className="flex gap-2 items-center">
            <BrandIcon
              icon={quickstart.icon || quickstart.name}
              className="w-4 h-4 ml-1"
            />
            <span className="text-sm">{quickstart.linkText}</span>
          </div>
        </Select.Value>
        <Select.Icon>
          <ChevronDownIcon />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={5}
          alignOffset={-7}
          className="overflow-hidden rounded-md bg-base-700 w-48 shadow-lg py-2 focus:ring-0 focus:ring-offset-0"
        >
          <Select.ScrollUpButton>
            <ChevronUpIcon />
          </Select.ScrollUpButton>
          <Select.Viewport>
            {categories.map((category, i) => (
              <React.Fragment key={category}>
                <Group key={category} label={category}>
                  {quickstartsByCategory[category].map(Item)}
                </Group>
                {i < categories.length - 1 && (
                  <Select.Separator className="h-px mx-2 my-2 bg-base-500" />
                )}
              </React.Fragment>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
