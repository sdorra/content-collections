"use client";

import { Editor } from "@/components/Editor";
import { SampleChooser } from "./SampleChooser";
import { useState } from "react";

type Sample = {
  name: string;
  description: string;
  code: JSX.Element;
};

type Props = {
  samples: Array<Sample>;
};

export function TransformationPreviewer({ samples }: Props) {
  const [selectedSample, setSelectedSample] = useState("0");
  return (
    <div className="flex flex-col md:flex-row items-start justify-start mt-10 gap-5">
      <SampleChooser
        samples={samples}
        value={selectedSample}
        onValueChange={setSelectedSample}
      />
      <Editor className="min-w-0 w-full">{samples[Number(selectedSample)].code}</Editor>
    </div>
  );
}
