"use client";

import { Editor } from "@/components/Editor";
import { useState } from "react";
import { SampleChooser } from "./SampleChooser";

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
    <div className="mt-10 flex flex-col items-start justify-start gap-5 md:flex-row">
      <SampleChooser
        samples={samples}
        value={selectedSample}
        onValueChange={setSelectedSample}
      />
      <Editor className="w-full min-w-0">
        {samples[Number(selectedSample)].code}
      </Editor>
    </div>
  );
}
