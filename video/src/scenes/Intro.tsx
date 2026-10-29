import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT, VIDEO } from "../lib/theme";
import { fade, kf, pop, springSteps } from "../lib/time";
import { Bars } from "../ui/Kit";
import { Notch } from "../ui/Notch";
import { Laptop } from "./Laptop";
import type { SceneDef, SceneProps } from "./types";

// A MacBook in the dark; its notch wakes with a song, the name comes up, then the camera falls into the screen.
const T = { lid: 0, live: 46, name: 70, line: 96, push: 176, end: 240 } as const;

const IntroScene: React.FC<SceneProps> = () => {
  const f = useCurrentFrame();
  const live = springSteps(f, [[0, 0], [T.live, 1]]);
  const push = kf(f, [[T.push, 0], [T.end, 1]]);
  // The lid grows until its screen fills the video exactly, handing over to the next chapter's full-screen desktop.
  const fullW = VIDEO.w / (1 - 2 * 0.012);
  const width = kf(f, [[0, 1040], [T.push, 1120], [T.end, fullW]]);
  const y = kf(f, [[0, 300], [T.push, 280], [T.end, -fullW * 0.012]]);
  const words = fade(f, T.name, T.push + 10, 12, 14);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Laptop width={width} x={VIDEO.w / 2} y={y} opacity={kf(f, [[0, 0], [16, 1]])}>
        <Notch
          live={live}
          leading={<span style={{ width: 16, height: 16, borderRadius: 4, background: C.accent }} />}
          trailing={<Bars frame={f} />}
        />
      </Laptop>
      <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", opacity: words * (1 - push), transform: `translateY(${(1 - pop(f, T.name)) * 24}px)` }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 120, letterSpacing: "-.02em", color: "#fafafa", lineHeight: 1 }}>MyNotch</div>
        <div style={{ fontFamily: FONT.ui, fontSize: 34, color: "#a1a1aa", marginTop: 14, opacity: fade(f, T.line, T.push + 10, 12, 14) }}>Notch không còn là khoảng trống.</div>
      </div>
      <div style={{ position: "absolute", inset: 0, background: C.ink, opacity: kf(f, [[0, 1], [12, 0]]) }} />
    </AbsoluteFill>
  );
};

export const intro: SceneDef = { id: "intro", label: "Mở đầu", dur: T.end, Comp: IntroScene };
