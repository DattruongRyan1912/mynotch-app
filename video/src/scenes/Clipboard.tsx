import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT } from "../lib/theme";
import { kf, pop, springSteps, step, typed } from "../lib/time";
import { cameraAt, Desktop, ON_NOTCH, WIDE } from "../ui/Desktop";
import type { CameraState } from "../ui/Desktop";
import { Cursor } from "../ui/Cursor";
import type { Move } from "../ui/Cursor";
import { Icon } from "../ui/Icons";
import type { IconName } from "../ui/Icons";
import { Btn, Captions, ChapterTitle, Window } from "../ui/Kit";
import { Notch, Page, TabBar, hexA } from "../ui/Notch";
import type { SceneDef, SceneProps } from "./types";

// Clipboard: ten beats. 1 copy kinds, 2 click to paste, 3 @ filters, 4 boards, 5 lock a board, 6 transforms, 7 copy stack,
// 8 floating panel, 9 library window, 10 MCP. Cards live in one list; where each sits is a function of the frame.

const T = {
  c1: 50, c2: 76, c3: 100, arrive: 112, open: 116, c4: 146, c5: 174,
  paste: 202,
  clickSearch: 276, at: 284, pick: 304, clear: 348,
  scrollA: 356, ctxA: 382, subA: 396, newBoard: 410, enter: 438,
  ctxB: 452, styleOpen: 464, icon: 476, color: 488, done: 500,
  selBoard: 514, ctxB2: 528, lockOpen: 540, lock: 582,
  allBoards: 612, scrollB: 618, ctxC: 640, subC: 652, jsonPick: 674, jsonBorn: 676,
  stackOn: 712, s1: 722, s2: 734, s3: 746, pasteKey: 776, p1: 784, p2: 798, p3: 812, liveEnd: 834,
  camOut: 818, panelOpen: 842, spaceKey: 906, panelClose: 930,
  camWide: 936, libOpen: 950, cardClick: 978, sliderClick: 1000, listClick: 1018, inspKey: 1056, libClose: 1128,
  mcp: 1152, end: 1200,
} as const;

const A = C.accent;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ---------- icons the shared set lacks ----------
const X = {
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  brush: '<path d="M15 4l5 5-8.5 8.5a3.5 3.5 0 0 1-5 0 3.5 3.5 0 0 1 0-5z"/><path d="M5 20c2.2 0 3.2-1.2 3.4-3"/>',
  code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 5l-4 14"/>',
  list: '<path d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  sideR: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M15 5v14"/>',
  sideL: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M9 5v14"/>',
  sort: '<path d="M7 4v16M4 17l3 3 3-3M17 20V4M14 7l3-3 3 3"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  folderPlus: '<path d="M3 6h6l2 2h10v11H3z"/><path d="M12 11v6M9 14h6"/>',
  back: '<path d="M15 6l-6 6 6 6"/>',
  fwd: '<path d="M9 6l6 6-6 6"/>',
  stop: '<rect x="7" y="7" width="10" height="10" rx="1.5"/>',
  xcircle: '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
  palette: '<circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="11" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="15.5" cy="11" r="1"/>',
  grid4: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
} as const;
type SymName = IconName | keyof typeof X;
const Sym: React.FC<{ name: SymName; size?: number; color?: string; stroke?: number }> = ({ name, size = 14, color = "currentColor", stroke = 1.8 }) =>
  name in X ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={{ display: "block", flex: "none", color }} dangerouslySetInnerHTML={{ __html: X[name as keyof typeof X] }} />
  ) : (
    <Icon name={name as IconName} size={size} color={color} stroke={stroke} />
  );

// ---------- data ----------
type Kind = "text" | "link" | "image" | "color" | "code" | "file";
type Tok = readonly [string, string?];
type CardData = {
  id: string; kind: Kind; born: number; app: number; ago: string; ago2: string; title: string;
  text?: string; host?: string; path?: string; hex?: string; lines?: readonly (readonly Tok[])[]; raw?: string; more?: string;
};
const APPS = [
  { name: "Ghi chú", color: "#d6a83a" }, { name: "Trình duyệt", color: "#3b82f6" }, { name: "Trình soạn mã", color: "#7c6ae6" },
  { name: "Trình thiết kế", color: "#e5568c" }, { name: "Terminal", color: "#52525b" },
] as const;
const K = { kw: "#ff7ab2", ty: "#8ad4ff", st: "#ff8f78", num: "#d9c97c" };
const SWIFT: readonly (readonly Tok[])[] = [
  [["struct ", K.kw], ["Note ", K.ty], ["{"]],
  [["  var ", K.kw], ["id: "], ["Int", K.ty]],
  [["  let ", K.kw], ["tag = "], ['"vi"', K.st]],
  [["}"]],
];
const JSON_PRETTY: readonly (readonly Tok[])[] = [
  [["{"]],
  [['  "id"', K.ty], [" : "], ["7", K.num], [","]],
  [['  "ok"', K.ty], [" : "], ["true", K.kw]],
  [["}"]],
];
// Newest first.
const CARDS: readonly CardData[] = [
  { id: "json2", kind: "code", born: T.jsonBorn, app: -1, ago: "Vừa xong", ago2: "Vừa xong", lines: JSON_PRETTY, title: '{ "id" : 7, "ok" : true }' },
  { id: "code", kind: "code", born: T.c5, app: 2, ago: "Vừa xong", ago2: "3 phút trước", lines: SWIFT, title: "struct Note { var id: Int" },
  { id: "image", kind: "image", born: T.c4, app: 1, ago: "Vừa xong", ago2: "3 phút trước", title: "Ảnh 1280 × 720" },
  { id: "link", kind: "link", born: T.c3, app: 1, ago: "Vừa xong", ago2: "4 phút trước", host: "example.com", path: "/docs/khoi-dong", title: "example.com /docs/khoi-dong" },
  { id: "color", kind: "color", born: T.c2, app: 3, ago: "Vừa xong", ago2: "5 phút trước", hex: "#7D5CFF", title: "#7D5CFF" },
  { id: "text", kind: "text", born: T.c1, app: 0, ago: "Vừa xong", ago2: "5 phút trước", title: "Trưa nay họp lúc 12:30 ở phòng Hoa Sen, nhớ mang laptop và bản demo.", text: "Trưa nay họp lúc 12:30 ở phòng Hoa Sen, nhớ mang laptop và bản demo." },
  { id: "json", kind: "code", born: -1, app: 4, ago: "3 phút trước", ago2: "8 phút trước", raw: '{"id":7,"ok":true}', title: '{"id":7,"ok":true}' },
  { id: "file", kind: "file", born: -1, app: 1, ago: "12 phút trước", ago2: "20 phút trước", text: "bao-cao-q3.pdf", more: "và 2 file khác", title: "bao-cao-q3.pdf, và 2 file khác" },
  { id: "link2", kind: "link", born: -1, app: 1, ago: "1 giờ trước", ago2: "1 giờ trước", host: "github.com", path: "/ryan/mynotch", title: "github.com /ryan/mynotch" },
  { id: "text2", kind: "text", born: -1, app: 0, ago: "2 giờ trước", ago2: "2 giờ trước", text: "Mua sữa, trứng và bánh mì", title: "Mua sữa, trứng và bánh mì" },
  { id: "color2", kind: "color", born: -1, app: 3, ago: "3 giờ trước", ago2: "3 giờ trước", hex: "#FF6B35", title: "#FF6B35" },
];

