"use client";

import * as RadioGroup from "@radix-ui/react-radio-group";

type Sample = {
  name: string;
  description: string;
};

type Props = {
  samples: Array<Sample>;
  value: string;
  onValueChange: (value: string) => void;
};

export function SampleChooser({ value, onValueChange, samples }: Props) {
  return (
    <RadioGroup.Root
      className="flex w-full flex-wrap items-center justify-center gap-2 md:w-fit md:flex-col"
      value={value}
      onValueChange={onValueChange}
    >
      {samples.map((sample, idx) => (
        <RadioGroup.Item
          key={idx}
          value={String(idx)}
          title={sample.description}
          className="dark:bg-base-950 dark:hover:bg-base-900 hover:border-primary-300 border-base-300 aria-checked:border-primary-600 inline-flex items-center gap-2 rounded-md border-2 bg-white px-4 py-2 text-xl shadow-md md:w-full"
        >
          <div className="bg-base-200 border-base-300 flex size-4 items-center justify-center rounded-full border shadow-inner">
            <RadioGroup.Indicator className="bg-primary-600 block size-3 rounded-full" />
          </div>
          <span className="text-nowrap font-bold">{sample.name}</span>
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}
