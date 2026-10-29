import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT } from "../lib/theme";
import { fade, springSteps, step } from "../lib/time";
import { Desktop, ON_NOTCH } from "../ui/Desktop";
import { Cursor, Move } from "../ui/Cursor";
import { Icon } from "../ui/Icons";
import { Captions, ChapterTitle } from "../ui/Kit";
import { Notch, Page, TabBar } from "../ui/Notch";
import type { SceneDef, SceneProps } from "./types";

// The Hiệu năng page: temperature, fan and a live 2-minute chart on the left; memory and the heaviest processes on the right.
// The notch opens, the chart runs, CPU switches to RAM, then it closes to a strip with "62°" and "68%".

const T = { open: 50, ram: 108, fan: 138, close: 198, end: 240 } as const;

const PX = 476, PY = 68;
const at = (x: number, y: number) => ({ x: PX + x, y: PY + y });
const RX = 292, COL_W = 268;
const PICK = { x: RX, y: 82, w: 44 };

const moves: Move[] = [
  { f: 0, x: 980, y: 330 },
  { f: T.open - 2, x: 760, y: 16, d: 28 },
  { f: T.ram - 2, ...at(PICK.x + 2 + PICK.w * 1.5, PICK.y + 10), d: 30 },
  { f: T.fan, ...at(120, 158), d: 24 },
  { f: T.close - 2, x: 940, y: 340, d: 22 },
];
const clicks = [T.ram];

const PROCS = [
  { name: "Trình duyệt", color: "#5b8def", cpu: "12.3%", ram: "3,4 GB" },
  { name: "Xcode", color: "#4ab0e8", cpu: "8.1%", ram: "2,9 GB" },
  { name: "Trình soạn mã", color: "#8a6cf0", cpu: "5.6%", ram: "1,6 GB" },
  { name: "Terminal", color: "#9ca3af", cpu: "3.2%", ram: "1,1 GB" },
  { name: "Thiết kế", color: "#d9739a", cpu: "1.9%", ram: "0,8 GB" },
];

/** One sample of the temperature curve: a slow wave plus two faster ones, scrolling left as the frame advances. */
const wave = (j: number) => 0.5 + 0.2 * Math.sin(j * 0.31) + 0.11 * Math.sin(j * 0.87 + 1) + 0.06 * Math.sin(j * 2.3 + 2);

const Chart: React.FC<{ frame: number; w: number; h: number }> = ({ frame, w, h }) => {
  const N = 48;
  const shift = frame * 0.22;
  const pts = Array.from({ length: N }, (_, i) => [(i / (N - 1)) * w, h - 4 - wave(i + shift) * (h - 8)] as const);
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 70 }}>
      {[0.25, 0.5, 0.75].map((g) => <line key={g} x1={0} x2={w} y1={h * g} y2={h * g} stroke={C.fill(0.07)} strokeWidth={1} />)}
      <polygon points={`0,${h} ${line} ${w},${h}`} fill="rgba(255,159,10,.13)" />
      <polyline points={line} fill="none" stroke={C.orange} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