// What the card row shows, in turn: everything, links only, everything, the pinned ones of a board, everything.
type Seg = { f: number; vis: (c: CardData) => boolean };
const SEG: readonly Seg[] = [
  { f: 0, vis: () => true },
  { f: T.pick, vis: (c) => c.kind === "link" },
  { f: T.clear, vis: () => true },
  { f: T.selBoard, vis: (c) => c.id === "color" },
  { f: T.allBoards, vis: () => true },
];
function presence(c: CardData, f: number): number {
  let v = SEG[0].vis(c) ? 1 : 0;
  for (let k = 1; k < SEG.length; k++) {
    if (f >= SEG[k].f) v = lerp(SEG[k - 1].vis(c) ? 1 : 0, SEG[k].vis(c) ? 1 : 0, kf(f, [[SEG[k].f, 0], [SEG[k].f + 14, 1]]));
  }
  return v * (c.born < 0 ? 1 : kf(f, [[c.born, 0], [c.born + 16, 1]]));
}
function scrollAt(f: number): number {
  if (f < T.selBoard) return kf(f, [[T.scrollA, 0], [T.scrollA + 20, 120]]);
  if (f < T.allBoards) return 0;
  return kf(f, [[T.scrollB, 0], [T.scrollB + 22, 480], [T.jsonBorn, 480], [T.jsonBorn + 18, 0]]);
}
const selectedId = (f: number) => (f >= T.paste && f < T.clickSearch ? "link" : "");
const isPinned = (c: CardData, f: number) => c.id === "color" && f >= T.enter;
const searchText = (f: number) => step(f, [[0, ""], [T.at, "@"], [T.pick, "@link "], [T.clear, ""]]);

// ---------- pieces ----------
const Sq: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <i style={{ display: "block", flex: "none", width: size, height: size, borderRadius: Math.max(3, size * 0.25), background: color }} />
);

const CodeLines: React.FC<{ lines: readonly (readonly Tok[])[]; fs: number }> = ({ lines, fs }) => (
  <div style={{ fontFamily: FONT.mono, fontSize: fs, lineHeight: 1.4, whiteSpace: "pre", overflow: "hidden", color: C.text }}>
    {lines.map((l, i) => <div key={i}>{l.map(([t, col], j) => <span key={j} style={{ color: col }}>{t}</span>)}</div>)}
  </div>
);

/** What a card shows for its content, by kind. */
const Pv: React.FC<{ c: CardData; fs: number; lines: number }> = ({ c, fs, lines }) => {
  const clamp: React.CSSProperties = { display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" };
  switch (c.kind) {
    case "text":
      return <div style={{ ...clamp, WebkitLineClamp: lines, fontSize: fs, lineHeight: 1.4, color: C.text }}>{c.text}</div>;
    case "code":
      if (c.raw) return <div style={{ fontFamily: FONT.mono, fontSize: fs * 0.88, lineHeight: 1.4, wordBreak: "break-all", overflow: "hidden", color: C.text }}>{c.raw}</div>;
      return <CodeLines lines={c.lines ?? []} fs={fs * 0.88} />;
    case "link":
      return (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: fs, fontWeight: 600, lineHeight: 1.4, whiteSpace: "nowrap", overflow: "hidden" }}>
            <Sym name="link" size={fs + 1} /><span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{c.host}</span>
          </div>
          <div style={{ ...clamp, WebkitLineClamp: 3, fontSize: fs - 1, lineHeight: 1.4, color: C.text2, marginTop: 2, wordBreak: "break-all" }}>{c.path}</div>
        </div>
      );
    case "color":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, height: "100%" }}>
          <div style={{ flex: 1, minHeight: 20, borderRadius: 6, background: c.hex, border: `1px solid ${C.fill(0.22)}` }} />
          <div style={{ fontFamily: FONT.mono, fontSize: fs, fontWeight: 500, lineHeight: 1.4 }}>{c.hex}</div>
        </div>
      );
    case "image":
      return (
        <svg viewBox="0 0 100 64" preserveAspectRatio="xMidYMid slice" style={{ display: "block", width: "100%", height: "100%", borderRadius: 6 }}>
          <rect width="100" height="64" fill="#2b3c5a" />
          <circle cx="74" cy="19" r="8" fill="#f2c14e" />
          <path d="M0 64V42l26-16 22 18 18-12 34 20v12z" fill="#3f6b5c" />
          <path d="M0 64V54l30-10 26 10 44-8v18z" fill="#2c4f45" />
        </svg>
      );
    case "file":
      return (
        <div>
          <Sym name="doc" size={fs * 2.4} color={C.text2} />
          <div style={{ ...clamp, WebkitLineClamp: 2, fontSize: fs, lineHeight: 1.4, marginTop: 3 }}>{c.text}</div>
          <div style={{ fontSize: fs - 1, lineHeight: 1.4, color: C.text2, whiteSpace: "nowrap", overflow: "hidden" }}>{c.more}</div>
        </div>
      );
  }
};

const Pill: React.FC<{ sel?: boolean; bg?: boolean; children: React.ReactNode; style?: React.CSSProperties }> = ({ sel, bg, children, style }) => (
  <span
    style={{
      display: "inline-flex", alignItems: "center", gap: 4, height: 22, padding: "0 8px", borderRadius: 6, fontSize: 11, fontWeight: 500, whiteSpace: "nowrap",
      color: sel ? C.text : C.text2, background: sel ? C.fill(0.14) : bg ? C.fill(0.06) : "transparent", flex: "none", ...style,
    }}
  >
    {children}
  </span>
);

const Field: React.FC<{ w: number; h?: number; placeholder: string; dots?: number; text?: string; caret?: boolean; fs?: number }> = ({ w, h = 22, placeholder, dots = 0, text, caret, fs = 11.5 }) => (
  <div
    style={{
      width: w, height: h, borderRadius: 5, background: C.fill(0.1), border: `1px solid ${C.fill(0.14)}`, padding: "0 7px", boxSizing: "border-box",
      display: "flex", alignItems: "center", fontSize: fs, color: dots || text ? C.text : C.text3, flex: "none", overflow: "hidden", whiteSpace: "nowrap",
    }}
  >
    {text ?? (dots ? <span style={{ letterSpacing: 1.5 }}>{"•".repeat(dots)}</span> : placeholder)}
    {caret && <i style={{ width: 1, height: fs + 2, background: C.text, marginLeft: 1 }} />}
  </div>
);

const BoardPill: React.FC<{ name: string; icon: SymName; color: string; sel?: boolean; locked?: boolean; show?: number }> = ({ name, icon, color, sel, locked, show = 1 }) => (
  <Pill sel={sel} style={{ opacity: show }}>
    <Sym name={icon} size={12} color={color} />
    {name}
    {locked && <Sym name="lock" size={10} />}
  </Pill>
);

// ---------- context menus (outside the notch, which would clip them) ----------
type MItem = { t: string; sub?: boolean; dis?: boolean } | "-";
const mrow = (items: readonly MItem[], k: number) => {
  let y = 5;
  for (let i = 0; i < k; i++) y += items[i] === "-" ? 9 : 22;
  return y + 11;
};
const Menu: React.FC<{ x: number; y: number; w: number; items: readonly MItem[]; hl?: number; show: number }> = ({ x, y, w, items, hl = -1, show }) =>
  show <= 0 ? null : (
    <div
      style={{
        position: "absolute", left: x, top: y, width: w, padding: 5, boxSizing: "border-box", borderRadius: 8, zIndex: 30, fontFamily: FONT.ui, fontSize: 13, color: C.text,
        background: "rgba(40,40,45,.97)", boxShadow: "0 0 0 1px rgba(255,255,255,.14), 0 12px 32px rgba(0,0,0,.5)", opacity: Math.min(1, show * 1.4), transform: `scale(${0.96 + 0.04 * show})`, transformOrigin: "0 0",
      }}
    >
      {items.map((it, i) =>
        it === "-" ? (
          <div key={i} style={{ height: 9, display: "flex", alignItems: "center" }}><i style={{ flex: 1, height: 1, background: C.fill(0.12), margin: "0 5px" }} /></div>
        ) : (
          <div
            key={i}
            style={{
              height: 22, display: "flex", alignItems: "center", padding: "0 8px", borderRadius: 5, whiteSpace: "nowrap", lineHeight: 1.3,
              background: i === hl ? A : "transparent", color: it.dis ? C.text3 : C.text,
            }}
          >
            <span style={{ flex: 1 }}>{it.t}</span>
            {it.sub && <span style={{ fontSize: 15, marginLeft: 8 }}>›</span>}
          </div>
        ),
      )}
    </div>
  );

