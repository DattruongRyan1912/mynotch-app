import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../lib/theme";
import { fade, prog } from "../lib/time";
import { Icon, IconName } from "./Icons";

// Small building blocks shared by the scenes. Sizes are in points (inside <Desktop>) unless the name says otherwise.

export const Btn: React.FC<{ children: React.ReactNode; active?: boolean; pressed?: boolean; tone?: string; style?: React.CSSProperties; icon?: IconName }> = ({
  children, active, pressed, tone, style, icon,
}) => (
  <span
    style={{
      display: "inline-flex", alignItems: "center", gap: 5, height: 24, padding: "0 10px", borderRadius: 6, fontSize: 12, fontWeight: 600,
      color: tone ? "#fff" : C.text, background: tone ?? (pressed ? C.fill(0.24) : active ? C.fill(0.18) : C.fill(0.1)), whiteSpace: "nowrap", ...style,
    }}
  >
    {icon && <Icon name={icon} size={13} />}
    {children}
  </span>
);

/** A keyboard key. */
export const Kbd: React.FC<{ children: React.ReactNode; px?: number }> = ({ children, px = 1 }) => (
  <span
    style={{
      display: "inline-flex", alignItems: "center", fontFamily: FONT.ui, fontWeight: 600, fontSize: 0.85 * 16 * px, lineHeight: 1, padding: `${4 * px}px ${8 * px}px`,
      borderRadius: 5 * px, border: `${px}px solid #3f3f46`, borderBottomWidth: 2 * px, background: "#18181b", color: "#fafafa", whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
);

/** A floating window (panel or app window) in points. */
export const Window: React.FC<{
  x: number; y: number; w: number; h: number; title?: string; show?: number; children?: React.ReactNode; chrome?: boolean; radius?: number; style?: React.CSSProperties;
}> = ({ x, y, w, h, title, show = 1, children, chrome = true, radius = 12, style }) => (
  <div
    style={{
      position: "absolute", left: x, top: y, width: w, height: h, borderRadius: radius, overflow: "hidden", zIndex: 10,
      background: "#1c1c1f", boxShadow: "0 0 0 1px rgba(255,255,255,.1), 0 24px 60px rgba(0,0,0,.55)", opacity: show,
      transform: `scale(${0.96 + 0.04 * show})`, transformOrigin: "50% 40%", fontFamily: FONT.ui, color: C.text, ...style,
    }}
  >
    {chrome && (
      <div style={{ height: 30, display: "flex", alignItems: "center", gap: 7, padding: "0 12px", borderBottom: "1px solid rgba(255,255,255,.07)", fontSize: 12.5, fontWeight: 600, color: C.text2 }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => <i key={c} style={{ width: 11, height: 11, borderRadius: 6, background: c }} />)}
        <span style={{ flex: 1, textAlign: "center", marginRight: 50 }}>{title}</span>
      </div>
    )}
    <div style={{ position: "absolute", left: 0, right: 0, top: chrome ? 30 : 0, bottom: 0 }}>{children}</div>
  </div>
);

export type CaptionLine = { f: number; to: number; text: string; keys?: string[] };

/** Lower-third caption in video pixels: the chapter's name and one sentence about what is on screen. */
export const Captions: React.FC<{ frame: number; label: string; lines: readonly CaptionLine[]; tag?: string }> = ({ frame, label, lines, tag }) => {
  const line = lines.find((l) => frame >= l.f && frame < l.to);
  if (!line) return null;
  const o = fade(frame, line.f, line.to, 8, 8);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute", left: 72, bottom: 64, maxWidth: 980, padding: "18px 24px", borderRadius: 6, fontFamily: FONT.ui,
          background: "rgba(9,9,11,.78)", border: "1px solid #27272a", backdropFilter: "blur(14px)", opacity: o, transform: `translateY(${(1 - o) * 12}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 17, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#b9a8ff" }}>
          <i style={{ width: 8, height: 8, borderRadius: 2, background: C.accent }} />
          {label}
          {tag && <span style={{ fontSize: 14, letterSpacing: ".04em", padding: "2px 8px", borderRadius: 4, border: "1px solid #3f3f46", color: "#a1a1aa" }}>{tag}</span>}
        </div>
        <div style={{ marginTop: 8, fontSize: 32, fontWeight: 600, lineHeight: 1.3, color: "#fafafa", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
          <span>{line.text}</span>
          {line.keys?.map((k) => <Kbd key={k} px={1.6}>{k}</Kbd>)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Big chapter title at the start of a scene, over a dimmed screen; gone by frame 42. */
export const ChapterTitle: React.FC<{ frame: number; title: string; sub?: string; n?: string }> = ({ frame, title, sub, n }) => {
  if (frame > 44) return null;
  const o = Math.min(prog(frame, 0, 8), 1 - prog(frame, 32, 12));
  return (
    <AbsoluteFill style={{ background: `rgba(5,5,7,${0.72 * o})`, display: "grid", placeItems: "center", pointerEvents: "none" }}>
      <div style={{ textAlign: "center", opacity: o, transform: `translateY(${(1 - o) * 20}px)` }}>
        {n && <div style={{ fontFamily: FONT.ui, fontSize: 22, fontWeight: 600, letterSpacing: ".14em", color: "#b9a8ff" }}>{n}</div>}
        <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 112, letterSpacing: "-.02em", color: "#fafafa", lineHeight: 1.05 }}>{title}</div>
        {sub && <div style={{ fontFamily: FONT.ui, fontSize: 30, color: "#a1a1aa", marginTop: 14 }}>{sub}</div>}
      </div>
    </AbsoluteFill>
  );
};

/** Four bouncing level bars; `level` 0 freezes them low. */
export const Bars: React.FC<{ frame: number; color?: string; h?: number; level?: number; seed?: number }> = ({ frame, color = C.accent, h = 14, level = 1, seed = 0 }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 2, height: h }}>
    {[0, 1, 2, 3].map((i) => {
      const v = 0.3 + 0.7 * level * Math.abs(Math.sin((frame + seed * 7) * 0.21 + i * 1.7) * Math.cos((frame + seed * 3) * 0.09 + i));
      return <i key={i} style={{ width: 3, height: h * v, borderRadius: 2, background: color }} />;
    })}
  </span>
);
