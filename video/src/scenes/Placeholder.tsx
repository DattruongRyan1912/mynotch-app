import React from "react";
import { useCurrentFrame } from "remotion";
import { Desktop } from "../ui/Desktop";
import { ChapterTitle } from "../ui/Kit";
import { Notch } from "../ui/Notch";
import type { SceneDef } from "./types";

/** Holds a chapter's place in the tour until its scene is built. */
export function placeholder(id: string, label: string, dur: number): SceneDef {
  const Comp: React.FC = () => {
    const f = useCurrentFrame();
    return (
      <>
        <Desktop><Notch /></Desktop>
        <ChapterTitle frame={Math.min(f, 20)} title={label} sub="Đang dựng" />
      </>
    );
  };
  return { id, label, dur, Comp };
}