const MENU_A: readonly MItem[] = [{ t: "Chép" }, { t: "Dán" }, { t: "Ghim vào board", sub: true }, "-", { t: "Xoá" }];
const SUB_A: readonly MItem[] = [{ t: "Công việc" }, { t: "Ý tưởng" }, "-", { t: "Board mới…" }];
const MENU_B: readonly MItem[] = [
  { t: "Đổi tên…" }, { t: "Đổi biểu tượng và màu…" }, { t: "Chuyển sang trái" }, { t: "Chuyển sang phải", dis: true }, "-", { t: "Khoá board…" }, "-", { t: "Xoá board “Thiết kế”" },
];
const MENU_C: readonly MItem[] = [{ t: "Chép" }, { t: "Dán" }, { t: "Biến đổi", sub: true }, { t: "Ghim vào board", sub: true }, "-", { t: "Xoá" }];
const SUB_C: readonly MItem[] = [
  "VIẾT HOA", "viết thường", "Viết Hoa Chữ Đầu", "Bỏ khoảng trắng thừa", "Bỏ dòng trống", "Sắp xếp dòng",
  "JSON: định dạng", "JSON: thu gọn", "Base64: mã hoá", "Base64: giải mã", "URL: mã hoá", "URL: giải mã",
].map((t) => ({ t, dis: t === "Base64: giải mã" }));
const PA = { x: 774, y: 162, w: 170 }, PSA = { x: 940, y: 206, w: 150 };
const PB = { x: 766, y: 109, w: 236 };
const PC = { x: 654, y: 152, w: 170 }, PSC = { x: 820, y: 196, w: 196 };

// Cursor targets that depend on the menus.
const POS = {
  card2: { x: 772, y: 182 }, search: { x: 546, y: 80 }, row: { x: 566, y: 158 }, chipX: { x: 789, y: 107 },
  colorCard: { x: 772, y: 160 }, pill: { x: 764, y: 107 }, all: { x: 511, y: 107 },
  hoverA: { x: PA.x + 70, y: PA.y + mrow(MENU_A, 2) }, newBoard: { x: PSA.x + 60, y: PSA.y + mrow(SUB_A, 3) },
  styleItem: { x: PB.x + 70, y: PB.y + mrow(MENU_B, 1) }, lockItem: { x: PB.x + 70, y: PB.y + mrow(MENU_B, 5) },
  brush: { x: 647, y: 107 }, pink: { x: 948, y: 107 }, done: { x: 1008, y: 107 }, lockBtn: { x: 858, y: 157 },
  jsonCard: { x: 652, y: 150 }, hoverC: { x: PC.x + 70, y: PC.y + mrow(MENU_C, 2) }, jsonFmt: { x: PSC.x + 60, y: PSC.y + mrow(SUB_C, 6) },
};

const moves: Move[] = [
  { f: 0, x: 1010, y: 360 },
  { f: T.arrive, x: 760, y: 16, d: 26 },
  { f: T.paste - 4, ...POS.card2, d: 22 },
  { f: T.clickSearch - 2, ...POS.search, d: 22 },
  { f: T.pick - 4, ...POS.row, d: 12 },
  { f: T.clear - 4, ...POS.chipX, d: 28 },
  { f: T.ctxA - 6, ...POS.colorCard, d: 24 },
  { f: T.subA - 2, ...POS.hoverA, d: 12 },
  { f: T.newBoard - 2, ...POS.newBoard, d: 12 },
  { f: T.ctxB - 2, ...POS.pill, d: 24 },
  { f: T.styleOpen - 2, ...POS.styleItem, d: 10 },
  { f: T.icon - 2, ...POS.brush, d: 10 },
  { f: T.color - 2, ...POS.pink, d: 12 },
  { f: T.done - 2, ...POS.done, d: 10 },
  { f: T.selBoard - 2, ...POS.pill, d: 12 },
  { f: T.lockOpen - 2, ...POS.lockItem, d: 10 },
  { f: T.lock - 2, ...POS.lockBtn, d: 24 },
  { f: T.allBoards - 2, ...POS.all, d: 24 },
  { f: T.ctxC - 2, ...POS.jsonCard, d: 20 },
  { f: T.subC - 2, ...POS.hoverC, d: 8 },
  { f: T.jsonPick - 2, ...POS.jsonFmt, d: 18 },
  { f: 716, x: 1000, y: 330, d: 30 },
  { f: T.panelOpen - 6, x: 520, y: 92, d: 24 },
  { f: T.cardClick - 2, x: 622, y: 490, d: 40 },
  { f: T.sliderClick - 2, x: 946, y: 78, d: 14 },
  { f: T.listClick - 2, x: 999, y: 144, d: 12 },
  { f: T.inspKey + 40, x: 1030, y: 507, d: 36 },
];
const clicks = [T.paste, T.clickSearch, T.pick, T.clear, T.ctxA, T.newBoard, T.ctxB, T.styleOpen, T.icon, T.color, T.done, T.selBoard, T.ctxB2, T.lockOpen, T.lock, T.allBoards, T.ctxC, T.jsonPick, T.cardClick, T.sliderClick, T.listClick];

// ---------- the notch tab ----------
const ICONS_STRIP: SymName[] = ["tray", "folder", "pin", "brush", "photo", "globe"];
const COLORS = [A, C.red, C.orange, C.yellow, C.green, C.mint, "#40c8e0", C.blue, "#5e5ce6", "#bf5af2", C.pink, "#8e8e93"];

const NotchCard: React.FC<{ c: CardData; x: number; p: number; sel: boolean; pinned: boolean }> = ({ c, x, p, sel, pinned }) => (
  <div
    style={{
      position: "absolute", left: x, top: 0, width: 112, height: 120, boxSizing: "border-box", padding: 8, borderRadius: 8, background: C.fill(0.07), opacity: p,
      boxShadow: sel ? `inset 0 0 0 2px ${A}` : undefined, transform: `scale(${0.9 + 0.1 * p})`, display: "flex", flexDirection: "column", gap: 6,
    }}
  >
    <div style={{ flex: 1, overflow: "hidden" }}><Pv c={c} fs={11} lines={4} /></div>
    <div style={{ height: 12, display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: C.text2, whiteSpace: "nowrap" }}>
      {c.app >= 0 && <Sq size={12} color={APPS[c.app].color} />}
      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.3 }}>{c.ago}</span>
      {pinned && <Sym name="pin" size={10} color={A} />}
    </div>
  </div>
);

const StyleStrip: React.FC<{ f: number }> = ({ f }) => (
  <div style={{ position: "absolute", left: 0, top: 28, width: 560, height: 22, display: "flex", alignItems: "center", gap: 6 }}>
    <BoardPill name="Thiết kế" icon={f >= T.icon ? "brush" : "tray"} color={f >= T.color ? C.pink : A} sel />
    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 2, overflow: "hidden" }}>
      {ICONS_STRIP.map((n) => {
        const on = n === (f >= T.icon ? "brush" : "tray");
        return (
          <div key={n} style={{ width: 24, height: 22, borderRadius: 6, display: "grid", placeItems: "center", flex: "none", background: on ? C.fill(0.18) : "transparent", color: on ? C.text : C.text2 }}>
            <Sym name={n} size={12} />
          </div>
        );
      })}
      <i style={{ width: 1, height: 14, background: C.fill(0.2), margin: "0 7px", flex: "none" }} />
      {COLORS.map((c, i) => {
        const on = i === (f >= T.color ? 10 : 0);
        return (
          <div key={i} style={{ width: 19, height: 22, display: "grid", placeItems: "center", flex: "none" }}>
            <i style={{ width: 13, height: 13, borderRadius: 7, background: c, boxShadow: on ? `0 0 0 1.5px #0a0a0a, 0 0 0 3px ${C.fill(0.95)}` : undefined }} />
          </div>
        );
      })}
    </div>
    <span style={{ height: 22, padding: "0 10px", borderRadius: 6, display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 600, background: hexA(A, 0.7), flex: "none" }}>Xong</span>
  </div>
);

