import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT, SCREEN } from "../lib/theme";
import { kf, mmss, pop, prog, springSteps, step } from "../lib/time";
import { CameraState, Desktop, ON_NOTCH, WIDE, cameraAt } from "../ui/Desktop";
import { Cursor, Move, cursorAt } from "../ui/Cursor";
import { Icon } from "../ui/Icons";
import { Btn, Captions, ChapterTitle, Window } from "../ui/Kit";
import { hexA, Notch } from "../ui/Notch";
import type { SceneDef, SceneProps } from "./types";

// ── Beats (frames) ─────────────────────────────────────────────────────────────────────────────────────────────────────────
const T = {
  key: 48, dragA: 58, dragB: 98, release: 102, chip: 106, sua: 134,
  edit: 140, arrow0: 168, arrowA: 176, arrowB: 198, n1: 218, n2: 230, lens: 250, copy: 274, editEnd: 278,
  ocr: 284, toast: 310, toastEnd: 354,
  cd: 364, cd2: 384, cd1: 404, start: 424, stop: 494,
  rwin: 500, play: 512, add: 576, exp: 600, p0: 602, p1: 634, end: 660,
} as const;

// ── Geometry (screen points) ───────────────────────────────────────────────────────────────────────────────────────────────
const SEL = { x: 436, y: 190, w: 640, h: 360 };
const WIN = { x: 326, y: 52, w: 860, h: 530 };
const REC_H = 470;
const CONTENT = { x: WIN.x, y: WIN.y + 30 }; // window content origin (below the title bar)
const EDIT_CAM: CameraState = { zoom: 1.45, fx: 756, fy: 276 };

// Screenshot editor: tool bar, canvas (the capture drawn at 0.9), bottom buttons.
const TOOL_W = 82, TOOL_X = 16, TOOL_Y = 8;
const CANVAS = { x: 142, y: 105, s: 0.9 };
const onCanvas = (dx: number, dy: number) => ({ x: CONTENT.x + CANVAS.x + dx * CANVAS.s, y: CONTENT.y + CANVAS.y + dy * CANVAS.s });
const A0: [number, number] = [270, 160], A1: [number, number] = [192, 100];
const N1: [number, number] = [326, 71], N2: [number, number] = [326, 121];
const LENS = { cx: 470, cy: 292, r: 44 };
const COPY_BTN = { x: CONTENT.x + 750, y: CONTENT.y + 470 };

// Recording editor.
const R_PANEL = { x: CONTENT.x + 512, y: CONTENT.y + 14 };
const ADD_BTN = { x: R_PANEL.x + 84, y: R_PANEL.y + 112 };
const EXPORT_BTN = { x: R_PANEL.x + 166, y: R_PANEL.y + 168 };
const TL_X = 16, TL_W = 828, CLIP_S = 4;
const tx = (t: number) => TL_X + (t / CLIP_S) * TL_W;

// ── The captured window: a plain report in some other app ──────────────────────────────────────────────────────────────────
const DW = 640, DH = 360;
const BARS = [46, 62, 54, 78, 66, 92, 104];
const DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const ROWS: [string, string][] = [["Khách mới", "342"], ["Đơn hàng", "1.280"], ["Tỷ lệ chốt", "24%"], ["Hoàn tiền", "12"]];