const Mini: React.FC<{ label: string; value: string; pct: number; color: string; top: number }> = ({ label, value, pct, color, top }) => (
  <div style={{ position: "absolute", left: 152, width: 116, top, height: 16, display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
    <span style={{ width: 26, fontWeight: 600, color: C.text2 }}>{label}</span>
    <span style={{ flex: 1, height: 4, borderRadius: 2, background: C.fill(0.12), overflow: "hidden" }}>
      <i style={{ display: "block", width: `${pct * 100}%`, height: "100%", background: color }} />
    </span>
    <span style={{ width: 26, textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{value}</span>
  </div>
);

const Big: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 0, top: 13, fontFamily: FONT.display, fontWeight: 800, fontSize: 36, lineHeight: 1, letterSpacing: "-.02em" }}>{children}</div>
);

const PerformanceScene: React.FC<SceneProps> = ({ title = true }) => {
  const f = useCurrentFrame();
  const open = springSteps(f, [[0, 0], [T.open, 1], [T.close, 0]]);
  const live = springSteps(f, [[0, 0], [T.close, 1]]);
  const mode = step(f, [[0, "cpu"], [T.ram, "ram"]] as const);
  const fanOn = fade(f, T.fan, T.close, 8, 6);
  const cpuT = 0.62 + 0.04 * Math.sin(f * 0.09 + 1);
  const gpuT = 0.5 + 0.05 * Math.sin(f * 0.11);

  return (
    <>
      <Desktop camera={ON_NOTCH}>
        <Notch
          open={open}
          live={live}
          contentH={236}
          leading={(
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: FONT.ui, fontWeight: 700, fontSize: 13, color: C.orange }}>
              <Icon name="thermometer" size={13} stroke={2.2} />62°
            </span>
          )}
          trailing={(
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: FONT.ui, fontWeight: 700, fontSize: 13, color: C.cyan }}>
              68%<Icon name="chip" size={13} stroke={2.2} />
            </span>
          )}
        >
          <TabBar active={6} badge="gauge" />
          <Page style={{ fontFamily: FONT.ui, color: C.text }}>
            <div style={{ position: "absolute", left: RX - 12, top: 0, bottom: 0, width: 1, background: C.fill(0.08) }} />

            {/* Left: temperature */}
            <div style={{ position: "absolute", left: 0, top: 0, width: COL_W }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: C.text2, height: 13 }}>
                <i style={{ width: 7, height: 7, borderRadius: 4, background: C.yellow }} />SoC
              </div>
              <Big>62°</Big>
              <div style={{ position: "absolute", left: 74, top: 31, fontSize: 12, fontWeight: 600, color: C.text2, whiteSpace: "nowrap" }}>18% CPU</div>
              <Mini label="CPU" value="61°" pct={cpuT} color={C.orange} top={9} />
              <Mini label="GPU" value="54°" pct={gpuT} color={C.cyan} top={29} />
              <div style={{ position: "absolute", left: 0, top: 54, fontSize: 10.5, fontWeight: 500, color: C.text3 }}>2 phút gần nhất</div>
              <Chart frame={f} w={COL_W} h={62} />
              <div style={{ position: "absolute", left: -6, right: -6, top: 142, height: 36, borderRadius: 6, background: C.fill(0.07 * fanOn) }} />
              <div style={{ position: "absolute", left: 0, top: 146, width: COL_W, display: "flex", alignItems: "baseline", gap: 8, fontSize: 11.5 }}>
                <span style={{ fontWeight: 600, color: C.text2 }}>Quạt 1</span>
                <span style={{ fontWeight: 700 }}>2 400 vòng/phút</span>
              </div>
              <div style={{ position: "absolute", left: 0, top: 166, width: COL_W, height: 5, borderRadius: 3, background: C.fill(0.12) }}>
                <i style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "26%", borderRadius: 3, background: C.cyan }} />
              </div>
            </div>

            {/* Right: memory */}
            <div style={{ position: "absolute", left: RX, top: 0, width: COL_W }}>
              <div style={{ display: "flex", alignItems: "center", fontSize: 11, fontWeight: 600, color: C.text2, height: 13 }}>Bộ nhớ</div>
              <Big>68%</Big>
              <div style={{ position: "absolute", left: 90, top: 31, fontSize: 11.5, fontWeight: 600, color: C.text2, whiteSpace: "nowrap" }}>17,4 GB / 24 GB</div>
              <div style={{ position: "absolute", left: 190, width: 78, top: 9, fontSize: 11, display: "flex", justifyContent: "space-between", height: 16, alignItems: "center" }}>
                <span style={{ fontWeight: 600, color: C.text2 }}>Swap</span><span style={{ fontWeight: 700 }}>1,8 GB</span>
              </div>
              <div style={{ position: "absolute", left: 190, width: 78, top: 29, fontSize: 11, display: "flex", justifyContent: "space-between", height: 16, alignItems: "center" }}>
                <span style={{ fontWeight: 600, color: C.text2 }}>Nén</span><span style={{ fontWeight: 700 }}>2,4 GB</span>
              </div>
              <div style={{ position: "absolute", left: 0, top: 54, width: COL_W, height: 6, borderRadius: 3, background: C.fill(0.12) }}>
                <i style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "68%", borderRadius: 3, background: C.blue }} />
              </div>
              <div style={{ position: "absolute", left: 0, top: 65, display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, color: C.text2 }}>
                <i style={{ width: 7, height: 7, borderRadius: 4, background: C.green }} />Áp lực: Bình thường
              </div>
              <div style={{ position: "absolute", left: 0, top: PICK.y, display: "flex", gap: 2, padding: 2, borderRadius: 7, background: C.fill(0.08) }}>
                {(["cpu", "ram"] as const).map((k) => (
                  <span
                    key={k}
                    style={{
                      width: PICK.w, textAlign: "center", fontSize: 11, fontWeight: 700, padding: "2px 0", borderRadius: 5, letterSpacing: ".02em",
                      background: mode === k ? C.fill(0.2) : "transparent", color: mode === k ? "#fff" : C.text2,
                    }}
                  >
                    {k.toUpperCase()}
                  </span>
                ))}
              </div>
              {PROCS.map((p, i) => (
                <div key={p.name} style={{ position: "absolute", left: 0, width: COL_W, top: 108 + i * 14.6, height: 14, display: "flex", alignItems: "center", gap: 7, fontSize: 11 }}>
                  <i style={{ width: 9, height: 9, borderRadius: 2.5, background: p.color }} />
                  <span style={{ flex: 1, fontWeight: 500 }}>{p.name}</span>
                  <span style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{mode === "cpu" ? p.cpu : p.ram}</span>
                </div>
              ))}
            </div>
          </Page>
        </Notch>
        <Cursor frame={f} moves={moves} clicks={clicks} />
      </Desktop>
      <Captions
        frame={f}
        label="Hiệu năng"
        lines={[
          { f: 52, to: 124, text: "Nhiệt độ, quạt, bộ nhớ và tiến trình nặng nhất" },
          { f: 130, to: 198, text: "Đường cong quạt của bạn, qua helper tuỳ chọn" },
        ]}
      />
      {title && <ChapterTitle frame={f} title="Hiệu năng" sub="Nhiệt độ, quạt, bộ nhớ ngay trong notch" />}
    </>
  );
};

export const performance: SceneDef = { id: "performance", label: "Hiệu năng", dur: T.end, Comp: PerformanceScene };
