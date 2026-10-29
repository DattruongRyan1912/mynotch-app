import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT } from "../lib/theme";
import { mmss, pop, springSteps, step } from "../lib/time";
import { Desktop, ON_NOTCH } from "../ui/Desktop";
import { Cursor, Move } from "../ui/Cursor";
import { Icon } from "../ui/Icons";
import { Btn, Captions, ChapterTitle } from "../ui/Kit";
import { Notch, Page, TabBar } from "../ui/Notch";
import type { SceneDef, SceneProps } from "./types";

// Reference scene: every other scene follows this shape.
// 1. Frames of each beat as constants. 2. Layout in fixed points so the cursor can aim at buttons.
// 3. State as functions of the frame. 4. <Desktop> with the notch and cursor, then captions and the chapter title on top.

const T = {
  arrive: 50, open: 52, start: 96, plus: 136, leave: 160,
  jump: 205, alert: 250, breakClick: 286, breakClose: 298, end: 330,
} as const;

// Page origin in screen points: the open notch is 600 wide, centred on 756; Page sits 20 in and 68 down.
const PX = 476, PY = 68;
const at = (x: number, y: number) => ({ x: PX + x, y: PY + y });
const BTN = { start: at(170, 56), plus: at(248, 108), brk: at(132, 90) };

const moves: Move[] = [
  { f: 0, x: 980, y: 380 },
  { f: T.arrive, x: 760, y: 16, d: 22 },
  { f: T.start - 4, ...BTN.start },
  { f: T.plus - 4, ...BTN.plus },
  { f: T.leave + 6, x: 930, y: 330, d: 18 },
  { f: T.breakClick - 4, ...BTN.brk, d: 22 },
  { f: T.end, x: 940, y: 340, d: 26 },
];
const clicks = [T.start, T.plus, T.breakClick];

const KINDS = ["Tập trung", "Nhắc việc", "Nghỉ", "Bấm giờ"];

/** Seconds left on the focus timer at a frame (the scene skips ahead at T.jump). */
function focusLeft(f: number): number {
  if (f < T.start) return 25 * 60;
  if (f < T.jump) return 25 * 60 + (f >= T.plus ? 60 : 0) - (f - T.start) / 30;
  return Math.max(0, 1.5 - (f - T.jump) / 30);
}

const Dial: React.FC<{ minutes: number; color: string; label: string }> = ({ minutes, color, label }) => {
  const r = 44, c = 2 * Math.PI * r;
  return (
    <svg width={104} height={104} viewBox="0 0 104 104" style={{ position: "absolute", left: 0, top: 30 }}>
      <circle cx={52} cy={52} r={r} fill="none" stroke={C.fill(0.12)} strokeWidth={6} />
      <circle cx={52} cy={52} r={r} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round"
        strokeDasharray={`${(c * Math.min(60, minutes)) / 60} ${c}`} transform="rotate(-90 52 52)" />
      <text x={52} y={55} textAnchor="middle" fill="#fff" fontFamily={FONT.ui} fontWeight={700} fontSize={28}>{label}</text>
      <text x={52} y={73} textAnchor="middle" fill={C.text2} fontFamily={FONT.ui} fontSize={11}>phút</text>
    </svg>
  );
};