const SUGG: readonly (readonly [IconName | "code" | "palette", string, string])[] = [
  ["doc", "Văn bản", "@text"], ["code", "Mã", "@code"], ["link", "Link", "@link"], ["photo", "Ảnh", "@image"], ["palette", "Màu", "@color"], ["folder", "File", "@file"],
];

const ClipTab: React.FC<{ f: number }> = ({ f }) => {
  const created = f >= T.enter;
  const boardOn = f >= T.selBoard && f < T.allBoards;
  const locked = f >= T.lock;
  const lockForm = f >= T.lockOpen && f < T.lock;
  const unlock = boardOn && locked;
  const naming = f >= T.newBoard && f < T.enter;
  const strip = f >= T.styleOpen && f < T.done + 4;
  const text = searchText(f);
  const chip = f >= T.pick && f < T.clear;
  const sugg = f >= T.at && f < T.pick;
  const sc = scrollAt(f);
  let slot = 0;
  const placed = CARDS.map((c) => {
    const p = presence(c, f);
    const x = slot * 120 - sc;
    slot += p;
    return { c, x, p };
  });
  const toastP = f >= T.paste + 2 && f < T.paste + 36 ? pop(f, T.paste + 2) * (f > T.paste + 28 ? 1 - (f - T.paste - 28) / 8 : 1) : 0;
  const link = placed.find((o) => o.c.id === "link");
  const n1 = Math.min(8, Math.floor(Math.max(0, f - (T.lockOpen + 8)) * 0.4));
  const n2 = Math.min(8, Math.floor(Math.max(0, f - (T.lockOpen + 26)) * 0.4));
  const bIcon: SymName = f >= T.icon ? "brush" : "tray";
  const bCol = f >= T.color ? C.pink : A;
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, width: 560, height: 24, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, height: 24, borderRadius: 6, background: C.fill(0.1), display: "flex", alignItems: "center", gap: 6, padding: "0 8px", fontSize: 11.5, whiteSpace: "nowrap" }}>
          <Sym name="search" size={12} color={C.text3} />
          {text ? <span>{text}<i style={{ display: "inline-block", width: 1, height: 13, background: C.text, marginLeft: 1, verticalAlign: "middle", opacity: f % 30 < 18 ? 1 : 0 }} /></span> : <span style={{ color: C.text3 }}>Tìm trong lịch sử</span>}
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          {["Tất cả", "Văn bản", "Link", "Ảnh", "File", "Màu"].map((k, i) => <Pill key={k} sel={i === 0}>{k}</Pill>)}
        </div>
        <Pill bg><Sym name="grid4" size={12} />Mở thư viện</Pill>
      </div>
      {strip ? (
        <StyleStrip f={f} />
      ) : (
        <div style={{ position: "absolute", left: 0, top: 28, width: 560, height: 22, display: "flex", alignItems: "center", gap: 4 }}>
          <Pill sel={!boardOn}><Sym name="clock" size={12} />Tất cả</Pill>
          <BoardPill name="Công việc" icon="folder" color={C.cyan} />
          <BoardPill name="Ý tưởng" icon="bolt" color={C.yellow} />
          {created && <BoardPill name="Thiết kế" icon={bIcon} color={bCol} sel={boardOn} locked={locked} show={kf(f, [[T.enter, 0], [T.enter + 8, 1]])} />}
          {naming ? (
            <Field w={120} h={22} placeholder="" text={typed(f, T.newBoard + 2, "Thiết kế", 12)} caret fs={11} />
          ) : (
            <Pill bg style={{ width: 22, padding: 0, justifyContent: "center" }}><Sym name="plus" size={12} /></Pill>
          )}
          {chip && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, height: 22, padding: "0 8px", borderRadius: 6, background: hexA(A, 0.45), fontSize: 11, fontWeight: 500, marginLeft: 2 }}>
              Link<Sym name="x" size={8} stroke={2.6} />
            </span>
          )}
          <span style={{ flex: 1 }} />
          <Pill bg><Sym name="stack" size={12} />Ngăn xếp</Pill>
        </div>
      )}
      {lockForm ? (
        <div style={{ position: "absolute", left: 0, top: 56, width: 560 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Sym name="lock" size={13} color={A} />
            <b style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>Khoá board “Thiết kế”</b>
            <span style={{ flex: 1 }} />
            <Btn>Huỷ</Btn>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 7 }}>
            <Field w={150} h={24} placeholder="Mật khẩu" dots={n1} caret={n2 === 0} />
            <Field w={150} h={24} placeholder="Nhập lại mật khẩu" dots={n2} caret={n2 > 0} />
            <Btn tone={n2 >= 8 ? A : undefined} pressed={f >= T.lock - 1}>Khoá bằng mật khẩu</Btn>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8, fontSize: 10, lineHeight: 1.4, color: C.orange }}>
            <Sym name="warning" size={11} color={C.orange} />
            <span>Không có cách khôi phục: nếu quên mật khẩu, nội dung của board này mất vĩnh viễn. Bạn vẫn xoá được board (dữ liệu đã mã hoá bị xoá theo).</span>
          </div>
        </div>
      ) : unlock ? (
        <div style={{ position: "absolute", left: 0, top: 58, width: 560 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Sym name="lock" size={24} color={C.pink} />
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.4 }}>Board “Thiết kế” đã khoá</div>
              <div style={{ fontSize: 10.5, color: C.text2, lineHeight: 1.4 }}>1 mục · nội dung chỉ hiện sau khi mở khoá</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}>
            <Field w={180} h={24} placeholder="Mật khẩu" />
            <Btn>Mở khoá</Btn>
            <span style={{ flex: 1 }} />
            <span style={{ fontSize: 10.5, color: A, lineHeight: 1.4 }}>Quên mật khẩu? Xoá board…</span>
          </div>
        </div>
      ) : (
        <div style={{ position: "absolute", left: 0, top: 54, width: 560, height: 120, overflow: "hidden" }}>
          {placed.map(({ c, x, p }) => p > 0.01 && <NotchCard key={c.id} c={c} x={x} p={p} sel={selectedId(f) === c.id} pinned={isPinned(c, f)} />)}
          {toastP > 0 && link && (
            <div style={{ position: "absolute", left: link.x + 112 - 32, top: 70, width: 22, height: 22, borderRadius: 6, background: "#000", boxShadow: `0 0 0 1px ${C.fill(0.2)}`, display: "grid", placeItems: "center", opacity: toastP, transform: `scale(${0.7 + 0.3 * toastP})` }}>
              <Sym name="check" size={13} color={C.green} stroke={2.4} />
            </div>
          )}
        </div>
      )}
      {sugg && (
        <div
          style={{
            position: "absolute", left: 0, top: 26, width: 220, height: 6 * 24 + 8, padding: 4, boxSizing: "border-box", borderRadius: 8, zIndex: 5, background: "#292929", boxShadow: `0 0 0 1px ${C.fill(0.14)}, 0 6px 16px rgba(0,0,0,.5)`,
            opacity: pop(f, T.at), transform: `translateY(${(1 - pop(f, T.at)) * -4}px)`,
          }}
        >
          {SUGG.map(([ic, title, tok], i) => {
            const hl = f >= T.pick - 12 ? i === 2 : i === 0;
            return (
              <div key={tok} style={{ height: 24, display: "flex", alignItems: "center", gap: 6, padding: "0 6px", borderRadius: 6, fontSize: 11, fontWeight: 500, background: hl ? hexA(A, 0.7) : "transparent" }}>
                <Sym name={ic} size={11} />
                <span style={{ flex: 1, lineHeight: 1.4 }}>{title}</span>
                <span style={{ fontFamily: FONT.mono, fontSize: 10, opacity: 0.7 }}>{tok}</span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

const STACK_ITEMS = ["Nguyễn Văn An", "an@example.com", "090 123 4567"];
const StackTab: React.FC<{ f: number }> = ({ f }) => {
  const starts = [T.s1, T.s2, T.s3];
  const n = starts.filter((s) => f >= s).length;
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, width: 560, height: 22, display: "flex", alignItems: "center", gap: 8 }}>
        <Sym name="stack" size={13} color={A} />
        <b style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>Ngăn xếp: {n} mục</b>
        <span style={{ fontSize: 11, color: C.text2, lineHeight: 1.4 }}>Dán từ mục chép trước</span>
        <span style={{ flex: 1 }} />
        <Pill bg><Sym name="trash" size={11} />Xoá tất cả</Pill>
        <Pill bg><Sym name="stop" size={11} />Dừng</Pill>
      </div>
      {n === 0 && (
        <div style={{ position: "absolute", left: 0, top: 40, width: 560, height: 110, display: "grid", placeItems: "center", fontSize: 12.5, color: C.text2, lineHeight: 1.4 }}>
          Chép các mục cần dán, chúng sẽ xếp vào đây theo thứ tự.
        </div>
      )}
      {STACK_ITEMS.map((t, i) => {
        const p = pop(f, starts[i]);
        return (
          p > 0 && (
            <div
              key={t}
              style={{
                position: "absolute", left: 0, top: 32 + i * 28, width: 560, height: 24, boxSizing: "border-box", borderRadius: 7, padding: "0 8px", display: "flex", alignItems: "center", gap: 8, fontSize: 12,
                background: C.fill(0.07), boxShadow: i === 0 ? `inset 0 0 0 1.5px ${A}` : undefined, opacity: p, transform: `translateY(${(1 - p) * 10}px)`,
              }}
            >
              <Sym name="doc" size={11} color={C.text2} />
              <span style={{ flex: 1, lineHeight: 1.4 }}>{t}</span>
              {i === 0 && <span style={{ fontSize: 10, fontWeight: 600, color: A }}>Kế tiếp</span>}
              <Sym name="xcircle" size={12} color={C.text2} />
            </div>
          )
        );
      })}
    </>
  );
};

// ---------- the app window the clipboard pastes into ----------
const NOTE: readonly { t: string; at: number; bold?: boolean; link?: boolean }[] = [
  { t: "Việc cần làm hôm nay", at: -1, bold: true },
  { t: "•  Gửi báo cáo tuần", at: -1 },
  { t: "•  Duyệt thiết kế màn hình đăng nhập", at: -1 },
  { t: "example.com/docs/khoi-dong", at: T.paste + 6, link: true },
  { t: "Liên hệ:", at: -1, bold: true },
  { t: "Nguyễn Văn An", at: T.p1 },
  { t: "an@example.com", at: T.p2 },
  { t: "090 123 4567", at: T.p3 },
];
const NoteWindow: React.FC<{ f: number; show: number }> = ({ f, show }) => {
  const g = (a: number, b: number) => kf(f, [[T.camOut - 2, a], [T.camOut + 34, b]]);
  return (
    <Window x={g(826, 300)} y={g(286, 56)} w={g(356, 800)} h={g(190, 510)} title="Ghi chú" radius={8} show={show}>
      <div style={{ position: "absolute", left: 18, top: 14, fontSize: 13, lineHeight: "19px" }}>
        {NOTE.map((l) => {
          const o = l.at < 0 ? 1 : kf(f, [[l.at, 0], [l.at + 6, 1]]);
          return (
            <div key={l.t} style={{ opacity: o, transform: `translateY(${(1 - o) * 4}px)`, fontWeight: l.bold ? 600 : 400, color: l.link ? C.cyan : C.text, textDecoration: l.link ? "underline" : undefined }}>{l.t}</div>
          );
        })}
      </div>
    </Window>
  );
};

// ---------- floating panel (⇧⌘C) ----------
const Glyph: React.FC<{ c: CardData }> = ({ c }) => {
  switch (c.kind) {
    case "color": return <i style={{ display: "block", width: 22, height: 22, borderRadius: 5, background: c.hex, boxShadow: `0 0 0 1px ${C.fill(0.25)}` }} />;
    case "image": return <div style={{ width: 28, height: 22 }}><Pv c={c} fs={10} lines={1} /></div>;
    case "link": return <Sym name="link" size={18} color={C.text2} />;
    case "code": return <Sym name="code" size={18} color={C.text2} />;
    case "file": return <Sym name="doc" size={18} color={C.text2} />;
    default: return <Sym name="doc" size={18} color={C.text2} />;
  }
};
const detail = (c: CardData) => [c.app >= 0 ? APPS[c.app].name : null, c.ago2].filter(Boolean).join(" · ");

const Panel: React.FC<{ f: number; show: number }> = ({ f, show }) => {
  const sel = step(f, [[0, 0], [T.panelOpen + 20, 1], [T.panelOpen + 30, 2], [T.panelOpen + 40, 3], [T.panelOpen + 50, 4]]);
  const rows = CARDS.slice(0, 9);
  const cur = rows[sel];
  return (
    <div
      style={{
        position: "absolute", left: 532, top: 104, width: 660, height: 420, borderRadius: 8, overflow: "hidden", zIndex: 12, fontFamily: FONT.ui, color: C.text, background: "rgba(32,32,36,.98)",
        boxShadow: "0 0 0 1px rgba(255,255,255,.14), 0 24px 60px rgba(0,0,0,.55)", opacity: show, transform: `scale(${0.96 + 0.04 * show})`, transformOrigin: "0 0",
      }}
    >
      <div style={{ height: 34, display: "flex", alignItems: "center", padding: "0 12px", gap: 8, color: C.text2, fontSize: 12, fontWeight: 600 }}>
        <Sym name="clipboard" size={14} /><span style={{ flex: 1 }}>Clipboard</span>
        <Sym name="stack" size={14} /><Sym name="pin" size={14} /><Sym name="x" size={13} />
      </div>
      <div style={{ height: 1, background: C.fill(0.1) }} />
      <div style={{ height: 40, padding: "8px 12px", boxSizing: "border-box" }}>
        <div style={{ height: 24, borderRadius: 6, background: C.fill(0.1), display: "flex", alignItems: "center", gap: 6, padding: "0 8px", fontSize: 12, color: C.text3 }}>
          <Sym name="search" size={13} />Tìm trong clipboard
        </div>
      </div>
      <div style={{ height: 1, background: C.fill(0.1) }} />
      <div style={{ display: "flex", height: 315 }}>
        <div style={{ width: 290, padding: 6, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 2, overflow: "hidden" }}>
          {rows.map((c, i) => (
            <div
              key={c.id}
              style={{
                height: 44, flex: "none", borderRadius: 8, padding: "0 8px", display: "flex", alignItems: "center", gap: 10, boxSizing: "border-box",
                background: i === sel ? hexA(A, 0.16) : "transparent", boxShadow: i === sel ? `inset 0 0 0 1.5px ${A}` : undefined,
              }}
            >
              <div style={{ width: 34, height: 30, display: "grid", placeItems: "center", flex: "none" }}><Glyph c={c} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, lineHeight: 1.35, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</div>
                <div style={{ fontSize: 11, lineHeight: 1.35, color: C.text2, display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", overflow: "hidden" }}>
                  {c.app >= 0 && <Sq size={11} color={APPS[c.app].color} />}<span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{detail(c)}</span>
                </div>
              </div>
              <span style={{ fontFamily: FONT.mono, fontSize: 11, color: C.text2 }}>⌘{i + 1}</span>
            </div>
          ))}
        </div>
        <div style={{ width: 1, background: C.fill(0.1) }} />
        <div style={{ flex: 1, padding: 14, display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
          <div style={{ flex: 1, overflow: "hidden" }}><Pv c={cur} fs={13} lines={14} /></div>
          <div style={{ height: 1, background: C.fill(0.1) }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.text2, lineHeight: 1.4, whiteSpace: "nowrap" }}>
            <Sym name={cur.kind === "code" ? "code" : cur.kind === "color" ? "palette" : cur.kind === "image" ? "photo" : cur.kind === "link" ? "link" : "doc"} size={12} />
            {cur.kind === "code" ? "Mã Swift" : { text: "Văn bản", link: "Link", image: "Ảnh", color: "Màu", file: "File", code: "" }[cur.kind]}
            <span style={{ flex: 1 }} />
            {cur.app >= 0 && <Sq size={13} color={APPS[cur.app].color} />}{detail(cur)}
          </div>
        </div>
      </div>
      <div style={{ height: 1, background: C.fill(0.1) }} />
      <div style={{ height: 28, padding: "0 12px", display: "flex", alignItems: "center", fontSize: 11, color: C.text2, whiteSpace: "nowrap" }}>
        ↑↓ chọn  ·  ⏎ dùng  ·  ⌘1–9 chọn nhanh  ·  ␣ xem lớn  ·  esc đóng
      </div>
    </div>
  );
};

const LargeColor: React.FC<{ show: number }> = ({ show }) => (
  <div
    style={{
      position: "absolute", left: 396, top: 92, width: 720, height: 400, borderRadius: 8, overflow: "hidden", zIndex: 14, fontFamily: FONT.ui, color: C.text, background: "rgba(36,36,40,.99)",
      boxShadow: "0 0 0 1px rgba(255,255,255,.14), 0 30px 80px rgba(0,0,0,.6)", opacity: show, transform: `scale(${0.95 + 0.05 * show})`, display: "flex", flexDirection: "column",
    }}
  >
    <div style={{ flex: 1, padding: 28, display: "flex", flexDirection: "column", gap: 20, minHeight: 0 }}>
      <div style={{ flex: 1, borderRadius: 8, background: "#7D5CFF", boxShadow: `0 0 0 1px ${C.fill(0.2)}` }} />
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 20, rowGap: 6, alignItems: "baseline" }}>
        {[["HEX", "#7D5CFF"], ["RGB", "rgb(125, 92, 255)"], ["HSL", "hsl(252, 100%, 68%)"]].map(([k, v]) => (
          <React.Fragment key={k}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text2 }}>{k}</span>
            <span style={{ fontFamily: FONT.mono, fontSize: 22, fontWeight: 500, lineHeight: 1.35 }}>{v}</span>
          </React.Fragment>
        ))}
      </div>
    </div>
    <div style={{ height: 1, background: C.fill(0.1) }} />
    <div style={{ height: 36, padding: "0 18px", display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: C.text2, whiteSpace: "nowrap" }}>
      <Sym name="palette" size={13} />Màu<span>Trình thiết kế</span><span>5 phút trước</span>
      <span style={{ flex: 1 }} />↑↓ đổi mục  ·  ⏎ dán  ·  esc đóng
    </div>
  </div>
);

// ---------- library window (⌃⌥⇧V) ----------
const LIB = { x: 266, y: 52, w: 980, h: 640 };
const SIDE: readonly { h?: string; rows?: readonly { icon: React.ReactNode; label: string; n: number; sel?: boolean; lock?: boolean }[] }[] = [
  { rows: [{ icon: <Sym name="clock" size={14} />, label: "Tất cả", n: 212, sel: true }] },
  {
    h: "Boards",
    rows: [
      { icon: <Sym name="folder" size={14} color={C.cyan} />, label: "Công việc", n: 12 },
      { icon: <Sym name="bolt" size={14} color={C.yellow} />, label: "Ý tưởng", n: 5 },
      { icon: <Sym name="brush" size={14} color={C.pink} />, label: "Thiết kế", n: 1, lock: true },
    ],
  },
  {
    h: "Loại",
    rows: [
      { icon: <Sym name="doc" size={14} />, label: "Văn bản", n: 118 }, { icon: <Sym name="link" size={14} />, label: "Link", n: 41 },
      { icon: <Sym name="photo" size={14} />, label: "Ảnh", n: 29 }, { icon: <Sym name="palette" size={14} />, label: "Màu", n: 11 },
      { icon: <Sym name="folder" size={14} />, label: "File", n: 13 },
    ],
  },
  {
    h: "Ứng dụng",
    rows: [
      { icon: <Sq size={14} color={APPS[0].color} />, label: "Ghi chú", n: 74 }, { icon: <Sq size={14} color={APPS[1].color} />, label: "Trình duyệt", n: 62 },
      { icon: <Sq size={14} color={APPS[2].color} />, label: "Trình soạn mã", n: 38 }, { icon: <Sq size={14} color={APPS[3].color} />, label: "Trình thiết kế", n: 24 },
      { icon: <Sq size={14} color={APPS[4].color} />, label: "Terminal", n: 14 },
    ],
  },
];
const TOOL: readonly SymName[] = ["sort", "filter", "sliders", "folderPlus", "sideR"];

function libPos(i: number, insp: number, list: number) {
  const gA = { x: 20 + (i % 3) * 244, y: 170 + Math.floor(i / 3) * 148, w: 232 };
  const gB = { x: 20 + (i % 2) * 221, y: 170 + Math.floor(i / 2) * 148, w: 209 };
  const g = { x: lerp(gA.x, gB.x, insp), y: lerp(gA.y, gB.y, insp), w: lerp(gA.w, gB.w, insp) };
  const l = { x: 20, y: 170 + i * 48, w: lerp(720, 430, insp) };
  return { x: lerp(g.x, l.x, list), y: lerp(g.y, l.y, list), w: lerp(g.w, l.w, list) };
}

const Library: React.FC<{ f: number; show: number }> = ({ f, show }) => {
  const list = kf(f, [[T.listClick + 4, 0], [T.listClick + 22, 1]]);
  const insp = kf(f, [[T.inspKey, 0], [T.inspKey + 20, 1]]);
  const picked = f >= T.cardClick;
  const pop1 = f >= T.sliderClick + 2 && f < T.listClick + 6 ? pop(f, T.sliderClick + 2) : 0;
  const mainW = 760 - 290 * insp;
  const seg = list > 0.5 ? 1 : 0;
  return (
    <Window x={LIB.x} y={LIB.y} w={LIB.w} h={LIB.h} chrome={false} radius={8} show={show} style={{ zIndex: 16, background: "#1c1c1f" }}>
      {/* title bar */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 52, background: "#242427", borderBottom: `1px solid ${C.fill(0.08)}` }} />
      <div style={{ position: "absolute", left: 16, top: 20, display: "flex", gap: 8 }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => <i key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />)}
      </div>
      <div style={{ position: "absolute", left: 92, top: 12, display: "flex", gap: 6, color: C.text2 }}>
        {(["sideL", "back", "fwd"] as SymName[]).map((n) => <div key={n} style={{ width: 28, height: 28, display: "grid", placeItems: "center", opacity: n === "fwd" ? 0.4 : 1 }}><Sym name={n} size={16} /></div>)}
      </div>
      <div style={{ position: "absolute", left: 196, top: 8, lineHeight: 1.3 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Thư viện Clipboard</div>
        <div style={{ fontSize: 11, color: C.text2 }}>Tất cả · 212 mục</div>
      </div>
      <div style={{ position: "absolute", right: 14, top: 13, display: "flex", alignItems: "center", gap: 2, color: C.text2 }}>
        {TOOL.map((n) => <div key={n} style={{ width: 30, height: 26, display: "grid", placeItems: "center", background: n === "sideR" && insp > 0.5 ? C.fill(0.12) : "transparent", borderRadius: 6 }}><Sym name={n} size={16} /></div>)}
        <div style={{ width: 200, height: 26, marginLeft: 8, borderRadius: 6, background: C.fill(0.08), display: "flex", alignItems: "center", gap: 6, padding: "0 8px", fontSize: 12, color: C.text3, boxSizing: "border-box" }}>
          <Sym name="search" size={13} />Tìm trong clipboard
        </div>
      </div>
      {/* sidebar */}
      <div style={{ position: "absolute", left: 0, top: 52, width: 220, bottom: 0, background: "#19191c", borderRight: `1px solid ${C.fill(0.07)}`, padding: "8px 10px", boxSizing: "border-box" }}>
        {SIDE.map((s, i) => (
          <div key={i}>
            {s.h && (
              <div style={{ display: "flex", alignItems: "center", fontSize: 11, fontWeight: 600, color: C.text3, padding: "12px 8px 4px", lineHeight: 1.4 }}>
                <span style={{ flex: 1 }}>{s.h}</span>{s.h === "Boards" && <Sym name="plus" size={12} />}
              </div>
            )}
            {s.rows?.map((r) => (
              <div key={r.label} style={{ height: 28, borderRadius: 6, display: "flex", alignItems: "center", gap: 8, padding: "0 8px", fontSize: 13, background: r.sel ? hexA(A, 0.34) : "transparent", whiteSpace: "nowrap" }}>
                <span style={{ width: 16, display: "grid", placeItems: "center", color: C.text2 }}>{r.icon}</span>
                <span style={{ flex: 1, lineHeight: 1.4 }}>{r.label}</span>
                {r.lock && <Sym name="lock" size={11} color={C.text2} />}
                <span style={{ fontSize: 12, color: C.text2, fontVariantNumeric: "tabular-nums" }}>{r.n}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      {/* content */}
      <div style={{ position: "absolute", left: 220, top: 52, width: mainW, bottom: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 20, top: 18, fontSize: 17, fontWeight: 600, lineHeight: 1.4 }}>Boards</div>
        <div style={{ position: "absolute", left: 20, top: 52, display: "flex", gap: 12 }}>
          {[["Công việc", "12 mục", "folder", C.cyan, false], ["Ý tưởng", "5 mục", "bolt", C.yellow, false], ["Thiết kế", "1 mục", "brush", C.pink, true]].map(([n, c, ic, col, lk]) => (
            <div key={n as string} style={{ width: 176, height: 62, borderRadius: 8, background: C.fill(0.06), display: "flex", alignItems: "center", gap: 10, padding: "0 12px", boxSizing: "border-box", flex: "none" }}>
              <Sym name={ic as SymName} size={18} color={col as string} />
              <div style={{ lineHeight: 1.4 }}>
                <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>{n as string}{lk && <Sym name="lock" size={10} color={C.text2} />}</div>
                <div style={{ fontSize: 11, color: C.text2 }}>{c as string}</div>
              </div>
            </div>
          ))}
          <div style={{ width: 176, height: 62, borderRadius: 8, boxSizing: "border-box", border: `1.5px dashed ${C.fill(0.35)}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 500, color: C.text2, flex: "none" }}>
            <Sym name="plus" size={13} />Board mới
          </div>
        </div>
        <div style={{ position: "absolute", left: 20, top: 136, fontSize: 17, fontWeight: 600, lineHeight: 1.4 }}>Lịch sử</div>
        {CARDS.map((c, i) => {
          const q = libPos(i, insp, 0), r = libPos(i, insp, 1);
          const gridO = 1 - Math.min(1, list * 2), listO = Math.max(0, list * 2 - 1);
          const sel = picked && c.id === "link";
          const fill = sel ? hexA(A, 0.16) : C.fill(0.06);
          const ring = sel ? `inset 0 0 0 2px ${A}` : undefined;
          return (
            <React.Fragment key={c.id}>
              <div style={{ position: "absolute", left: q.x, top: q.y, width: q.w, height: 136, boxSizing: "border-box", padding: 10, borderRadius: 8, background: fill, boxShadow: ring, opacity: gridO, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ flex: 1, overflow: "hidden" }}><Pv c={c} fs={12} lines={5} /></div>
                <div style={{ height: 14, display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.text2, whiteSpace: "nowrap" }}>
                  {c.app >= 0 && <Sq size={14} color={APPS[c.app].color} />}<span style={{ flex: 1, lineHeight: 1.3 }}>{c.ago2}</span>
                  {c.id === "color" && <Sym name="pin" size={10} color={A} />}
                </div>
              </div>
              {listO > 0.01 && (
                <div style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: 44, boxSizing: "border-box", padding: "0 10px", borderRadius: 8, background: fill, boxShadow: sel ? `inset 0 0 0 1.5px ${A}` : undefined, opacity: listO, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 32, display: "grid", placeItems: "center", flex: "none" }}><Glyph c={c} /></div>
                  <span style={{ flex: 1, fontSize: 13, lineHeight: 1.4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</span>
                  <span style={{ width: mainW > 600 ? 150 : 118, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.text2, whiteSpace: "nowrap", overflow: "hidden" }}>
                    {c.app >= 0 && <Sq size={16} color={APPS[c.app].color} />}{c.app >= 0 ? APPS[c.app].name : ""}
                  </span>
                  <span style={{ fontSize: 12, color: C.text2, width: mainW > 600 ? 100 : 84, textAlign: "right", whiteSpace: "nowrap" }}>{c.ago2}</span>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      {/* inspector */}
      {insp > 0.01 && (
        <div style={{ position: "absolute", right: 0, top: 52, bottom: 0, width: 290 * insp, overflow: "hidden", borderLeft: `1px solid ${C.fill(0.08)}` }}>
          <div style={{ position: "absolute", right: 0, top: 0, width: 290, bottom: 0, padding: 14, boxSizing: "border-box" }}>
            <div style={{ height: 190, borderRadius: 8, background: C.fill(0.05), padding: 14, boxSizing: "border-box", overflow: "hidden" }}>
              <Pv c={CARDS[3]} fs={15} lines={3} />
              <div style={{ fontSize: 11, lineHeight: 1.45, color: C.text2, marginTop: 12 }}>Chỉ hiện địa chỉ: MyNotch không mở trang này.</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>
              <Sym name="link" size={15} color={A} />Link
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "78px 1fr", rowGap: 7, marginTop: 12, fontSize: 12, lineHeight: 1.4 }}>
              {[["Nguồn", "Trình duyệt"], ["Đã chép", "29 thg 10, 2026 09:37"], ["Số lần chép", "1 lần"], ["Kích thước", "26 ký tự"], ["Board", "Không có"]].map(([k, v]) => (
                <React.Fragment key={k}>
                  <span style={{ color: C.text2 }}>{k}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>{k === "Nguồn" && <Sq size={16} color={APPS[1].color} />}{v}</span>
                </React.Fragment>
              ))}
            </div>
            <div style={{ height: 1, background: C.fill(0.1), margin: "14px 0" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12.5, fontWeight: 500 }}>
              {[["Dán", "clipboard", true], ["Chép", "copy", false], ["Ghim vào board…", "pin", false], ["Sửa…", "doc", false]].map(([t, ic, prim]) => (
                <div key={t as string} style={{ height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, whiteSpace: "nowrap", background: prim ? A : C.fill(0.1), boxSizing: "border-box" }}>
                  <Sym name={ic as SymName} size={12} />{t as string}
                </div>
              ))}
              <div style={{ gridColumn: "1 / 3", height: 28, borderRadius: 6, background: C.fill(0.1), display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: C.red, fontSize: 12.5, fontWeight: 500 }}>
                <Sym name="trash" size={12} />Xoá
              </div>
            </div>
          </div>
        </div>
      )}
      {/* view options popover */}
      {pop1 > 0 && (
        <div style={{ position: "absolute", left: 560, top: 46, width: 240, boxSizing: "border-box", padding: 14, borderRadius: 8, zIndex: 5, background: "#2a2a2e", boxShadow: `0 0 0 1px ${C.fill(0.14)}, 0 14px 36px rgba(0,0,0,.5)`, opacity: pop1, transform: `translateY(${(1 - pop1) * -6}px)` }}>
          <div style={{ fontSize: 11, color: C.text2, lineHeight: 1.4 }}>Kiểu xem</div>
          <div style={{ display: "flex", gap: 2, padding: 2, height: 26, borderRadius: 7, background: C.fill(0.08), marginTop: 6, boxSizing: "border-box" }}>
            {[["Lưới", "grid4"], ["Danh sách", "list"]].map(([t, ic], i) => (
              <div key={t} style={{ flex: 1, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontSize: 12, fontWeight: 500, background: i === seg ? C.fill(0.2) : "transparent" }}>
                <Sym name={ic as SymName} size={12} />{t}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: C.text2, marginTop: 14, lineHeight: 1.4 }}>Cỡ thẻ</div>
          <div style={{ height: 16, marginTop: 6, display: "flex", alignItems: "center", gap: 8, color: C.text3 }}>
            <Sym name="grid4" size={11} />
            <div style={{ flex: 1, height: 3, borderRadius: 2, background: C.fill(0.2), position: "relative" }}><i style={{ position: "absolute", left: "46%", top: -5, width: 13, height: 13, borderRadius: 7, background: "#fff" }} /></div>
            <Sym name="grid" size={11} />
          </div>
        </div>
      )}
    </Window>
  );
};

const McpCard: React.FC<{ show: number }> = ({ show }) => (
  <div
    style={{
      position: "absolute", left: 546, top: 96, width: 420, boxSizing: "border-box", padding: "14px 16px", borderRadius: 8, zIndex: 12, fontFamily: FONT.ui, color: C.text, background: "#1c1c1f",
      boxShadow: "0 0 0 1px rgba(255,255,255,.12), 0 24px 60px rgba(0,0,0,.55)", opacity: show, transform: `translateY(${(1 - show) * 10}px)`,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1, fontSize: 13.5, fontWeight: 600, lineHeight: 1.4 }}>Cho AI agent đọc lịch sử clipboard (MCP)</div>
      <div style={{ width: 36, height: 20, borderRadius: 10, background: C.green, position: "relative", flex: "none" }}>
        <i style={{ position: "absolute", right: 2, top: 2, width: 16, height: 16, borderRadius: 8, background: "#fff" }} />
      </div>
    </div>
    <div style={{ fontSize: 12, lineHeight: 1.5, color: C.text2, marginTop: 8 }}>
      Agent như Claude Code, Cursor hay Codex tìm trong lịch sử clipboard ngay trên máy này, qua một cổng nội bộ chỉ tài khoản của bạn mở được, không qua mạng.
    </div>
  </div>
);

// ---------- the scene ----------
const PANEL_CAM: CameraState = { zoom: 1.3, fx: 756, fy: 240 };

const ClipboardScene: React.FC<SceneProps> = ({ title = true }) => {
  const f = useCurrentFrame();
  const camera = cameraAt(
    f,
    [[0, ON_NOTCH], [T.camOut, ON_NOTCH], [T.camOut + 32, PANEL_CAM], [T.camWide, PANEL_CAM], [T.camWide + 28, WIDE], [T.libClose, WIDE], [T.libClose + 34, ON_NOTCH]],
    kf,
  );
  const open = springSteps(f, [[0, 0], [T.open, 1], [T.pasteKey, 0]]);
  const live = springSteps(f, [[0, 0], [T.c1, 1], [T.c1 + 20, 0], [T.c2, 1], [T.c2 + 20, 0], [T.c3, 1], [T.c3 + 20, 0], [T.pasteKey, 1], [T.liveEnd, 0]]);
  const stackLive = f >= T.stackOn;
  const count = step(f, [[0, 3], [T.p1, 2], [T.p2, 1], [T.p3, 0]]);
  const hit = (a: number, b: number) => (f >= a && f < b ? pop(f, a) : 0);
  const panelShow = pop(f, T.panelOpen) * (1 - kf(f, [[T.panelClose, 0], [T.panelClose + 10, 1]]));
  const spaceShow = pop(f, T.spaceKey) * (1 - kf(f, [[T.panelClose, 0], [T.panelClose + 10, 1]]));
  const libShow = pop(f, T.libOpen) * (1 - kf(f, [[T.libClose, 0], [T.libClose + 16, 1]]));
  const noteShow = 1 - kf(f, [[T.panelClose + 6, 0], [T.camWide + 14, 1]]);
  const mcpShow = pop(f, T.mcp);
  return (
    <>
      <Desktop camera={camera}>
        <NoteWindow f={f} show={noteShow} />
        <Panel f={f} show={panelShow} />
        {spaceShow > 0.01 && <LargeColor show={spaceShow} />}
        {libShow > 0.01 && <Library f={f} show={libShow} />}
        {mcpShow > 0 && <McpCard show={mcpShow} />}
        <Notch
          open={open}
          live={live}
          contentH={230}
          leading={stackLive ? <Icon name="stack" size={16} color={A} /> : <Icon name="clipboard" size={16} color={C.mint} />}
          trailing={
            stackLive ? (
              <span style={{ fontFamily: FONT.ui, fontWeight: 700, fontSize: 14, color: C.text, fontVariantNumeric: "tabular-nums" }}>{count}</span>
            ) : (
              <Icon name="check" size={14} color={C.green} stroke={2.4} />
            )
          }
        >
          <TabBar active={0} />
          <Page style={{ fontFamily: FONT.ui, color: C.text }}>{f >= T.stackOn ? <StackTab f={f} /> : <ClipTab f={f} />}</Page>
        </Notch>
        {/* context menus sit above the notch */}
        <Menu {...PA} items={MENU_A} hl={f >= T.subA - 2 ? 2 : -1} show={f >= T.ctxA && f < T.newBoard ? hit(T.ctxA + 2, T.newBoard) : 0} />
        <Menu {...PSA} items={SUB_A} hl={f >= T.newBoard - 4 ? 3 : -1} show={f >= T.subA && f < T.newBoard ? hit(T.subA, T.newBoard) : 0} />
        <Menu {...PB} items={MENU_B} hl={f >= T.styleOpen - 4 ? 1 : -1} show={f >= T.ctxB && f < T.styleOpen ? hit(T.ctxB + 2, T.styleOpen) : 0} />
        <Menu {...PB} items={MENU_B} hl={f >= T.lockOpen - 4 ? 5 : -1} show={f >= T.ctxB2 && f < T.lockOpen ? hit(T.ctxB2 + 2, T.lockOpen) : 0} />
        <Menu {...PC} items={MENU_C} hl={f >= T.subC - 4 ? 2 : -1} show={f >= T.ctxC && f < T.jsonPick ? hit(T.ctxC + 2, T.jsonPick) : 0} />
        <Menu {...PSC} items={SUB_C} hl={f >= T.jsonPick - 4 ? 6 : -1} show={f >= T.subC && f < T.jsonPick ? hit(T.subC, T.jsonPick) : 0} />
        <Cursor frame={f} moves={moves} clicks={clicks} />
      </Desktop>
      <Captions
        frame={f}
        label="Clipboard"
        lines={[
          { f: 50, to: 196, text: "Văn bản, link, ảnh, file, màu và mã nguồn" },
          { f: 202, to: 264, text: "Bấm vào thẻ là dán ngay" },
          { f: 270, to: 352, text: "Lọc nhanh bằng @link, @code, @tên app" },
          { f: 358, to: 510, text: "Board để ghim thẻ, đổi icon và màu" },
          { f: 516, to: 606, text: "Khoá board bằng mật khẩu" },
          { f: 612, to: 706, text: "Biến đổi chữ: JSON, Base64, viết hoa" },
          { f: 710, to: 814, text: "Ngăn xếp: chép nhiều, dán lần lượt", keys: ["⌃⌥C", "⌃⌥⌘V"] },
          { f: 826, to: 930, text: "Bảng nổi ngay cạnh con trỏ", keys: ["⇧⌘C"] },
          { f: 950, to: 1046, text: "Thư viện: lưới, danh sách và chi tiết", keys: ["⌃⌥⇧V"] },
          { f: 1052, to: 1126, text: "Ngăn Chi tiết cho biết nguồn và số lần chép", keys: ["⌘I"] },
          { f: 1136, to: 1198, text: "Cho AI agent tìm trong lịch sử qua MCP, chỉ trong máy" },
        ]}
      />
      {title && <ChapterTitle frame={f} title="Clipboard" sub="Chép một lần, dán lúc nào cũng được" />}
    </>
  );
};

export const clipboard: SceneDef = { id: "clipboard", label: "Clipboard", dur: T.end, Comp: ClipboardScene };
