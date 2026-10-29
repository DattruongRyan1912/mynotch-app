import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT } from "../lib/theme";
import { fade, kf, springSteps } from "../lib/time";
import { Desktop, ON_NOTCH } from "../ui/Desktop";
import { Cursor, Move } from "../ui/Cursor";
import { Icon } from "../ui/Icons";
import { Captions, ChapterTitle } from "../ui/Kit";
import { Notch, Page, TabBar, hexA } from "../ui/Notch";
import type { SceneDef, SceneProps } from "./types";

// Âm thanh: the EQ tab (it lives under "Khác"). Profile menu, ten vertical sliders, a drag on the 125 Hz band.

const T = { arrive: 34, open: 36, menu: 66, pick: 88, swapA: 90, swapB: 122, dragA: 142, dragB: 176, end: 210 } as const;

// Page origin in screen points (open notch 600 wide): page (0, 0) is screen (476, 68).
const PX = 476, PY = 68;
const at = (x: number, y: number) => ({ x: PX + x, y: PY + y });

// Page layout (points): profile row, preamp row, ten sliders (70 high) with labels, status line.
const PAGE_W = 560;
const BAND_W = PAGE_W / 10;
const TRACK_TOP = 54, TRACK_H = 70, TRAVEL = 30;
const knobY = (db: number) => TRACK_TOP + TRACK_H / 2 - (db / 12) * TRAVEL;
const LABELS = ["32", "64", "125", "250", "500", "1k", "2k", "4k", "8k", "16k"];
const NHAC = [4, 3, 1.5, 0, -1.5, -1, 0.5, 2, 3.5, 4];
const PHIM = [5, 4.5, 2.5, 0.5, -0.5, 1.5, 3.5, 3, 1.5, 0];
const PRE_NHAC = -3, PRE_PHIM = -4.5;
const DRAG_TO = 7;
const PROFILES = ["Nhạc", "Phim", "Họp"];

/** What the app prints for a gain: half decibels, a comma, "-" for less. */
function gainText(db: number): string {
  const v = Math.round(db * 2) / 2;
  let n = Math.abs(v).toFixed(1);
  if (n.endsWith(".0")) n = n.slice(0, -2);
  if (n === "0") return "0 dB";
  return `${v < 0 ? "-" : "+"}${n.replace(".", ",")} dB`;
}

/** Gain of one band at a frame: Nhạc until the profile changes, Phim after, and the 125 Hz band dragged up at the end. */
function gain(f: number, i: number): number {
  if (i === 2) return kf(f, [[T.swapA, NHAC[2]], [T.swapB, PHIM[2]], [T.dragA, PHIM[2]], [T.dragB, DRAG_TO]]);
  return kf(f, [[T.swapA, NHAC[i]], [T.swapB, PHIM[i]]]);
}

const moves: Move[] = [
  { f: 0, x: 980, y: 330 },
  { f: T.arrive, x: 760, y: 16, d: 20 },
  { f: T.menu - 3, ...at(37, 11), d: 22 },
  { f: T.pick - 2, ...at(48, 63), d: 16 },
  { f: T.dragA - 2, ...at(BAND_W * 2 + BAND_W / 2, knobY(PHIM[2])), d: 22 },
  { f: T.dragB, ...at(BAND_W * 2 + BAND_W / 2, knobY(DRAG_TO)), d: T.dragB - T.dragA },
];
const clicks = [T.menu, T.pick, T.dragA];

const Pen: React.FC = () => (
  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20l1-5L16 4l4 4L9 19z" />
  </svg>
);
const Minus: React.FC = () => (
  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round">
    <path d="M5 12h14" />
  </svg>
);
const Wave: React.FC = () => (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
    <path d="M4 10v4M8 6v12M12 3v18M16 7v10M20 10v4" />
  </svg>
);
const UpDown: React.FC = () => (
  <svg width={8} height={11} viewBox="0 0 12 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 6L6 2.5 9.5 6M2.5 10L6 13.5 9.5 10" />
  </svg>
);

