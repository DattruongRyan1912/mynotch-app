import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT } from "../lib/theme";
import { kf, pop, prog, springSteps } from "../lib/time";
import { Desktop, ON_NOTCH, WIDE, cameraAt } from "../ui/Desktop";
import { Cursor, Move, cursorAt } from "../ui/Cursor";
import { Icon } from "../ui/Icons";
import { Btn, Captions, ChapterTitle } from "../ui/Kit";
import { Notch, Page, TabBar, hexA } from "../ui/Notch";
import type { SceneDef, SceneProps } from "./types";

// Drag a picture from the desktop onto the closed notch: it opens on the Khay tab, the file lands as a card; a second one follows,
// both get selected and merged into one PDF.

const T = {
  grab1: 52, hover1: 88, drop1: 106,
  grab2: 130, drop2: 152,
  sel1: 168, sel2: 178, pdf: 196, merge: 214, done: 218, end: 240,
} as const;

const PX = 476, PY = 68;
const at = (x: number, y: number) => ({ x: PX + x, y: PY + y });

// Desktop files (centre of the icon, in screen points).
const F1 = { x: 1116, y: 152, name: "Thiết kế v2.png" };
const F2 = { x: 1116, y: 252, name: "Ảnh 2.png" };

// Page layout.
const CARD = { w: 110, h: 74, y: 26, x: [0, 118] };
const CHIPS: { label: string; x: number; w: number }[] = [
  { label: "Đổi định dạng", x: 0, w: 118 },
  { label: "Đổi kích thước", x: 124, w: 124 },
  { label: "Nén", x: 254, w: 46 },
  { label: "Tách nền", x: 306, w: 84 },
  { label: "Nhận chữ", x: 396, w: 84 },
  { label: "PDF", x: 486, w: 52 },
];
const CHIP_Y = 124;

const moves: Move[] = [
  { f: 0, x: 1000, y: 330 },
  { f: T.grab1 - 2, x: F1.x, y: F1.y, d: 18 },
  { f: T.hover1, x: 760, y: 22, d: 34 },
  { f: T.drop1 - 2, ...at(50, 36), d: 14 },
  { f: T.grab2 - 2, x: F2.x, y: F2.y, d: 20 },
  { f: T.drop2 - 2, ...at(CARD.x[1] + 50, 36), d: 22 },
  { f: T.sel1 - 2, ...at(55, CARD.y + 40), d: 14 },
  { f: T.sel2 - 2, ...at(118 + 55, CARD.y + 40), d: 8 },
  { f: T.pdf - 2, ...at(CHIPS[5].x + CHIPS[5].w / 2, CHIP_Y + 12), d: 16 },
  { f: T.merge - 2, ...at(85, CHIP_Y + 12), d: 14 },
  { f: T.end - 6, x: 930, y: 150, d: 18 },
];
const clicks = [T.grab1, T.grab2, T.sel1, T.sel2, T.pdf, T.merge];

/** A generic file: a page with a folded corner. */
const FileGlyph: React.FC<{ w?: number }> = ({ w = 40 }) => (
  <svg width={w} height={w * 1.2} viewBox="0 0 40 48">
    <path d="M4 3a2 2 0 0 1 2-2h20l10 10v34a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" fill="#e9eaee" />
    <path d="M26 1l10 10H28a2 2 0 0 1-2-2z" fill="#b9bcc6" />
    <path d="M10 36l7-9 5 6 4-4 6 7z" fill="#7d8cc4" />
    <circle cx={14} cy={21} r={3} fill="#7d8cc4" />
  </svg>
);

const DeskFile: React.FC<{ x: number; y: number; name: string; dim?: boolean; lifted?: boolean }> = ({ x, y, name, dim, lifted }) => (
  <div style={{ position: "absolute", left: x - 56, top: y - 26, width: 112, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, opacity: dim ? 0.35 : 1, fontFamily: FONT.ui }}>
    <FileGlyph />
    <span style={{ fontSize: 11.5, fontWeight: 500, color: "#fff", padding: "1px 6px", borderRadius: 4, background: lifted ? C.accent : "transparent", textShadow: lifted ? "none" : "0 1px 3px rgba(0,0,0,.7)", whiteSpace: "nowrap" }}>{name}</span>
  </div>
);

