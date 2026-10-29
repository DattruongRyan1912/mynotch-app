import React from "react";
import { C, NOTCH, OPEN_W, SCREEN } from "../lib/theme";
import { Icon, IconName } from "./Icons";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Notch outline: a body with concave "ears" at the top corners and rounded bottom corners. */
function notchPath(w: number, h: number, e: number, r: number): string {
  const R = Math.min(r, h / 2, w / 2);
  return [
    `M0,0`, `H${w + 2 * e}`,
    `Q${w + e},0 ${w + e},${e}`,
    `V${h - R}`, `Q${w + e},${h} ${w + e - R},${h}`,
    `H${e + R}`, `Q${e},${h} ${e},${h - R}`,
    `V${e}`, `Q${e},0 0,0`, "Z",
  ].join(" ");
}

export type NotchProps = {
  /** 0 closed or collapsed … 1 open (spring progress). */
  open?: number;
  /** 0 … 1: how far a live activity has widened the collapsed notch. */
  live?: number;
  /** Height of the strip under the collapsed notch, in points (springed by the scene). */
  strip?: number;
  /** Open content height (tab bar included), points. */
  contentH?: number;
  openW?: number;
  /** 0 classic black … 1 Liquid Glass. */
  glass?: number;
  /** Liquid Glass "Độ trong": 0 Cân bằng … 1 Trong vắt. */
  clarity?: number;
  /** Collapsed notch: left and right of the camera. */
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  /** Under the collapsed notch. */
  stripContent?: React.ReactNode;
  /** The open notch's content (tab bar and page). */
  children?: React.ReactNode;
  /** Centre of the notch on the screen (multi-display scenes move it). */
  cx?: number;
  top?: number;
  /** Width of the hardware notch (a non-notch display passes its pill width). */
  bodyW?: number;
};

export const Notch: React.FC<NotchProps> = ({
  open = 0, live = 0, strip = 0, contentH = 190, openW = OPEN_W, glass = 0, clarity = 0,
  leading, trailing, stripContent, children, cx = SCREEN.w / 2, top = 0, bodyW = NOTCH.w,
}) => {
  const collapsedW = bodyW + 128 * live;
  const w = lerp(collapsedW, openW, open);
  const h = lerp(NOTCH.h + strip, NOTCH.h + contentH, open);
  const e = lerp(NOTCH.ear, 8, open);
  const r = lerp(10, 24, open);
  const path = notchPath(w, h, e, r);
  const liveOpacity = clamp01((live - 0.35) / 0.65) * clamp01(1 - open * 3);
  const openOpacity = clamp01((open - 0.55) / 0.45);
  const stripOpacity = clamp01((strip - 6) / 10) * clamp01(1 - open * 3);
  return (
    <div style={{ position: "absolute", top, left: cx - w / 2 - e, width: w + 2 * e, height: h, zIndex: 20 }}>
      <div
        style={{
          position: "absolute", inset: 0, clipPath: `path('${path}')`,
          background: glass > 0 ? `rgba(24,26,32,${lerp(1, 0.32 - 0.2 * clarity, glass)})` : "#000",
          backdropFilter: glass > 0 ? `blur(${18 * glass}px) saturate(${1 + 0.8 * glass})` : undefined,
        }}
      >
        {glass > 0 && (
          <div style={{ position: "absolute", inset: 0, opacity: glass, background: "linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,0) 40%, rgba(255,255,255,.05))" }} />
        )}
        <div style={{ position: "absolute", left: e, width: w, top: 0, height: NOTCH.h, opacity: liveOpacity }}>
          <div style={{ position: "absolute", left: 14, top: 0, bottom: 0, width: 58, display: "flex", alignItems: "center" }}>{leading}</div>
          <div style={{ position: "absolute", right: 14, top: 0, bottom: 0, width: 58, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>{trailing}</div>
        </div>
        <div style={{ position: "absolute", left: e, width: w, top: NOTCH.h, height: Math.max(0, strip), opacity: stripOpacity, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {stripContent}
        </div>
        <div
          style={{
            position: "absolute", left: e, width: w, top: NOTCH.h - 6, height: contentH, opacity: openOpacity,
            transform: `translateY(${(1 - open) * -10}px) scale(${0.96 + 0.04 * open})`, transformOrigin: "50% 0",
          }}
        >
          {children}
        </div>
      </div>
      {glass > 0 && (
        <svg width={w + 2 * e} height={h} style={{ position: "absolute", inset: 0, opacity: glass, pointerEvents: "none" }}>
          <path d={path} fill="none" stroke="rgba(255,255,255,.35)" strokeWidth={1} />
        </svg>
      )}
    </div>
  );
};

export type Tab = { icon: IconName };
export const MAIN_TABS: IconName[] = ["clipboard", "music", "translate", "terminal", "calendar", "checklist", "grid"];

/** The open notch's page bar: icons only, the current page filled with the accent. */
export const TabBar: React.FC<{ tabs?: IconName[]; active: number; badge?: IconName; accent?: string }> = ({
  tabs = MAIN_TABS, active, badge, accent = C.accent,
}) => (
  <div style={{ display: "flex", justifyContent: "center", gap: 6, paddingTop: 8, height: 34 }}>
    {tabs.map((t, i) => (
      <div
        key={t + i}
        style={{
          position: "relative", width: 30, height: 24, borderRadius: 6, display: "grid", placeItems: "center",
          background: i === active ? hexA(accent, 0.32) : "transparent", color: i === active ? C.text : C.text2,
        }}
      >
        <Icon name={t} size={15} />
        {badge && t === "grid" && (
          <div style={{ position: "absolute", right: -4, top: -3, width: 13, height: 13, borderRadius: 7, background: accent, display: "grid", placeItems: "center", color: "#fff" }}>
            <Icon name={badge} size={8} stroke={2.4} />
          </div>
        )}
      </div>
    ))}
  </div>
);

/** The page area under the tab bar. */
export const Page: React.FC<{ children?: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: "absolute", left: 20, right: 20, top: 40, bottom: 14, ...style }}>{children}</div>
);

/** Round bubble beside the notch for a waiting activity, or "+N". */
export const Bubble: React.FC<{ index: number; show: number; children?: React.ReactNode; cx?: number; notchW: number }> = ({
  index, show, children, cx = SCREEN.w / 2, notchW,
}) => {
  const d = NOTCH.h;
  return (
    <div
      style={{
        position: "absolute", top: 0, left: cx + notchW / 2 + 6 + 6 + index * (d + 6), width: d, height: d, borderRadius: d / 2,
        background: "#000", display: "grid", placeItems: "center", transform: `scale(${0.4 + 0.6 * show})`, opacity: show, zIndex: 19,
      }}
    >
      {children}
    </div>
  );
};

export function hexA(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