const Toggle: React.FC<{ on?: boolean; w?: number; h?: number }> = ({ on = true, w = 26, h = 15 }) => (
  <span style={{ position: "relative", display: "inline-block", width: w, height: h, borderRadius: h / 2, background: on ? C.accent : C.fill(0.2), flex: "none" }}>
    <i style={{ position: "absolute", top: 1.5, left: on ? w - h + 1.5 : 1.5, width: h - 3, height: h - 3, borderRadius: h, background: "#fff" }} />
  </span>
);

const IconBtn: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ width: 22, height: 22, borderRadius: 11, background: C.fill(0.12), display: "grid", placeItems: "center", color: C.text }}>{children}</span>
);

/** A setting's name over the screen, in video pixels, under the notch: a short tag in the style of the tour's captions. */
const Tag: React.FC<{ frame: number; from: number; to: number; text: string; top: number }> = ({ frame, from, to, text, top }) => {
  const o = fade(frame, from, to, 8, 8);
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: "absolute", left: 960, top, transform: `translate(-50%, ${(1 - o) * 8}px)`, opacity: o, display: "flex", alignItems: "center", gap: 14,
        padding: "10px 18px", borderRadius: 6, background: "rgba(9,9,11,.82)", border: "1px solid #27272a", fontFamily: FONT.ui, fontSize: 24, fontWeight: 600, color: "#e4e4e7",
      }}
    >
      {text}
      <Toggle w={40} h={22} />
    </div>
  );
};

const Band: React.FC<{ i: number; db: number; dragging: boolean }> = ({ i, db, dragging }) => {
  const cx = BAND_W * i + BAND_W / 2;
  const y = knobY(db);
  const mid = TRACK_TOP + TRACK_H / 2;
  return (
    <>
      <div style={{ position: "absolute", left: cx - 2, top: TRACK_TOP + 2, width: 4, height: TRACK_H - 4, borderRadius: 2, background: C.fill(0.14) }} />
      <div style={{ position: "absolute", left: cx - 7, top: mid - 0.5, width: 14, height: 1, background: C.fill(0.28) }} />
      <div style={{ position: "absolute", left: cx - 2, top: Math.min(y, mid), width: 4, height: Math.abs(y - mid), borderRadius: 2, background: C.accent }} />
      <div style={{ position: "absolute", left: cx - 6, top: y - 6, width: 12, height: 12, borderRadius: 6, background: "#fff", boxShadow: dragging ? `0 0 0 3px ${hexA(C.accent, 0.4)}` : "0 1px 2px rgba(0,0,0,.5)" }} />
      <div style={{ position: "absolute", left: cx - 20, width: 40, top: TRACK_TOP + TRACK_H + 3, textAlign: "center", fontSize: 9.5, fontWeight: 500, color: C.text2 }}>{LABELS[i]}</div>
    </>
  );
};

