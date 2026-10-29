import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT } from "../lib/theme";
import { fade, kf, mmss, springSteps, step } from "../lib/time";
import { Desktop, ON_NOTCH } from "../ui/Desktop";
import { Cursor, Move } from "../ui/Cursor";
import { Icon } from "../ui/Icons";
import { Btn, Captions, ChapterTitle } from "../ui/Kit";
import { hexA, Notch, Page, TabBar } from "../ui/Notch";
import type { SceneDef, SceneProps } from "./types";

const T = { live: 38, warn: 96, card: 112, allow: 170, open: 202, rowClick: 306, close: 312, end: 420 } as const;

// Page origin in screen points (the open notch is 600 wide).
const PX = 476, PY = 68;

const moves: Move[] = [
  { f: 0, x: 1000, y: 330 },
  { f: T.allow - 4, x: 648, y: 98, d: 32 },
  { f: T.open - 5, x: 760, y: 17, d: 20 },
  { f: T.rowClick - 4, x: PX + 90, y: PY + 13, d: 44 },
  { f: T.end, x: 930, y: 280, d: 30 },
];
const clicks = [T.allow, T.open - 2, T.rowClick];

const CHIP = {
  run: { label: "Đang chạy", c: C.cyan },
  wait: { label: "Chờ bạn", c: C.orange },
  done: { label: "Xong", c: C.green },
  idle: { label: "Rảnh", c: "#a1a1aa" },
} as const;
type ChipKey = keyof typeof CHIP;

const SESSIONS: { name: string; tool: string; chip: ChipKey; time: string }[] = [
  { name: "mynotch • feat/modules", tool: "Bash  npm test", chip: "run", time: "" },
  { name: "api • fix/login", tool: "Edit  Auth.swift", chip: "wait", time: "0:41" },
  { name: "docs • main", tool: "", chip: "done", time: "5:02" },
  { name: "web • main", tool: "", chip: "idle", time: "" },
];

/** Seconds on the running session's clock (it starts at 2:14 when the activity appears). */
const clock = (f: number) => 134 + Math.max(0, f - T.live) / 30;

const Chip: React.FC<{ k: ChipKey; f: number }> = ({ k, f }) => {
  const { label, c } = CHIP[k];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 18, padding: "0 8px", borderRadius: 4, fontSize: 10.5, fontWeight: 700, color: c, background: hexA(c, 0.16), whiteSpace: "nowrap" }}>
      {k === "run" && <i style={{ width: 5, height: 5, borderRadius: 3, background: c, opacity: 0.6 + 0.4 * Math.sin(f * 0.2) }} />}
      {k === "done" && <Icon name="check" size={10} stroke={3} />}
      {label}
    </span>
  );
};

const SubBadge: React.FC = () => (
  <b style={{ position: "absolute", right: -8, top: -7, minWidth: 13, height: 13, borderRadius: 7, background: C.accent, color: "#fff", fontSize: 9, fontWeight: 700, display: "grid", placeItems: "center", fontFamily: FONT.ui }}>2</b>
);