const Doc: React.FC = () => (
  <div style={{ position: "relative", width: DW, height: DH, background: "#f1f1f4", fontFamily: FONT.ui, color: "#1c1c1e", overflow: "hidden" }}>
    <div style={{ height: 30, background: "#e4e4e8", borderBottom: "1px solid #cfcfd4", display: "flex", alignItems: "center", gap: 7, padding: "0 12px", fontSize: 12.5, fontWeight: 600, color: "#52525b" }}>
      {["#ff5f57", "#febc2e", "#28c840"].map((c) => <i key={c} style={{ width: 11, height: 11, borderRadius: 6, background: c }} />)}
      <span style={{ flex: 1, textAlign: "center", marginRight: 50 }}>Báo cáo tuần 43</span>
    </div>
    <div style={{ position: "absolute", left: 20, top: 46, width: 280, height: 294, borderRadius: 8, background: "#fff", boxShadow: "0 0 0 1px #e1e1e6" }}>
      <div style={{ position: "absolute", left: 16, top: 14, fontSize: 13, fontWeight: 600, color: "#71717a" }}>Doanh thu</div>
      <div style={{ position: "absolute", left: 16, top: 34, fontSize: 32, fontWeight: 700, letterSpacing: "-.01em" }}>128 triệu</div>
      {BARS.map((h, i) => (
        <React.Fragment key={i}>
          <i style={{ position: "absolute", left: 22 + i * 36, top: 270 - h * 1.4, width: 26, height: h * 1.4, borderRadius: 4, background: i === 6 ? "#0a84ff" : "#b9d6ff" }} />
          <span style={{ position: "absolute", left: 22 + i * 36, top: 274, width: 26, textAlign: "center", fontSize: 10.5, color: "#8e8e93" }}>{DAYS[i]}</span>
        </React.Fragment>
      ))}
    </div>
    <div style={{ position: "absolute", left: 320, top: 46, width: 300, height: 200, borderRadius: 8, background: "#fff", boxShadow: "0 0 0 1px #e1e1e6" }}>
      {ROWS.map(([k, v], i) => (
        <div key={k} style={{ position: "absolute", left: 22, right: 16, top: i * 50, height: 50, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: i < 3 ? "1px solid #ececf0" : "none" }}>
          <span style={{ fontSize: 13, color: "#52525b" }}>{k}</span>
          <span style={{ fontSize: 16, fontWeight: 700 }}>{v}</span>
        </div>
      ))}
    </div>
    <div style={{ position: "absolute", left: 320, top: 258, width: 300, height: 82, borderRadius: 8, background: "#fff", boxShadow: "0 0 0 1px #e1e1e6", padding: "12px 16px", fontSize: 12, lineHeight: 1.5, color: "#3f3f46" }}>
      Ghi chú: doanh thu tăng đều, nên chạy thêm chiến dịch cuối tuần cho khách mới.
    </div>
  </div>
);

// ── Editor pieces ──────────────────────────────────────────────────────────────────────────────────────────────────────────
const G: React.FC<{ d: string }> = ({ d }) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", flex: "none" }} dangerouslySetInnerHTML={{ __html: d }} />
);

const TOOLS: [string, string][] = [
  ["Mũi tên", '<path d="M5 19L19 5M9 5h10v10"/>'],
  ["Hình chữ nhật", '<rect x="4" y="6" width="16" height="12" rx="1.5"/>'],
  ["Chữ", '<path d="M5 6V4h14v2M12 4v16M9 20h6"/>'],
  ["Bút dạ quang", '<path d="M15 4l5 5-9 9H6l-2-2v-3z"/><path d="M4 21h8"/>'],
  ["Đánh số bước", '<circle cx="12" cy="12" r="8"/><path d="M10.5 10l1.8-1.5V16"/>'],
  ["Kính lúp", '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>'],
  ["Thước đo", '<rect x="3" y="8" width="18" height="8" rx="1.5"/><path d="M7 8v3M11 8v4M15 8v3"/>'],
  ["Che vùng", '<rect x="4" y="6" width="16" height="12" rx="1.5"/><path d="M9 6v12M14 6v12M4 12h16"/>'],
  ["Xoá thông minh", '<path d="M4 15l9-9 7 7-6 6H8z"/><path d="M9 11l7 7"/>'],
  ["Cắt", '<path d="M7 3v14h14M3 7h14v14"/>'],
];
const COLORS: [string, string][] = [["Đỏ", C.red], ["Vàng", C.yellow], ["Xanh lá", C.green], ["Xanh dương", C.blue], ["Đen", "#111111"]];