const EqualizerScene: React.FC<SceneProps> = ({ title = true }) => {
  const f = useCurrentFrame();
  const open = springSteps(f, [[0, 0], [T.open, 1]]);
  const menuO = kf(f, [[T.menu, 0], [T.menu + 5, 1], [T.pick + 1, 1], [T.pick + 7, 0]]);
  const profile = f > T.pick ? "Phim" : "Nhạc";
  const pre = kf(f, [[T.swapA, PRE_NHAC], [T.swapB, PRE_PHIM]]);
  const dragging = f >= T.dragA && f < T.dragB + 6;
  const preX = (db: number) => 52 + ((db + 12) / 24) * (416 - 52);

  return (
    <>
      <Desktop camera={ON_NOTCH}>
        <Notch open={open} contentH={226}>
          <TabBar active={6} badge="sliders" />
          <Page style={{ fontFamily: FONT.ui, color: C.text }}>
            {/* Profile row */}
            <div style={{ position: "absolute", left: 0, top: 0, height: 24, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 22, padding: "0 9px", borderRadius: 7, background: C.fill(0.12), fontSize: 12, fontWeight: 500 }}>
                {profile}
                <UpDown />
              </span>
              <IconBtn><Icon name="plus" size={11} stroke={2.6} /></IconBtn>
              <IconBtn><Pen /></IconBtn>
              <IconBtn><Minus /></IconBtn>
            </div>
            <div style={{ position: "absolute", right: 0, top: 0, height: 24, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>EQ</span>
              <Toggle />
            </div>

            {/* Preamp row */}
            <div style={{ position: "absolute", left: 0, top: 30, height: 18, width: PAGE_W, display: "flex", alignItems: "center" }}>
              <span style={{ width: 44, fontSize: 11, color: C.text2 }}>Preamp</span>
            </div>
            <div style={{ position: "absolute", left: 52, top: 37, width: 364, height: 4, borderRadius: 2, background: C.fill(0.14) }} />
            <div style={{ position: "absolute", left: Math.min(preX(pre), preX(0)), top: 37, width: Math.abs(preX(pre) - preX(0)), height: 4, borderRadius: 2, background: C.accent }} />
            <div style={{ position: "absolute", left: preX(pre) - 6, top: 33, width: 12, height: 12, borderRadius: 6, background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,.5)" }} />
            <div style={{ position: "absolute", left: 424, top: 30, width: 58, height: 18, display: "flex", alignItems: "center", justifyContent: "flex-end", fontSize: 11, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>{gainText(pre)}</div>
            <div style={{ position: "absolute", left: 490, top: 30 }}>
              <span style={{ display: "inline-flex", alignItems: "center", height: 18, padding: "0 9px", borderRadius: 6, background: C.fill(0.12), fontSize: 11, fontWeight: 500 }}>Về phẳng</span>
            </div>

            {/* Ten bands */}
            {LABELS.map((_, i) => <Band key={i} i={i} db={gain(f, i)} dragging={dragging && i === 2} />)}
            {dragging && (
              <div style={{ position: "absolute", left: BAND_W * 2 + BAND_W / 2 + 12, top: knobY(gain(f, 2)) - 9, height: 18, padding: "0 7px", borderRadius: 5, background: "#27272a", fontSize: 10.5, fontWeight: 600, display: "flex", alignItems: "center", fontVariantNumeric: "tabular-nums" }}>
                {gainText(gain(f, 2))}
              </div>
            )}

            {/* Status line */}
            <div style={{ position: "absolute", left: 0, top: 145, height: 20, display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.text2 }}>
              <Wave />
              Đang chỉnh: Loa MacBook Pro
            </div>

            {/* Profile list */}
            {menuO > 0 && (
              <div style={{ position: "absolute", left: 0, top: 28, width: 104, padding: 4, borderRadius: 8, background: "#232326", boxShadow: "0 0 0 1px rgba(255,255,255,.12), 0 10px 24px rgba(0,0,0,.5)", opacity: menuO, transform: `translateY(${(1 - menuO) * -4}px)`, zIndex: 5 }}>
                {PROFILES.map((p, i) => {
                  const hot = i === 1 && f >= T.pick - 6;
                  return (
                    <div key={p} style={{ height: 22, display: "flex", alignItems: "center", gap: 6, padding: "0 6px", borderRadius: 5, fontSize: 12, fontWeight: 500, background: hot ? C.accent : "transparent" }}>
                      <span style={{ width: 12, display: "grid", placeItems: "center" }}>{i === 0 && f < T.pick ? <Icon name="check" size={11} stroke={2.6} /> : null}</span>
                      {p}
                    </div>
                  );
                })}
              </div>
            )}
          </Page>
        </Notch>
        <Cursor frame={f} moves={moves} clicks={clicks} />
      </Desktop>
      <Tag frame={f} from={T.swapB + 8} to={T.end - 4} text="Bù âm khi nghe nhỏ" top={612} />
      <Captions
        frame={f}
        label="Âm thanh"
        lines={[
          { f: 48, to: 116, text: "10 băng tần ±12 dB, hồ sơ Nhạc, Phim, Họp" },
          { f: 124, to: 204, text: "Bù âm khi nghe nhỏ: tăng bass khi âm lượng thấp" },
        ]}
      />
      {title && <ChapterTitle frame={f} title="Âm thanh" sub="EQ cho cả máy" />}
    </>
  );
};

export const equalizer: SceneDef = { id: "equalizer", label: "Âm thanh", dur: T.end, Comp: EqualizerScene };