const TimerScene: React.FC<SceneProps> = ({ title = true }) => {
  const f = useCurrentFrame();
  const open = springSteps(f, [[0, 0], [T.open, 1], [T.leave, 0], [T.alert, 1], [T.breakClose, 0]]);
  const live = springSteps(f, [[0, 0], [T.leave, 1], [T.alert, 1]]);
  const phase = step(f, [[0, "idle"], [T.start, "run"], [T.alert, "alert"], [T.breakClick, "break"]] as const);
  const left = phase === "break" ? 5 * 60 - (f - T.breakClick) / 30 : focusLeft(f);
  const tone = phase === "break" ? C.mint : C.orange;
  const kind = phase === "break" ? 2 : 0;
  const alertPulse = phase === "alert" ? pop(f, T.alert) : 0;

  return (
    <>
      <Desktop camera={ON_NOTCH}>
        <Notch
          open={open}
          live={live}
          contentH={phase === "alert" ? 150 : 190}
          leading={<Icon name="timer" size={16} color={tone} />}
          trailing={<span style={{ fontFamily: FONT.ui, fontWeight: 700, fontSize: 13, color: tone, fontVariantNumeric: "tabular-nums" }}>{mmss(left)}</span>}
        >
          <TabBar active={6} badge="timer" />
          <Page style={{ fontFamily: FONT.ui, color: C.text }}>
            {phase !== "alert" && (
              <div style={{ position: "absolute", left: 120, top: 0, display: "flex", gap: 2, padding: 2, borderRadius: 7, background: C.fill(0.08) }}>
                {KINDS.map((k, i) => (
                  <span key={k} style={{ fontSize: 11.5, fontWeight: 600, padding: "4px 12px", borderRadius: 5, background: i === kind ? C.fill(0.18) : "transparent", color: i === kind ? "#fff" : C.text2 }}>{k}</span>
                ))}
              </div>
            )}
            {phase === "idle" && (
              <>
                <Dial minutes={25} color={tone} label="25" />
                <div style={{ position: "absolute", left: 130, top: 44 }}><Btn tone={C.orange} pressed={f >= T.start - 2}>Bắt đầu</Btn></div>
                <div style={{ position: "absolute", left: 130, top: 80, display: "flex", gap: 6 }}>
                  <Btn>5 phút</Btn><Btn>10 phút</Btn><Btn>25 phút</Btn><Btn icon="chevron">Dài hơn</Btn>
                </div>
              </>
            )}
            {(phase === "run" || phase === "break") && (
              <>
                <Dial minutes={left / 60} color={tone} label={String(Math.ceil(left / 60))} />
                <div style={{ position: "absolute", left: 130, top: 34, fontSize: 46, fontWeight: 700, letterSpacing: ".01em", fontVariantNumeric: "tabular-nums" }}>{mmss(left)}</div>
                <div style={{ position: "absolute", left: 130, top: 96, display: "flex", gap: 6 }}>
                  <Btn>Tạm dừng</Btn><Btn pressed={f >= T.plus - 2 && f < T.plus + 6}>+1 phút</Btn><Btn>Huỷ</Btn>
                </div>
              </>
            )}
            {phase === "alert" && (
              <>
                <div style={{ position: "absolute", left: 0, top: 6, width: 64, height: 64, borderRadius: 32, background: "rgba(255,69,58,.18)", display: "grid", placeItems: "center", transform: `scale(${0.8 + 0.2 * alertPulse})` }}>
                  <Icon name="timer" size={30} color={C.red} />
                </div>
                <div style={{ position: "absolute", left: 84, top: 10, fontSize: 22, fontWeight: 700 }}>Hết giờ · Tập trung</div>
                <div style={{ position: "absolute", left: 84, top: 44, fontSize: 12.5, color: C.text2 }}>25 phút tập trung đã xong</div>
                <div style={{ position: "absolute", left: 84, top: 78, display: "flex", gap: 6 }}>
                  <Btn tone="#1f8f6a" pressed={f >= T.breakClick - 2}>Bắt đầu nghỉ</Btn><Btn>+5 phút</Btn><Btn>Tắt</Btn>
                </div>
              </>
            )}
          </Page>
        </Notch>
        <Cursor frame={f} moves={moves} clicks={clicks} />
      </Desktop>
      <Captions
        frame={f}
        label="Hẹn giờ"
        lines={[
          { f: 52, to: 156, text: "Tập trung, nhắc việc, nghỉ hoặc bấm giờ" },
          { f: 162, to: 246, text: "Notch thu gọn vẫn đếm ngược" },
          { f: 252, to: 330, text: "Hết giờ: bắt đầu nghỉ, thêm 5 phút hoặc tắt" },
        ]}
      />
      {f >= T.jump - 4 && f < T.jump + 24 && (
        <div style={{ position: "absolute", right: 80, top: 60, fontFamily: FONT.ui, fontSize: 26, fontWeight: 600, color: "#a1a1aa" }}>25 phút sau</div>
      )}
      {title && <ChapterTitle frame={f} title="Hẹn giờ" sub="Ngay trên notch, cả khi đang làm việc khác" />}
    </>
  );
};

export const timer: SceneDef = { id: "timer", label: "Hẹn giờ", dur: T.end, Comp: TimerScene };
