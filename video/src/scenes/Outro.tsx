import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT, VIDEO } from "../lib/theme";
import { fade, kf, pop, springSteps } from "../lib/time";
import { Bars } from "../ui/Kit";
import { Icon } from "../ui/Icons";
import { Notch } from "../ui/Notch";
import { Laptop } from "./Laptop";
import type { SceneDef, SceneProps } from "./types";

// The camera pulls back out of the screen to the MacBook; the notch opens on the name, then where to get it.
const T = { pull: 0, settle: 70, open: 80, words: 96, links: 120, end: 240 } as const;

const OutroScene: React.FC<SceneProps> = () => {
  const f = useCurrentFrame();
  const fullW = VIDEO.w / (1 - 2 * 0.012);
  const width = kf(f, [[0, fullW], [T.settle, 900]]);
  const y = kf(f, [[0, -fullW * 0.012], [T.settle, 380]]);
  const open = springSteps(f, [[0, 0], [T.open, 1]]);
  const words = fade(f, T.words, T.end + 20, 14, 1);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Laptop width={width} x={VIDEO.w / 2} y={y}>
        <Notch open={open} live={1} contentH={120} openW={520}
          leading={<span style={{ width: 16, height: 16, borderRadius: 4, background: C.accent }} />}
          trailing={<Bars frame={f} />}
        >
          <div style={{ position: "absolute", inset: 0, top: 30, display: "flex", alignItems: "center", justifyContent: "center", gap: 18, fontFamily: FONT.display, fontWeight: 800, fontSize: 52, color: "#fff" }}>
            <span style={{ width: 22, height: 22, borderRadius: 6, background: C.accent }} />MyNotch
          </div>
        </Notch>
      </Laptop>
      <div style={{ position: "absolute", left: 0, right: 0, top: 96, textAlign: "center", opacity: words, transform: `translateY(${(1 - pop(f, T.words)) * 20}px)`, fontFamily: FONT.ui }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 84, color: "#fafafa", letterSpacing: "-.02em" }}>Notch, đủ việc trong ngày.</div>
        <div style={{ fontSize: 30, color: "#a1a1aa", marginTop: 12 }}>macOS 26 trở lên · Mac Apple silicon · Dữ liệu ở trên máy</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 90, display: "flex", justifyContent: "center", gap: 28, opacity: fade(f, T.links, T.end + 20, 14, 1), fontFamily: FONT.ui, fontSize: 28, color: "#fafafa" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "12px 20px", borderRadius: 6, background: C.accent }}>
          <Icon name="download" size={26} /> github.com/DattruongRyan1912/mynotch-app
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "12px 20px", borderRadius: 6, border: "1px solid #3f3f46" }}>
          <Icon name="globe" size={26} /> mynotch.truongquocdat.id.vn
        </span>
      </div>
    </AbsoluteFill>
  );
};

export const outro: SceneDef = { id: "outro", label: "Kết", dur: T.end, Comp: OutroScene };