const AIScene: React.FC<SceneProps> = ({ title = true }) => {
  const f = useCurrentFrame();
  const open = springSteps(f, [[0, 0], [T.open, 1], [T.close, 0]]);
  const live = springSteps(f, [[0, 0], [T.live, 1], [T.end - 20, 0]]);
  const strip = springSteps(f, [[0, 0], [T.card, 80], [T.allow + 4, 0]]);
  const phase = step(f, [[0, "run"], [T.warn, "ask"], [T.allow + 4, "run"], [T.close + 6, "done"]] as const);
  const tone = phase === "ask" ? C.orange : C.cyan;
  const pulse = 0.65 + 0.35 * Math.sin(f * 0.18);
  const btnOpacity = kf(f, [[T.card, 0.4], [T.card + 18, 0.4], [T.card + 23, 1]]);
  const pressed = f >= T.allow - 2 && f < T.allow + 6;
  const hover = fade(f, T.rowClick - 12, T.close, 6, 2);
  const secs = clock(f);

  const card = (
    <div style={{ width: 288, display: "flex", flexDirection: "column", gap: 5, fontFamily: FONT.ui, color: C.text, transform: "translateY(-1px)" }}>
      <div style={{ height: 16, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: FONT.mono, fontSize: 10.5, fontWeight: 500, padding: "1px 6px", borderRadius: 4, background: C.fill(0.16) }}>Bash</span>
        <span style={{ fontSize: 11, color: C.text2, whiteSpace: "nowrap" }}>Claude Code • mynotch</span>
      </div>
      <div style={{ height: 22, display: "flex", alignItems: "center", padding: "0 9px", borderRadius: 5, background: C.fill(0.09), fontFamily: FONT.mono, fontSize: 12, fontWeight: 500 }}>npm test</div>
      <div style={{ height: 24, display: "flex", gap: 6, opacity: btnOpacity }}>
        <Btn tone="#1f8f6a" pressed={pressed} style={{ width: 66, justifyContent: "center", filter: pressed ? "brightness(1.25)" : undefined }}>Cho phép</Btn>
        <Btn style={{ width: 58, justifyContent: "center" }}>Từ chối</Btn>
        <Btn style={{ width: 118, justifyContent: "center" }}>Hỏi trong terminal</Btn>
      </div>
    </div>
  );

  const leading =
    phase === "done" ? (
      <span style={{ width: 20, height: 20, borderRadius: 10, background: C.green, color: "#000", display: "grid", placeItems: "center" }}>
        <Icon name="check" size={13} stroke={3.2} />
      </span>
    ) : (
      <span style={{ position: "relative", display: "inline-flex", opacity: pulse }}>
        <Icon name="terminal" size={17} color={tone} />
        <SubBadge />
      </span>
    );
  const trailing =
    phase === "done" ? (
      <span style={{ fontFamily: FONT.ui, fontWeight: 700, fontSize: 12.5, color: C.green }}>Xong</span>
    ) : phase === "ask" ? (
      <span style={{ fontFamily: FONT.ui, fontWeight: 800, fontSize: 19, color: C.orange, lineHeight: 1 }}>!</span>
    ) : (
      <span style={{ fontFamily: FONT.ui, fontWeight: 700, fontSize: 13, color: C.text, fontVariantNumeric: "tabular-nums" }}>{mmss(secs)}</span>
    );

  return (
    <>
      <Desktop camera={ON_NOTCH}>
        <Notch open={open} live={live} strip={strip} contentH={236} leading={leading} trailing={trailing} stripContent={card}>
          <TabBar active={3} />
          <Page style={{ fontFamily: FONT.ui, color: C.text }}>
            {SESSIONS.map((s, i) => (
              <div
                key={s.name}
                style={{
                  position: "absolute", left: -4, right: -4, top: i * 28, height: 26, display: "flex", alignItems: "center", padding: "0 4px", borderRadius: 5,
                  background: i === 0 ? C.fill(0.07 * hover) : "transparent",
                }}
              >
                <span style={{ width: 18, display: "flex" }}><Icon name="terminal" size={14} color={CHIP[s.chip].c} /></span>
                <span style={{ width: 188, fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap" }}>{s.name}</span>
                <span style={{ width: 130, fontFamily: FONT.mono, fontSize: 10.5, color: C.text2, whiteSpace: "nowrap" }}>{s.tool}</span>
                <span style={{ width: 96 }}><Chip k={s.chip} f={f} /></span>
                <span style={{ flex: 1, textAlign: "right", fontSize: 11.5, color: C.text2, fontVariantNumeric: "tabular-nums" }}>{i === 0 ? mmss(secs) : s.time}</span>
              </div>
            ))}
            <div style={{ position: "absolute", left: 0, top: 116, display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, color: C.text2 }}>
              <Icon name="stack" size={13} />
              2 agent con đang chạy
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 144, height: 1, background: C.fill(0.1) }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 154, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11.5, color: C.text2, whiteSpace: "nowrap" }}>
              <span><b style={{ color: C.text, fontWeight: 600 }}>Claude Code</b> 1,2K token · $0.35 ước tính</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
                <b style={{ color: C.text, fontWeight: 600 }}>Codex</b>
                <Limit label="5 giờ" pct={62} />
                <Limit label="Tuần" pct={18} />
              </span>
            </div>
          </Page>
        </Notch>
        <Cursor frame={f} moves={moves} clicks={clicks} />
      </Desktop>
      <Captions
        frame={f}
        label="AI agents"
        lines={[
          { f: 46, to: 118, text: "Thấy agent đang chạy, chờ bạn hay đã xong" },
          { f: 124, to: 198, text: "Duyệt quyền ngay dưới notch" },
          { f: 208, to: 272, text: "Token và chi phí hôm nay" },
          { f: 278, to: 346, text: "Bấm một phiên để nhảy đúng tab terminal" },
        ]}
      />
      {title && <ChapterTitle frame={f} title="AI agents" sub="Claude Code và Codex, ngay trên notch" />}
    </>
  );
};

const Limit: React.FC<{ label: string; pct: number }> = ({ label, pct }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
    {label}
    <i style={{ position: "relative", width: 44, height: 4, borderRadius: 2, background: C.fill(0.14) }}>
      <i style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, borderRadius: 2, background: pct > 50 ? C.orange : C.green }} />
    </i>
    <span style={{ fontVariantNumeric: "tabular-nums", width: 26 }}>{pct}%</span>
  </span>
);

export const aiagents: SceneDef = { id: "aiagents", label: "AI agents", dur: T.end, Comp: AIScene };