const Arrow: React.FC<{ a: [number, number]; b: [number, number]; p: number }> = ({ a, b, p }) => {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) * p;
  if (len < 18) return null;
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const tipX = a[0] + (b[0] - a[0]) * p, tipY = a[1] + (b[1] - a[1]) * p;
  const hx = tipX - Math.cos(ang) * 16, hy = tipY - Math.sin(ang) * 16;
  const nx = -Math.sin(ang) * 8, ny = Math.cos(ang) * 8;
  return (
    <>
      <line x1={a[0]} y1={a[1]} x2={hx} y2={hy} stroke={C.red} strokeWidth={4} strokeLinecap="round" />
      <polygon points={`${tipX},${tipY} ${hx + nx},${hy + ny} ${hx - nx},${hy - ny}`} fill={C.red} />
    </>
  );
};

const StepBadge: React.FC<{ at: [number, number]; n: number; p: number }> = ({ at, n, p }) =>
  p > 0.01 ? (
    <div style={{ position: "absolute", left: at[0] - 11, top: at[1] - 11, width: 22, height: 22, borderRadius: 11, background: C.red, color: "#fff", fontSize: 13, fontWeight: 700, display: "grid", placeItems: "center", transform: `scale(${p})` }}>{n}</div>
  ) : null;

const Lens: React.FC<{ p: number }> = ({ p }) => {
  if (p < 0.01) return null;
  const { cx, cy, r } = LENS;
  return (
    <div style={{ position: "absolute", left: cx - r, top: cy - r, width: 2 * r, height: 2 * r, borderRadius: r, overflow: "hidden", background: "#f1f1f4", boxShadow: `0 0 0 3px ${C.red}, 0 4px 14px rgba(0,0,0,.35)`, transform: `scale(${p})` }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: DW, height: DH, transformOrigin: "0 0", transform: `translate(${r - cx * 2}px, ${r - cy * 2}px) scale(2)` }}><Doc /></div>
    </div>
  );
};

const CaptureEditor: React.FC<{ f: number; show: number }> = ({ f, show }) => {
  const tool = step(f, [[0, 0], [T.n1 - 8, 4], [T.lens - 8, 5]] as const);
  const arrowP = kf(f, [[T.arrowA, 0], [T.arrowB, 1]]);
  const copyPressed = f >= T.copy - 2 && f < T.copy + 5;
  return (
    <Window x={WIN.x} y={WIN.y} w={WIN.w} h={WIN.h} title="Sửa ảnh chụp" show={show} radius={8}>
      <div style={{ position: "absolute", left: TOOL_X, top: TOOL_Y, display: "flex" }}>
        {TOOLS.map(([name, d], i) => (
          <div
            key={name}
            style={{
              width: TOOL_W, height: 46, borderRadius: 6, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
              background: i === tool ? C.fill(0.16) : "transparent", color: i === tool ? "#fff" : C.text2, fontSize: 10.5, fontWeight: 500, whiteSpace: "nowrap",
            }}
          >
            <G d={d} />
            {name}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 16, top: 62, display: "flex", alignItems: "center", gap: 10 }}>
        {COLORS.map(([name, c], i) => (
          <i key={name} style={{ width: 18, height: 18, borderRadius: 9, background: c, boxShadow: i === 0 ? `0 0 0 2px #1c1c1f, 0 0 0 3.5px ${C.text}` : "0 0 0 1px rgba(255,255,255,.25)" }} />
        ))}
        <span style={{ marginLeft: 4, fontSize: 11.5, fontWeight: 500, color: C.text2 }}>Đỏ</span>
      </div>
      <div style={{ position: "absolute", left: 16, right: 16, top: 94, height: 346, borderRadius: 6, background: "#111113" }} />
      <div style={{ position: "absolute", left: CANVAS.x, top: CANVAS.y, width: DW * CANVAS.s, height: DH * CANVAS.s, boxShadow: "0 6px 20px rgba(0,0,0,.5)" }}>
        <div style={{ position: "relative", width: DW, height: DH, transform: `scale(${CANVAS.s})`, transformOrigin: "0 0" }}>
          <Doc />
          <svg width={DW} height={DH} style={{ position: "absolute", left: 0, top: 0 }}><Arrow a={A0} b={A1} p={arrowP} /></svg>
          <StepBadge at={N1} n={1} p={pop(f, T.n1)} />
          <StepBadge at={N2} n={2} p={pop(f, T.n2)} />
          <Lens p={pop(f, T.lens)} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 448, height: 1, background: "rgba(255,255,255,.08)" }} />
      <div style={{ position: "absolute", right: 16, top: 456, display: "flex", gap: 8 }}>
        <Btn style={{ width: 56, height: 28, fontSize: 13, justifyContent: "center" }}>Huỷ</Btn>
        <Btn pressed={copyPressed} style={{ width: 60, height: 28, fontSize: 13, justifyContent: "center" }}>Chép</Btn>
        <Btn tone={C.accent} style={{ width: 56, height: 28, fontSize: 13, justifyContent: "center" }}>Lưu</Btn>
      </div>
    </Window>
  );
};