const Card: React.FC<{ x: number; name: string; tone: string; show: number; sel: number; order: number }> = ({ x, name, tone, show, sel, order }) => (
  <div
    style={{
      position: "absolute", left: x, top: CARD.y, width: CARD.w, height: CARD.h, borderRadius: 6, background: C.fill(0.08), opacity: show,
      transform: `scale(${0.85 + 0.15 * show})`, boxShadow: sel ? `0 0 0 2px ${C.accent}` : "none",
    }}
  >
    <div style={{ position: "absolute", left: 6, top: 6, right: 6, height: 44, borderRadius: 4, background: tone, display: "grid", placeItems: "center", color: "rgba(255,255,255,.7)" }}>
      <Icon name="photo" size={22} />
    </div>
    <div style={{ position: "absolute", left: 6, right: 6, top: 54, fontSize: 11, fontWeight: 500, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: C.text }}>{name}</div>
    {sel > 0 && (
      <div style={{ position: "absolute", right: -5, top: -5, width: 18, height: 18, borderRadius: 9, background: C.accent, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, color: "#fff", transform: `scale(${sel})` }}>{order}</div>
    )}
  </div>
);

const ShelfScene: React.FC<SceneProps> = ({ title = true }) => {
  const f = useCurrentFrame();
  const camera = cameraAt(f, [[0, WIDE], [T.grab1, WIDE], [T.grab1 + 40, ON_NOTCH]], kf);
  const open = springSteps(f, [[0, 0], [T.hover1 - 2, 1]]);
  const contentH = springSteps(f, [[0, 168], [T.sel2 + 2, 200]]);

  const dragging1 = f >= T.grab1 && f < T.drop1;
  const dragging2 = f >= T.grab2 && f < T.drop2;
  const dragging = dragging1 || dragging2;
  const ghostOp = dragging ? 1 : f >= T.drop1 && f < T.drop1 + 6 ? 1 - prog(f, T.drop1, 6) : f >= T.drop2 && f < T.drop2 + 6 ? 1 - prog(f, T.drop2, 6) : 0;
  const ghostName = f < T.grab2 - 4 ? F1.name : F2.name;
  const cur = cursorAt(f, moves);
  const overNotch = (dragging1 && f >= T.hover1 + 8) || (dragging2 && f >= T.grab2 + 10);

  const n = f >= T.drop2 ? 2 : f >= T.drop1 ? 1 : 0;
  const card1 = pop(f, T.drop1);
  const card2 = pop(f, T.drop2);
  const sel1 = f >= T.sel1 && f < T.done ? pop(f, T.sel1) : 0;
  const sel2 = f >= T.sel2 && f < T.done ? pop(f, T.sel2) : 0;
  const actions = f >= T.sel2 + 2 && f < T.done;
  const merging = f >= T.pdf + 2;
  const actionsShow = pop(f, T.sel2 + 2);
  const report = pop(f, T.done);

  return (
    <>
      <Desktop camera={camera}>
        <DeskFile x={F1.x} y={F1.y} name={F1.name} dim={dragging1} />
        <DeskFile x={F2.x} y={F2.y} name={F2.name} dim={dragging2} />
        <Notch open={open} contentH={contentH}>
          <TabBar active={6} badge="tray" />
          <Page style={{ fontFamily: FONT.ui, color: C.text }}>
            {n === 0 && (
              <div
                style={{
                  position: "absolute", left: 0, right: 0, top: 4, height: 106, borderRadius: 8, boxSizing: "border-box",
                  border: `1.5px dashed ${overNotch ? C.accent : C.fill(0.22)}`, background: overNotch ? hexA(C.accent, 0.14) : "transparent",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: overNotch ? "#fff" : C.text2,
                }}
              >
                <Icon name="tray" size={24} />
                <span style={{ fontSize: 12.5, fontWeight: 500 }}>Thả file, link hoặc văn bản vào notch</span>
              </div>
            )}
            {n > 0 && (
              <>
                <div style={{ position: "absolute", left: 0, top: 0, fontSize: 13, fontWeight: 700 }}>{n} mục</div>
                <div style={{ position: "absolute", right: 0, top: 1, fontSize: 11.5, fontWeight: 600, color: C.text2 }}>Xoá tất cả</div>
                <Card x={CARD.x[0]} name={F1.name} tone="#3f4a6e" show={card1} sel={sel1} order={1} />
                {f < T.drop2 ? (
                  dragging2 && f >= T.grab2 + 10 && (
                    <div style={{ position: "absolute", left: CARD.x[1], top: CARD.y, width: CARD.w, height: CARD.h, borderRadius: 6, boxSizing: "border-box", border: `1.5px dashed ${C.accent}`, background: hexA(C.accent, 0.14) }} />
                  )
                ) : (
                  <Card x={CARD.x[1]} name={F2.name} tone="#4b5d4a" show={card2} sel={sel2} order={2} />
                )}
              </>
            )}
            {actions && (
              <div style={{ position: "absolute", left: 0, right: 0, top: 108, opacity: actionsShow }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.text2 }}>Hành động · 2 file</div>
              </div>
            )}
            {actions && !merging && CHIPS.map((c, i) => (
              <div key={c.label} style={{ position: "absolute", left: c.x, top: CHIP_Y, width: c.w, opacity: actionsShow }}>
                <Btn pressed={i === 5 && f >= T.pdf - 1} style={{ width: c.w, justifyContent: "center", boxSizing: "border-box" }}>{c.label}</Btn>
              </div>
            ))}
            {actions && merging && (
              <div style={{ position: "absolute", left: 0, top: CHIP_Y }}>
                <Btn icon="doc" pressed={f >= T.merge - 1} style={{ width: 170, justifyContent: "center" }}>Gộp ảnh thành một PDF</Btn>
              </div>
            )}
            {f >= T.done && (
              <div
                style={{
                  position: "absolute", left: 0, right: 0, top: 108, height: 40, borderRadius: 6, background: C.fill(0.08), opacity: report,
                  display: "flex", alignItems: "center", gap: 10, padding: "0 8px 0 10px", transform: `translateY(${(1 - report) * 6}px)`,
                }}
              >
                <div style={{ width: 20, height: 20, borderRadius: 10, background: C.green, display: "grid", placeItems: "center", color: "#06130a", transform: `scale(${0.5 + 0.5 * report})` }}>
                  <Icon name="check" size={13} stroke={3} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>Gộp PDF: Đã tạo 1 file</span>
                <Btn>Hiện trong Finder</Btn>
                <Btn>Đóng</Btn>
              </div>
            )}
          </Page>
        </Notch>
        {ghostOp > 0 && (
          <div style={{ position: "absolute", left: cur.x - 56 + 6, top: cur.y - 6, width: 112, opacity: ghostOp, zIndex: 60, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, transform: `scale(${1 - 0.25 * (1 - ghostOp)})`, transformOrigin: "50% 0" }}>
            <FileGlyph w={34} />
            <span style={{ fontFamily: FONT.ui, fontSize: 11, fontWeight: 500, color: "#fff", padding: "1px 6px", borderRadius: 4, background: C.accent, whiteSpace: "nowrap" }}>{ghostName}</span>
          </div>
        )}
        <Cursor frame={f} moves={moves} clicks={clicks} />
      </Desktop>
      <Captions
        frame={f}
        label="Khay"
        lines={[
          { f: 54, to: 150, text: "Kéo lên notch là cất" },
          { f: 158, to: 236, text: "Đổi định dạng, tách nền, gộp PDF ngay trong khay" },
        ]}
      />
      {title && <ChapterTitle frame={f} title="Khay" sub="Thả file, link hoặc văn bản vào notch" />}
    </>
  );
};

export const shelf: SceneDef = { id: "shelf", label: "Khay", dur: T.end, Comp: ShelfScene };
