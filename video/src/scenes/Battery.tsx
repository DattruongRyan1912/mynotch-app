import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT } from "../lib/theme";
import { kf, springSteps } from "../lib/time";
import { Desktop, ON_NOTCH } from "../ui/Desktop";
import { Cursor, Move } from "../ui/Cursor";
import { Icon } from "../ui/Icons";
import { Captions, ChapterTitle } from "../ui/Kit";
import { Notch, Page, TabBar } from "../ui/Notch";
import type { SceneDef, SceneProps } from "./types";

// The Battery page starts open on battery power. The pointer leaves, the notch closes, the charger goes in: a short notice on the collapsed notch,
// then the page again with the charging data (green fill, a glint sweeping across), then Low Power Mode (yellow fill).

const T = { close: 80, plug: 86, open: 126, low: 152, end: 180 } as const;

const REST = { x: 1004, y: 196 };
const moves: Move[] = [
  { f: 0, ...REST },
  { f: T.close - 2, x: 960, y: 330, d: 18 },
  { f: T.open - 4, x: 760, y: 16, d: 34 },
  { f: T.low - 2, ...REST, d: 22 },
];

const BODY_W = 546, BODY_H = 72, INNER = BODY_W - 8, PCT = 0.8;
const FILL_W = INNER * PCT;
const GREEN = [48, 209, 88], YELLOW = [255, 214, 10];
const rgb = (a: number[], b: number[], t: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
const DARK = "#06130a";

const Stat: React.FC<{ x: number; w: number; value: string; label: string }> = ({ x, w, value, label }) => (
  <div style={{ position: "absolute", left: x, top: 88, width: w }}>
    <div style={{ fontSize: 15, fontWeight: 700, lineHeight: "19px", whiteSpace: "nowrap" }}>{value}</div>
    <div style={{ fontSize: 11, fontWeight: 500, lineHeight: "15px", color: C.text2, whiteSpace: "nowrap" }}>{label}</div>
  </div>
);

const BatteryScene: React.FC<SceneProps> = ({ title = true }) => {
  const f = useCurrentFrame();
  const open = springSteps(f, [[0, 1], [T.close, 0], [T.open, 1]]);
  const live = springSteps(f, [[0, 0], [T.plug, 1], [T.open, 0]]);
  const charging = f >= T.plug;
  const contentH = springSteps(f, [[0, 190], [T.low, 216]]);
  const lowT = kf(f, [[T.low, 0], [T.low + 12, 1]]);
  const fill = charging ? rgb(GREEN, YELLOW, lowT) : "rgb(228,228,231)";
  const glintX = ((Math.max(0, f - T.open) % 60) / 60) * (FILL_W + 160) - 90;
  const stats = charging
    ? [["Đầy sau 1 giờ 5 phút", "Đang sạc"], ["Bộ sạc 96 W", "Nguồn"]]
    : [["7:15 còn lại", "Dùng pin"], ["Pin", "Nguồn"]];
  const pill = Math.min(1, Math.max(0, (f - T.low - 4) / 10));

  return (
    <>
      <Desktop camera={ON_NOTCH}>
        <Notch
          open={open}
          live={live}
          contentH={contentH}
          leading={<Icon name="bolt" size={16} color={C.green} stroke={2.2} />}
          trailing={<span style={{ fontFamily: FONT.ui, fontWeight: 700, fontSize: 13, color: C.green, fontVariantNumeric: "tabular-nums" }}>80%</span>}
        >
          <TabBar active={6} badge="battery" />
          <Page style={{ fontFamily: FONT.ui, color: C.text }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: BODY_W, height: BODY_H, borderRadius: 8, border: `2.5px solid ${C.fill(0.4)}`, boxSizing: "border-box", background: C.fill(0.05) }} />
            <div style={{ position: "absolute", left: BODY_W + 3, top: 23, width: 8, height: 26, borderRadius: 3, background: C.fill(0.4) }} />
            <div style={{ position: "absolute", left: 4, top: 4, width: FILL_W, height: BODY_H - 8, borderRadius: 5, background: fill, overflow: "hidden" }}>
              {charging && <div style={{ position: "absolute", top: -10, bottom: -10, left: glintX, width: 70, transform: "skewX(-22deg)", background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.5), rgba(255,255,255,0))" }} />}
            </div>
            <div style={{ position: "absolute", left: 4, top: 4, width: FILL_W, height: BODY_H - 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: DARK }}>
              {charging && <Icon name="bolt" size={30} stroke={2.4} />}
              <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 56, letterSpacing: "-.02em", lineHeight: 1 }}>80%</span>
            </div>
            <Stat x={0} w={200} value={stats[0][0]} label={stats[0][1]} />
            <Stat x={200} w={120} value={stats[1][0]} label={stats[1][1]} />
            <Stat x={320} w={130} value="79%" label="Dung lượng tối đa" />
            <Stat x={450} w={110} value="333" label="Chu kỳ sạc" />
            <div
              style={{
                position: "absolute", left: 0, top: 132, height: 22, padding: "0 10px", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(255,214,10,.14)", color: C.yellow, fontSize: 12, fontWeight: 600, opacity: pill, transform: `translateY(${(1 - pill) * 4}px)`,
              }}
            >
              <Icon name="battery" size={13} />
              Nguồn điện thấp: Đang bật
            </div>
          </Page>
        </Notch>
        <Cursor frame={f} moves={moves} />
      </Desktop>
      <Captions
        frame={f}
        label="Battery"
        lines={[
          { f: 46, to: 108, text: "Pin và bộ sạc, đủ chi tiết" },
          { f: 112, to: 176, text: "Cắm sạc là notch báo ngay" },
        ]}
      />
      {title && <ChapterTitle frame={f} title="Battery" sub="Pin, bộ sạc và Nguồn điện thấp" />}
    </>
  );
};

export const battery: SceneDef = { id: "battery", label: "Battery", dur: T.end, Comp: BatteryScene };
