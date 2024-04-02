"use client";

import * as Tabs from "@radix-ui/react-tabs";
import clsx from "clsx";
import { useEffect, useState } from "react";

type Props = {
  packages: Array<string>;
  devDependencies?: boolean;
};

type TriggerProps = {
  manager: string;
};

function Trigger({ manager }: TriggerProps) {
  return (
    <Tabs.Trigger
      value={manager}
      className={clsx(
        "px-2 py-1 w-16 border-slate-500/60 border-b text-slate-400",
        // hover styles
        "hover:text-slate-300 hover:font-semibold",
        // styles if the next tab is active
        "[&[data-state=active]_+&]:rounded-bl [&[data-state=active]_+&]:border-l",
        // styles if the previous tab is active
        "has-[+_[data-state=active]]:rounded-br has-[+_[data-state=active]]:border-r",
        // styles if the tab is active
        "data-[state=active]:text-slate-100 data-[state=active]:font-semibold",
        "data-[state=active]:bg-[rgb(40,44,52)] data-[state=active]:border-b-[rgb(40,44,52)]",
        // we need peer to style the gap filler after the buttons
        "peer"
      )}
    >
      {manager}
    </Tabs.Trigger>
  );
}

function TriggerGapFiller() {
  return (
    <div
      className={clsx(
        "border-b border-slate-500/60 flex-grow",
        // styles if the last tab is active
        "peer-[[data-state=active]:last-of-type]:rounded-bl peer-[[data-state=active]:last-of-type]:border-l"
      )}
    />
  );
}

type CommandProps = {
  manager: string;
  command?: string;
  subCommand: string;
  options?: Array<string> | undefined;
  packages: Array<string>;
};

function Command({
  manager,
  command = manager,
  subCommand,
  options = [],
  packages,
}: CommandProps) {
  return (
    <Tabs.Content className="" value={manager}>
      <pre
        className="not-prose shiki one-dark-pro p-4 overflow-x-auto"
        tabIndex={0}
        style={{
          backgroundColor: "rgb(40, 44, 52)",
          color: "rgb(171, 178, 191)",
        }}
      >
        <code>
          <span className="line">
            <span style={{ color: "rgb(97, 175, 239)" }}>{command}</span>
            <span style={{ color: "rgb(152, 195, 121)" }}> {subCommand}</span>
            {options.map((option) => (
              <span key={option} style={{ color: "rgb(209, 154, 102)" }}>
                {" "}
                {option}
              </span>
            ))}
            <span style={{ color: "rgb(152, 195, 121)" }}>
              {" "}
              {packages.join(" ")}
            </span>
          </span>
          {"\n"}
          <span className="line" />
        </code>
      </pre>
    </Tabs.Content>
  );
}

function useDefaultManager() {
  const [manager, setManager] = useState("pnpm");
  useEffect(() => {
    const storage = localStorage.getItem("package-manager");
    console.log(storage);
    if (storage) {
      setManager(storage);
    }
  }, []);

  function setManagerAndStore(manager: string) {
    localStorage.setItem("package-manager", manager);
    setManager(manager);
  }

  return [manager, setManagerAndStore] as const;
}

export function PackageInstall({ packages, devDependencies }: Props) {
  const [defaultManager, setDefaultManager] = useDefaultManager();
  // [backgroundColor:rgb(40,44,52)]
  return (
    <Tabs.Root
      value={defaultManager}
      onValueChange={setDefaultManager}
      className="border border-slate-500/60 rounded-md overflow-hidden"
    >
      <Tabs.List className="flex bg-slate-800">
        <Trigger manager="npm" />
        <Trigger manager="yarn" />
        <Trigger manager="pnpm" />
        <Trigger manager="bun" />
        <TriggerGapFiller />
      </Tabs.List>
      <Command
        manager="npm"
        subCommand="install"
        options={devDependencies ? ["--save-dev"] : undefined}
        packages={packages}
      />
      <Command
        manager="yarn"
        subCommand="add"
        options={devDependencies ? ["--dev"] : undefined}
        packages={packages}
      />
      <Command
        manager="pnpm"
        subCommand="add"
        options={devDependencies ? ["--save-dev"] : undefined}
        packages={packages}
      />
      <Command
        manager="bun"
        subCommand="add"
        options={devDependencies ? ["--dev"] : undefined}
        packages={packages}
      />
    </Tabs.Root>
  );
}