// Recording editor: preview with auto zoom, a timeline with a zoom lane (yellow dot per click), export level and the Export button.
const CLICKS = [0.8, 1.2, 3.2, 3.5];
const ZOOMS = [{ a: 0.5, b: 1.5, fx: 442, fy: 128 }, { a: 3.0, b: 3.8, fx: 70, fy: 90 }];
const ADDED = { a: 2.0, b: 2.6, fx: 70, fy: 90 };
const zoomAmt = (t: number, a: number, b: number) => kf(t, [[a, 0], [a + 0.2, 1], [b - 0.2, 1], [b, 0]]);

const RecordingEditor: React.FC<{ f: number; show: number }> = ({ f, show }) => {
  const t = kf(f, [[T.play, 0], [T.play + 60, 2.0]], (x) => x);
  const added = Math.min(1, pop(f, T.add));
  const zA = zoomAmt(t, ZOOMS[0].a, ZOOMS[0].b);
  const z = 1 + 0.6 * Math.max(zA, added);
  const focus = added > 0.01 ? ADDED : ZOOMS[0];
  const addPressed = f >= T.add - 2 && f < T.add + 6;
  const expPressed = f >= T.exp - 2 && f < T.exp + 6;
  const progress = prog(f, T.p0, T.p1 - T.p0);
  const done = f >= T.p1;
  return (
    <Window x={WIN.x} y={WIN.y} w={WIN.w} h={REC_H} title="Sửa bản quay" show={show} radius={8}>
      <div style={{ position: "absolute", left: 16, top: 14, width: 480, height: 270, borderRadius: 6, overflow: "hidden", background: "#000" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 480, height: 270, transformOrigin: `${focus.fx}px ${focus.fy}px`, transform: `scale(${z})` }}>
          <div style={{ width: DW, height: DH, transform: "scale(.75)", transformOrigin: "0 0" }}><Doc /></div>
          {CLICKS.slice(0, 2).map((c) => {
            const p = prog(t, c, 0.4);
            return p > 0 && p < 1 ? (
              <i key={c} style={{ position: "absolute", left: ZOOMS[0].fx - 8 - 18 * p, top: ZOOMS[0].fy - 8 - 18 * p, width: 16 + 36 * p, height: 16 + 36 * p, borderRadius: 30, border: `2.5px solid ${C.yellow}`, opacity: 1 - p }} />
            ) : null;
          })}
        </div>
      </div>

      <div style={{ position: "absolute", left: 512, top: 14, width: 332 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: C.text2 }}>Mức xuất</div>
        <div style={{ position: "absolute", top: 22, left: 0, display: "flex", gap: 12 }}>
          <div style={{ width: 160, height: 34, borderRadius: 6, display: "grid", placeItems: "center", fontSize: 12.5, fontWeight: 600, background: hexA(C.accent, 0.22), boxShadow: `inset 0 0 0 1.5px ${C.accent}` }}>Gửi chat</div>
          <div style={{ width: 160, height: 34, borderRadius: 6, display: "grid", placeItems: "center", fontSize: 12.5, fontWeight: 600, color: C.text2, background: C.fill(0.07) }}>Chất lượng cao</div>
        </div>
        <div style={{ position: "absolute", top: 66, left: 0, fontSize: 11.5, color: C.text2, fontVariantNumeric: "tabular-nums" }}>1920×1080, 30 khung hình/giây</div>
        <div style={{ position: "absolute", top: 98, left: 0 }}>
          <Btn icon="plus" pressed={addPressed} style={{ width: 168, height: 28, fontSize: 12.5, justifyContent: "center" }}>Thêm zoom tại đây</Btn>
        </div>
        <div
          style={{
            position: "absolute", top: 150, left: 0, width: 332, height: 36, borderRadius: 6, display: "grid", placeItems: "center", fontSize: 14, fontWeight: 700,
            background: C.accent, filter: expPressed ? "brightness(1.25)" : undefined, opacity: progress > 0 && !done ? 0.55 : 1,
          }}
        >
          Xuất
        </div>
        {progress > 0 && !done && (
          <div style={{ position: "absolute", top: 204, left: 0, width: 332, height: 6, borderRadius: 3, background: C.fill(0.12) }}>
            <i style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${progress * 100}%`, borderRadius: 3, background: C.accent }} />
          </div>
        )}
        {done && (
          <div style={{ position: "absolute", top: 198, left: 0, display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 600, color: C.green, whiteSpace: "nowrap", opacity: Math.min(1, pop(f, T.p1)) }}>
            <Icon name="check" size={15} stroke={2.6} />
            Đã xuất, file đã được chép vào clipboard
          </div>
        )}
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 296 }}>
        {[0, 1, 2, 3, 4].map((s) => (
          <span key={s} style={{ position: "absolute", left: tx(s) - 14, width: 28, textAlign: s === 0 ? "left" : s === 4 ? "right" : "center", top: -2, fontSize: 10.5, color: C.text3, fontVariantNumeric: "tabular-nums", marginLeft: s === 0 ? 14 : 0, marginRight: s === 4 ? 14 : 0 }}>{mmss(s)}</span>
        ))}
        <div style={{ position: "absolute", left: TL_X, top: 22, width: TL_W, height: 26, borderRadius: 4, background: C.fill(0.05) }} />
        {[...ZOOMS, ...(added > 0.01 ? [ADDED] : [])].map((zm) => {
          const isNew = zm === ADDED;
          return (
            <div
              key={zm.a}
              style={{
                position: "absolute", left: tx(zm.a), top: 24, width: ((zm.b - zm.a) / CLIP_S) * TL_W * (isNew ? added : 1), height: 22, borderRadius: 4, overflow: "hidden",
                background: hexA(C.accent, 0.45), boxShadow: `inset 0 0 0 1px ${hexA(C.accent, 0.9)}`,
              }}
            />
          );
        })}
        {CLICKS.map((c) => <i key={c} style={{ position: "absolute", left: tx(c) - 4, top: 31, width: 8, height: 8, borderRadius: 4, background: C.yellow }} />)}
        <div style={{ position: "absolute", left: TL_X, top: 54, width: TL_W, height: 42, borderRadius: 4, background: "#2a2c33", overflow: "hidden", display: "flex", gap: 2, padding: 3 }}>
          {Array.from({ length: 14 }, (_, i) => (
            <i key={i} style={{ flex: 1, borderRadius: 2, background: i % 3 === 0 ? "#d4d6dd" : "#c3c6cf" }} />
          ))}
        </div>
        <div style={{ position: "absolute", left: tx(t) - 1, top: 18, width: 2, height: 84, background: "#fff" }} />
        <div style={{ position: "absolute", left: tx(t) - 5, top: 14, width: 10, height: 8, background: "#fff", clipPath: "polygon(0 0, 100% 0, 50% 100%)" }} />
        <div style={{ position: "absolute", left: TL_X, top: 108, fontFamily: FONT.mono, fontSize: 11, color: C.text2 }}>{mmss(t)} / {mmss(CLIP_S)}</div>
      </div>
    </Window>
  );
};

// ── Scene ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const moves: Move[] = [
  { f: 0, x: 1020, y: 640 },
  { f: T.dragA - 2, x: SEL.x, y: SEL.y, d: 14 },
  { f: T.dragB, x: SEL.x + SEL.w, y: SEL.y + SEL.h, d: T.dragB - T.dragA },
  { f: T.sua - 4, x: 1381, y: 106, d: 28 },
  { f: T.arrow0 - 2, ...(() => ({ x: CONTENT.x + TOOL_X + TOOL_W / 2, y: CONTENT.y + TOOL_Y + 23 }))(), d: 26 },
  { f: T.arrowA, ...onCanvas(A0[0], A0[1]), d: 10 },
  { f: T.arrowB, ...onCanvas(A1[0], A1[1]), d: 22 },
  { f: T.n1 - 2, ...onCanvas(N1[0], N1[1]), d: 14 },
  { f: T.n2 - 2, ...onCanvas(N2[0], N2[1]), d: 8 },
  { f: T.lens - 2, ...onCanvas(LENS.cx, LENS.cy), d: 14 },
  { f: T.copy - 3, ...COPY_BTN, d: 22 },
  { f: T.copy + 30, x: 1000, y: 300, d: 20 },
  { f: T.stop - 4, x: 766, y: 49, d: 24 },
  { f: T.stop + 30, x: 640, y: 230, d: 26 },
  { f: T.add - 3, ...ADD_BTN, d: 36 },
  { f: T.exp - 3, ...EXPORT_BTN, d: 18 },
  { f: T.end, x: EXPORT_BTN.x + 20, y: EXPORT_BTN.y + 60, d: 30 },
];
const clicks = [T.sua, T.arrow0, T.n1, T.n2, T.lens, T.copy, T.stop, T.add, T.exp];

const COUNT = [[T.cd, 3], [T.cd2, 2], [T.cd1, 1]] as const;

const ScreenshotScene: React.FC<SceneProps> = ({ title = true }) => {
  const f = useCurrentFrame();
  const camera = cameraAt(f, [[0, WIDE], [T.sua + 6, WIDE], [T.sua + 26, EDIT_CAM], [T.editEnd - 6, EDIT_CAM], [T.editEnd + 20, ON_NOTCH], [T.stop - 2, ON_NOTCH], [T.stop + 22, EDIT_CAM]], kf);

  // Region selection (⌃⌥S): the rectangle follows the cursor from the drag's start corner.
  const cur = cursorAt(f, moves);
  const selW = f < T.dragA ? 0 : Math.min(SEL.w, Math.max(0, cur.x - SEL.x));
  const selH = f < T.dragA ? 0 : Math.min(SEL.h, Math.max(0, cur.y - SEL.y));
  const picking = f >= T.key && f < T.release;
  const dim = prog(f, T.key, 8) * (1 - prog(f, T.release, 8));
  const flash = kf(f, [[T.release, 0.6], [T.release + 10, 0]]);
  const chip = pop(f, T.chip) * (1 - prog(f, T.sua + 2, 6));

  // Editors.
  const editShow = Math.min(1, pop(f, T.edit)) * (1 - prog(f, T.editEnd, 6));
  const recShow = Math.min(1, pop(f, T.rwin));

  // Notch: OCR (live, then a toast), recording countdown, then the recording live activity with a strip.
  const open = springSteps(f, [[0, 0], [T.toast, 1], [T.toastEnd, 0], [T.cd, 1], [T.start - 4, 0]]);
  const live = springSteps(f, [[0, 0], [T.ocr, 1], [T.toastEnd - 2, 0], [T.start - 2, 1], [T.stop + 2, 0]]);
  const strip = springSteps(f, [[0, 0], [T.start + 6, 30], [T.stop + 2, 0]]);
  // Swap the toast for the countdown only once the notch has fully closed, so its size never jumps.
  const kind = step(f, [[0, "ocr"], [T.toastEnd + 8, "rec"]] as const);
  const openW = kind === "ocr" ? 380 : 260;
  const contentH = kind === "ocr" ? 62 : 52;
  const elapsed = Math.max(0, (f - T.start) / 15);
  const digit = f < T.cd2 ? COUNT[0] : f < T.cd1 ? COUNT[1] : COUNT[2];
  const digitPop = Math.min(1, pop(f, digit[0]));
  const stopPressed = f >= T.stop - 2 && f < T.stop + 5;

  const leading =
    kind === "ocr" ? (
      <Icon name="doc" size={16} color={C.cyan} />
    ) : (
      <i style={{ width: 11, height: 11, borderRadius: 6, background: C.red, opacity: 0.6 + 0.4 * Math.abs(Math.sin(f * 0.12)) }} />
    );
  const trailing =
    kind === "ocr" ? (
      <span style={{ display: "inline-flex", gap: 4 }}>
        {[0, 1, 2].map((i) => <i key={i} style={{ width: 5, height: 5, borderRadius: 3, background: C.cyan, opacity: 0.3 + 0.7 * Math.max(0, Math.sin(f * 0.3 - i * 1.1)) }} />)}
      </span>
    ) : (
      <span style={{ fontFamily: FONT.ui, fontWeight: 700, fontSize: 13, color: C.text, fontVariantNumeric: "tabular-nums" }}>{mmss(elapsed)}</span>
    );

  const strip30 = (
    <div style={{ display: "flex", gap: 6, fontFamily: FONT.ui }}>
      <Btn style={{ width: 70, justifyContent: "center" }}>Tạm dừng</Btn>
      <Btn tone="#c4352e" pressed={stopPressed} style={{ width: 50, justifyContent: "center", filter: stopPressed ? "brightness(1.25)" : undefined }}>Dừng</Btn>
      <Btn style={{ width: 50, justifyContent: "center" }}>Huỷ</Btn>
    </div>
  );

  return (
    <>
      <Desktop camera={camera}>
        {/* The window that gets captured */}
        <div style={{ position: "absolute", left: SEL.x, top: SEL.y, width: SEL.w, height: SEL.h, borderRadius: 8, overflow: "hidden", boxShadow: "0 0 0 1px rgba(255,255,255,.12), 0 24px 60px rgba(0,0,0,.55)", zIndex: 1, opacity: 1 - recShow }}>
          <Doc />
        </div>

        {/* ⌃⌥S: dim, crosshair, size label, hint */}
        {dim > 0.01 && (
          <div style={{ position: "absolute", inset: 0, zIndex: 50, pointerEvents: "none", opacity: dim, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: SEL.x, top: SEL.y, width: selW, height: selH, boxShadow: "0 0 0 3000px rgba(0,0,0,.45)", outline: "1.5px solid #fff" }} />
            {picking && selW > 20 && (
              <div style={{ position: "absolute", left: SEL.x + selW, top: SEL.y + selH + 8, transform: "translateX(-100%)", padding: "3px 8px", borderRadius: 4, background: "rgba(0,0,0,.75)", fontFamily: FONT.mono, fontSize: 12, color: "#fff", whiteSpace: "nowrap" }}>
                {Math.round(selW)} × {Math.round(selH)}
              </div>
            )}
            <div style={{ position: "absolute", left: SCREEN.w / 2, top: 610, transform: "translateX(-50%)", padding: "7px 14px", borderRadius: 6, background: "rgba(24,24,27,.9)", border: "1px solid #3f3f46", fontFamily: FONT.ui, fontSize: 13.5, fontWeight: 500, color: "#fafafa", whiteSpace: "pre" }}>
              Kéo để chọn vùng  ·  Space: chọn cửa sổ  ·  Return: cả màn hình  ·  Esc: huỷ
            </div>
          </div>
        )}
        {picking && (
          <svg width={30} height={30} style={{ position: "absolute", left: cur.x - 15, top: cur.y - 15, zIndex: 60, filter: "drop-shadow(0 0 1.5px rgba(0,0,0,.8))" }}>
            <path d="M15 2v26M2 15h26" stroke="#fff" strokeWidth={1.5} />
          </svg>
        )}
        {flash > 0.01 && <div style={{ position: "absolute", left: SEL.x, top: SEL.y, width: SEL.w, height: SEL.h, background: "#fff", opacity: flash, zIndex: 55 }} />}

        {/* The floating "Đã chụp" chip */}
        {chip > 0.01 && (
          <div
            style={{
              position: "absolute", left: 1262, top: 52, width: 232, height: 76, borderRadius: 8, background: "rgba(28,28,31,.94)", boxShadow: "0 0 0 1px rgba(255,255,255,.12), 0 12px 30px rgba(0,0,0,.5)",
              fontFamily: FONT.ui, color: C.text, opacity: Math.min(1, chip), transform: `translateX(${(1 - Math.min(1, chip)) * 40}px)`, zIndex: 30,
            }}
          >
            <div style={{ position: "absolute", left: 10, top: 12, width: 72, height: 40, borderRadius: 4, overflow: "hidden", boxShadow: "0 0 0 1px rgba(255,255,255,.2)" }}>
              <div style={{ width: DW, height: DH, transform: "scale(.1125)", transformOrigin: "0 0" }}><Doc /></div>
            </div>
            <div style={{ position: "absolute", left: 94, top: 11, fontSize: 13, fontWeight: 700 }}>Đã chụp</div>
            <div style={{ position: "absolute", left: 94, top: 40, display: "flex", gap: 6 }}>
              <Btn pressed={f >= T.sua - 2 && f < T.sua + 6} style={{ width: 52, justifyContent: "center" }}>Sửa</Btn>
              <Btn style={{ width: 58, justifyContent: "center" }}>Chép</Btn>
            </div>
          </div>
        )}

        {editShow > 0.01 && <CaptureEditor f={f} show={editShow} />}
        {recShow > 0.01 && <RecordingEditor f={f} show={recShow} />}

        <Notch open={open} live={live} strip={strip} openW={openW} contentH={contentH} leading={leading} trailing={trailing} stripContent={strip30}>
          {kind === "ocr" ? (
            <div style={{ position: "absolute", left: 20, right: 20, top: 14, height: 36, display: "flex", alignItems: "center", gap: 12, fontFamily: FONT.ui, color: C.text }}>
              <span style={{ width: 32, height: 32, borderRadius: 8, background: C.green, color: "#000", display: "grid", placeItems: "center", flex: "none" }}>
                <Icon name="check" size={18} stroke={3} />
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Đã chép 248 ký tự</div>
                <div style={{ width: 290, fontSize: 11, color: C.text2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Báo cáo tuần 43 · Doanh thu 128 triệu · Khách mới 342 · Đơn hàng 1.280</div>
              </div>
            </div>
          ) : (
            <div style={{ position: "absolute", left: 18, right: 18, top: 14, height: 28, display: "flex", alignItems: "center", gap: 10, fontFamily: FONT.ui, color: C.text }}>
              <i style={{ width: 12, height: 12, borderRadius: 6, background: C.red, flex: "none" }} />
              <span style={{ flex: 1, fontSize: 16, fontWeight: 700, display: "inline-flex", alignItems: "baseline", whiteSpace: "pre" }}>
                {"Quay sau "}
                <span style={{ display: "inline-block", width: 12, textAlign: "center", transform: `scale(${1.35 - 0.35 * digitPop})`, transformOrigin: "50% 60%" }}>{digit[1]}</span>
                {"…"}
              </span>
              <Icon name="mic" size={15} color={C.text2} />
            </div>
          )}
        </Notch>
        <Cursor frame={f} moves={moves} clicks={clicks} hidden={picking || (f > T.copy + 10 && f < T.stop - 30)} />
      </Desktop>
      <Captions
        frame={f}
        label="Ảnh chụp"
        lines={[
          { f: 50, to: 132, text: "Chọn vùng, cửa sổ hoặc cả màn hình", keys: ["⌃⌥S"] },
          { f: 148, to: 270, text: "Sửa ngay: mũi tên, số bước, kính lúp, che vùng" },
          { f: 286, to: 356, text: "Lấy chữ từ màn hình", keys: ["⌃⌥O"] },
          { f: 362, to: 490, text: "Quay màn hình kèm micro", keys: ["⌃⌥R"] },
          { f: 504, to: 656, text: "Tự zoom theo cú bấm, xuất MP4 sẵn để gửi" },
        ]}
      />
      {title && <ChapterTitle frame={f} title="Ảnh chụp" sub="Chụp, sửa, quay và xuất video" />}
    </>
  );
};

export const screenshot: SceneDef = { id: "screenshot", label: "Ảnh chụp", dur: T.end, Comp: ScreenshotScene };
