import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT } from "../lib/theme";
import { fade, kf, mmss, pop, prog, springSteps, step } from "../lib/time";
import { CameraState, Desktop, MenuBar, ON_NOTCH, cameraAt } from "../ui/Desktop";
import { Cursor, Move } from "../ui/Cursor";
import { Icon } from "../ui/Icons";
import { Bars, Captions, ChapterTitle, Window } from "../ui/Kit";
import { Notch, Page, TabBar, hexA } from "../ui/Notch";
import type { SceneDef, SceneProps } from "./types";

// Media: the Media tab with several sources, a track change, karaoke lyrics (tab, strip under the notch, floating panel),
// then a film in a browser: find subtitles automatically, align them, and see them drawn in the page.

const T = {
  arrive: 46, open: 48,
  ytClick: 146, rClick: 186, musicClick: 226, next: 246,
  close: 392, reArrive: 454, reopen: 456, panelClick: 484, panelShow: 490, panelClose: 500, panelHide: 540,
  film: 556, filmArrive: 566, filmOpen: 568,
  capClick: 598, find: 630, count: 648, found: 702,
  dragA: 742, dragB: 764, pinchA: 794, pinchB: 824,
  menu2: 850, adA: 862, adB: 890, resync: 896,
  leave: 918, closeEnd: 926, end: 960,
} as const;

// Page origin in screen points (open notch 600 wide): page (0, 0) is screen (476, 68). Page is 560 wide, 156 tall (contentH 210).
const PX = 476, PY = 68;
const at = (x: number, y: number) => ({ x: PX + x, y: PY + y });
const CONTENT_H = 210;

// Row above the player (18 high): chips, then the subtitle capsule, then the EQ.
const CAP_X = 166;
const CHIP_MUSIC = { x: 0, w: 66 }, CHIP_SRC = { x: 72, w: 86 };
// Player block.
const COL = 112;
const BTN_Y = 108;
const NEXT_X = 396;
const LYRIC_Y = 132;

// The browser window (points on the screen) and the video inside it.
const BW = { x: 890, y: 262, w: 580, h: 360 };
const V = { x: BW.x, y: BW.y + 34, w: BW.w, h: Math.round((BW.w * 9) / 16) };
const PANEL = { x: 1012, y: 664, w: 460, h: 132 };
const MID: CameraState = { zoom: 1.35, fx: 1010, fy: 160 };
// The whole screen (zoom 1), with the focus kept high so a move to and from it never slides the notch off the top.
const ALL: CameraState = { zoom: 1, fx: 756, fy: 120 };

type Src = "music" | "yt" | "film";

// ---------- helpers ----------

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function mix(a: string, b: string, t: number): string {
  const A = rgb(a), B = rgb(b);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
}
const P1 = { bg: "#2b3d6b", sun: "#e9e3c6", dark: "#1b2748" };
const P2 = { bg: "#b5532e", sun: "#f2c46b", dark: "#7a3320" };
const pal = (t: number) => ({ bg: mix(P1.bg, P2.bg, t), sun: mix(P1.sun, P2.sun, t), dark: mix(P1.dark, P2.dark, t) });

const dip = (f: number, s: number) => (f < s ? 1 : kf(f, [[s, 0.15], [s + 8, 1]]));

const LY1 = [
  "Đèn phố lên mờ sau làn mưa mỏng",
  "Mình đi chậm qua những mái hiên",
  "Có tiếng đàn ai vọng từ góc phố",
  "Kéo đêm dài thêm một chút nữa thôi",
  "Em còn nhớ con đường mình hay đi",
];
const LY2 = [
  "Gió qua phố, thổi bay tờ lịch cũ",
  "Ta ngồi lại bên ly cà phê nguội",
  "Nghe thành phố thở khẽ qua mùa",
  "Tên em vẫn nằm trong câu hát",
  "Chuyến xe cuối đã đi ngang qua rồi",
  "Ngày mai nắng sẽ lên như thuở nào",
];
const LINE = 60;

/** The lyric line sung at a frame: the lines run every 60 frames, new ones after the track changes. */
function lyric(f: number) {
  const first = f < T.next;
  const lines = first ? LY1 : LY2;
  const local = f - (first ? 0 : T.next);
  const i = Math.min(lines.length - 1, Math.floor(local / LINE));
  const into = local - i * LINE;
  return { cur: lines[i], next: lines[i + 1] ?? "", prev: lines[i - 1] ?? "", p: Math.min(1, into / (LINE * 0.85)), into };
}

const src = (f: number): Src => step(f, [[0, "music"], [T.ytClick + 2, "yt"], [T.musicClick + 2, "music"], [T.film, "film"]] as const);

const CUES = [
  { a: 706, b: 768, text: "We should leave before sunrise." },
  { a: 772, b: 824, text: "Nobody knows this road but me." },
  { a: 826, b: 858, text: "Then lead the way." },
  { a: 900, b: 950, text: "Ten minutes. Then we go." },
];
const subB = (f: number) => kf(f, [[T.dragA, 30], [T.dragB, 52]]);
const subSize = (f: number) => kf(f, [[T.pinchA, 16], [T.pinchB, 22]]);
const subCenterY = (f: number) => V.y + V.h - subB(f) - (subSize(f) * 1.25) / 2;
const SUB_X = V.x + V.w / 2;

// ---------- cursor ----------

const moves: Move[] = [
  { f: 0, x: 1000, y: 330 },
  { f: T.arrive, x: 760, y: 16, d: 22 },
  { f: T.ytClick - 3, ...at(CHIP_SRC.x + CHIP_SRC.w / 2, 9), d: 24 },
  { f: T.rClick + 18, ...at(104, 34), d: 12 },
  { f: T.musicClick - 3, ...at(CHIP_MUSIC.w / 2, 9), d: 16 },
  { f: T.next - 3, ...at(NEXT_X, BTN_Y), d: 16 },
  { f: T.close + 4, x: 1000, y: 300, d: 24 },
  { f: T.reArrive, x: 760, y: 16, d: 12 },
  { f: T.panelClick - 3, ...at(548, LYRIC_Y + 10), d: 22 },
  { f: T.panelClose + 6, x: 1000, y: 330, d: 16 },
  { f: T.filmArrive, x: 760, y: 16, d: 22 },
  { f: T.capClick - 3, ...at(CAP_X + 38, 9), d: 24 },
  { f: T.find - 3, ...at(CAP_X + 70, 56), d: 14 },
  { f: T.dragA - 3, x: SUB_X, y: V.y + V.h - 30 - 9.5, d: 34 },
  { f: T.dragB, x: SUB_X, y: V.y + V.h - 52 - 9.5, d: T.dragB - T.dragA },
  { f: T.menu2 - 3, ...at(CAP_X + 44, 9), d: 18 },
  { f: T.adA + 4, ...at(CAP_X + 80, 116), d: 10 },
  { f: T.leave, x: 1000, y: 330, d: 20 },
];
const clicks = [T.ytClick, T.rClick, T.musicClick, T.next, T.panelClick, T.capClick, T.find, T.dragA, T.menu2];

// ---------- small pieces ----------

const Toggle: React.FC<{ on?: boolean; w?: number; h?: number }> = ({ on = true, w = 24, h = 14 }) => (
  <span style={{ position: "relative", display: "inline-block", width: w, height: h, borderRadius: h / 2, background: on ? C.accent : C.fill(0.2), flex: "none" }}>
    <i style={{ position: "absolute", top: 1.5, left: on ? w - h + 1.5 : 1.5, width: h - 3, height: h - 3, borderRadius: h, background: "#fff" }} />
  </span>
);

const UpDown: React.FC = () => (
  <svg width={7} height={10} viewBox="0 0 12 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 6L6 2.5 9.5 6M2.5 10L6 13.5 9.5 10" />
  </svg>
);

/** A setting's name over the screen, in video pixels: a short tag in the style of the tour's captions. */
const Tag: React.FC<{ frame: number; from: number; to: number; text: string; top: number; left?: number; toggle?: boolean }> = ({ frame, from, to, text, top, left = 960, toggle = true }) => {
  const o = fade(frame, from, to, 8, 8);
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: "absolute", left, top, transform: `translate(-50%, ${(1 - o) * 8}px)`, opacity: o, display: "flex", alignItems: "center", gap: 14,
        padding: "10px 18px", borderRadius: 6, background: "rgba(9,9,11,.82)", border: "1px solid #27272a", fontFamily: FONT.ui, fontSize: 24, fontWeight: 600, color: "#e4e4e7", whiteSpace: "nowrap",
      }}
    >
      {text}
      {toggle && <Toggle w={40} h={22} />}
    </div>
  );
};

/** A line whose words fill one by one: each word is its dim text with a bright copy clipped to the part sung. */
const Karaoke: React.FC<{ text: string; p: number; size: number; weight?: number; lit?: string; dim?: string }> = ({
  text, p, size, weight = 600, lit = "rgba(255,255,255,.96)", dim = "rgba(255,255,255,.42)",
}) => {
  const words = text.split(" ");
  const n = words.length;
  return (
    <span style={{ fontSize: size, fontWeight: weight, whiteSpace: "nowrap" }}>
      {words.map((w, i) => {
        const fill = Math.min(1, Math.max(0, p * n - i));
        return (
          <span key={i} style={{ position: "relative", display: "inline-block", marginRight: i < n - 1 ? "0.28em" : 0, color: dim }}>
            {w}
            <span style={{ position: "absolute", left: 0, top: 0, color: lit, clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)` }}>{w}</span>
          </span>
        );
      })}
    </span>
  );
};

// ---------- art (flat, original) ----------

const FilmArt: React.FC<{ f: number }> = ({ f }) => {
  const t = f - T.film;
  const walk = 40 + ((t * 0.5) % 220);
  const swing = Math.sin(t * 0.3) * 3;
  return (
    <>
      <rect width={320} height={180} fill="#16213e" />
      {[[30, 22], [70, 40], [120, 18], [180, 30], [260, 24], [292, 52]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={1.2} fill="#fff" opacity={0.7} />)}
      <circle cx={232 - t * 0.04} cy={46} r={15} fill="#e6dfc2" />
      <path d="M0 128 Q80 96 160 122 T320 114 V180 H0Z" fill="#0f1a30" />
      {[40, 74, 250, 286].map((x) => (
        <g key={x} fill="#0a1020">
          <polygon points={`${x},96 ${x - 8},116 ${x + 8},116`} />
          <polygon points={`${x},106 ${x - 10},130 ${x + 10},130`} />
        </g>
      ))}
      <rect y={148} width={320} height={32} fill="#080d1a" />
      <g fill="#04060c" stroke="#04060c">
        <circle cx={walk} cy={128} r={4.5} stroke="none" />
        <rect x={walk - 3.5} y={133} width={7} height={13} rx={2} stroke="none" />
        <path d={`M${walk - 1.5} 146 L${walk - 1.5 - swing} 158 M${walk + 1.5} 146 L${walk + 1.5 + swing} 158`} strokeWidth={2.4} strokeLinecap="round" fill="none" />
      </g>
    </>
  );
};

const StoryArt: React.FC = () => (
  <>
    <rect width={320} height={180} fill="#8fc1e3" />
    <circle cx={54} cy={44} r={20} fill="#f4d35e" />
    <rect y={130} width={320} height={50} fill="#6a9a52" />
    <rect x={196} y={84} width={72} height={56} fill="#d9b38c" />
    <polygon points="190,86 232,52 274,86" fill="#9c4a3a" />
    <rect x={222} y={108} width={16} height={32} fill="#7a4a30" />
    <circle cx={120} cy={110} r={9} fill="#3a2e2a" />
    <rect x={112} y={119} width={16} height={26} rx={4} fill="#3a2e2a" />
  </>
);

const Cover: React.FC<{ size: number; kind: Src; t: number }> = ({ size, kind, t }) => {
  const radius = Math.max(3, size * 0.07);
  if (kind === "music") {
    const p = pal(t);
    return (
      <svg width={size} height={size} viewBox="0 0 96 96" style={{ display: "block", flex: "none", borderRadius: radius }}>
        <rect width={96} height={96} fill={p.bg} />
        <circle cx={64} cy={32} r={14} fill={p.sun} />
        <rect x={8} y={58} width={18} height={38} fill={p.dark} />
        <rect x={29} y={46} width={22} height={50} fill={p.dark} />
        <rect x={54} y={64} width={16} height={32} fill={p.dark} />
        <rect x={73} y={52} width={17} height={44} fill={p.dark} />
      </svg>
    );
  }
  const h = size * 0.5625;
  return (
    <div style={{ position: "relative", width: size, height: size, borderRadius: radius, background: "#0c0d10", overflow: "hidden", flex: "none" }}>
      <svg width={size} height={h} viewBox="0 0 320 180" style={{ position: "absolute", left: 0, top: (size - h) / 2 }}>
        {kind === "yt" ? <StoryArt /> : <FilmArt f={T.film} />}
      </svg>
    </div>
  );
};

// ---------- menus ----------

const MenuBox: React.FC<{ x: number; w: number; o: number; children: React.ReactNode }> = ({ x, w, o, children }) => (
  <div
    style={{
      position: "absolute", left: x, top: 22, width: w, padding: 4, borderRadius: 8, background: "#232326", zIndex: 6,
      boxShadow: "0 0 0 1px rgba(255,255,255,.12), 0 10px 24px rgba(0,0,0,.5)", opacity: o, transform: `translateY(${(1 - o) * -4}px)`,
    }}
  >
    {children}
  </div>
);
const Item: React.FC<{ label: string; hot?: boolean; check?: boolean; tone?: string; dim?: boolean }> = ({ label, hot, check, tone, dim }) => (
  <div style={{ height: 20, display: "flex", alignItems: "center", gap: 6, padding: "0 6px", borderRadius: 5, fontSize: 11, fontWeight: 500, background: hot ? C.accent : "transparent", color: tone ?? (dim ? C.text3 : C.text), whiteSpace: "nowrap" }}>
    <span style={{ width: 11, display: "grid", placeItems: "center" }}>{check ? <Icon name="check" size={10} stroke={2.8} /> : null}</span>
    {label}
  </div>
);

// ---------- chips, capsule, EQ ----------

const Chip: React.FC<{ x: number; w: number; name: string; color: string; active: boolean; playing: boolean; pressed?: boolean }> = ({ x, w, name, color, active, playing, pressed }) => (
  <div
    style={{
      position: "absolute", left: x, top: 0, width: w, height: 18, borderRadius: 6, display: "flex", alignItems: "center", gap: 4, padding: "0 7px 0 4px", boxSizing: "border-box",
      background: pressed ? C.fill(0.3) : active ? C.fill(0.2) : C.fill(0.08), color: active ? C.text : C.text2, fontSize: 10.5, fontWeight: 600, whiteSpace: "nowrap",
    }}
  >
    <i style={{ width: 12, height: 12, borderRadius: 3, background: color, flex: "none" }} />
    <span style={{ flex: 1 }}>{name}</span>
    {playing && <i style={{ width: 5, height: 5, borderRadius: 3, background: C.green, flex: "none" }} />}
  </div>
);

const Capsule: React.FC<{ f: number }> = ({ f }) => {
  const phase = step(f, [[0, "load"], [T.find + 2, "find"], [T.count, "count"], [T.found, "loaded"]] as const);
  const base: React.CSSProperties = { display: "flex", alignItems: "center", gap: 5, height: 18, borderRadius: 6, background: C.fill(0.12), fontSize: 10.5, fontWeight: 600, whiteSpace: "nowrap", color: C.text };
  const left = Math.max(1, 45 - Math.floor((f - T.count) / 9));
  const flash = f >= T.resync ? 1 - prog(f, T.resync, 22) : 0;
  const figure = f >= T.resync ? "\u221228.5s" : "+1.5s";
  return (
    <div style={{ position: "absolute", left: CAP_X, top: 0, height: 18, display: "flex", gap: 2 }}>
      {phase === "load" && <div style={{ ...base, padding: "0 8px" }}><Icon name="captions" size={12} />Phụ đề…</div>}
      {phase === "find" && <div style={{ ...base, padding: "0 8px" }}><Icon name="search" size={12} />Đang tìm…</div>}
      {phase === "count" && <div style={{ ...base, padding: "0 8px", minWidth: 50, fontVariantNumeric: "tabular-nums" }}><Icon name="search" size={12} />{left}s</div>}
      {phase === "loaded" && (
        <>
          <div style={{ ...base, width: 18, justifyContent: "center" }}><svg width={9} height={9} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} strokeLinecap="round"><path d="M5 12h14" /></svg></div>
          <div style={{ ...base, width: 64, padding: "0 7px", background: `rgba(255,255,255,${0.12 + 0.2 * flash})`, fontVariantNumeric: "tabular-nums" }}>
            <Icon name="captions" size={12} />
            <span style={{ flex: 1, textAlign: "right" }}>{figure}</span>
          </div>
          <div style={{ ...base, width: 18, justifyContent: "center" }}><Icon name="plus" size={10} stroke={3} /></div>
        </>
      )}
    </div>
  );
};

const EqCluster: React.FC = () => (
  <div style={{ position: "absolute", right: 0, top: 0, height: 18, display: "flex", alignItems: "center", gap: 6 }}>
    <span style={{ fontSize: 10.5, fontWeight: 600, color: C.text2 }}>EQ</span>
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, height: 18, padding: "0 7px", borderRadius: 6, background: C.fill(0.12), fontSize: 10.5, fontWeight: 500 }}>Nhạc<UpDown /></span>
    <Toggle />
    <span style={{ display: "inline-flex", alignItems: "center", height: 18, padding: "0 8px", borderRadius: 6, background: C.fill(0.1), fontSize: 10.5, fontWeight: 600 }}>Chỉnh…</span>
  </div>
);

// ---------- scene ----------

const hms = (s: number) => {
  const v = Math.max(0, Math.floor(s));
  return v >= 3600 ? `${Math.floor(v / 3600)}:${String(Math.floor((v % 3600) / 60)).padStart(2, "0")}:${String(v % 60).padStart(2, "0")}` : mmss(v);
};

const MediaScene: React.FC<SceneProps> = ({ title = true }) => {
  const f = useCurrentFrame();
  const s = src(f);
  const browser = s !== "music";

  const open = springSteps(f, [[0, 0], [T.open, 1], [T.close, 0], [T.reopen, 1], [T.panelClose, 0], [T.filmOpen, 1], [T.closeEnd, 0]]);
  const live = springSteps(f, [[0, 1], [T.close, 1.4], [T.panelClick, 1]]);
  const strip = springSteps(f, [[0, 0], [T.close + 6, 36], [T.panelClick, 0]]);

  const ct = kf(f, [[T.next, 0], [T.next + 28, 1]]);
  const tint = s === "music" ? pal(ct).bg : s === "yt" ? "#4d8f5a" : "#2c4a7a";
  const swap = dip(f, T.ytClick + 2) * dip(f, T.musicClick + 2) * dip(f, T.next + 4);
  const track2 = f >= T.next + 6;
  const ly = lyric(f);
  const lineDip = kf(ly.into, [[0, 0.25], [8, 1]]);

  // What the player says per source.
  let name = track2 ? "Gió qua phố" : "Đêm thành phố";
  let artist = "Ban nhạc Mây";
  let badge = "Music", badgeColor = "#e5486b";
  let elapsed: number, total: number;
  if (s === "music") {
    if (track2) { elapsed = (f - T.next) / 30; total = 221; } else { elapsed = 146.6 + f / 30; total = 199; }
  } else if (s === "yt") {
    name = "Chuyện đêm đông"; artist = "Kênh Truyện Xưa"; badge = "Chrome"; badgeColor = "#4f86d9";
    elapsed = 72 + (f - T.ytClick) / 30; total = 580;
  } else {
    name = "Cuộc đua cuối cùng"; artist = "phim.example"; badge = "Chrome"; badgeColor = "#4f86d9";
    elapsed = 2472 + (f - T.film) / 30; total = 6480;
  }
  const fr = Math.min(1, elapsed / total);
  const fmt = total >= 3600 ? hms : mmss;
  const nextPress = f >= T.next && f < T.next + 6;
  const panelOn = f >= T.panelClick && f < T.panelHide;

  // Subtitle capsule menus.
  const menu1 = fade(f, T.capClick + 2, T.find + 2, 4, 5);
  const menu2 = fade(f, T.menu2 + 2, T.adB + 2, 4, 5);
  const ctx = fade(f, T.rClick + 2, T.musicClick, 4, 6);
  const toast = fade(f, T.found, T.found + 66, 6, 8);

  // Strip under the collapsed notch and the floating panel.
  const stripContent = (
    <div style={{ textAlign: "center", lineHeight: 1.25, fontFamily: FONT.ui, whiteSpace: "nowrap", opacity: lineDip }}>
      <div><Karaoke text={ly.cur} p={ly.p} size={12} weight={600} /></div>
      <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,.4)" }}>{ly.next}</div>
    </div>
  );
  const panelShow = Math.min(pop(f, T.panelShow), 1 - prog(f, T.panelHide, 12));

  // The film's own frame.
  const ad = f >= T.adA && f < T.adB;
  const cue = CUES.find((c) => f >= c.a && f < c.b);
  const winShow = kf(f, [[T.film - 22, 0], [T.film, 1]]);

  const cam = cameraAt(f, [[0, ON_NOTCH], [T.panelClick - 4, ON_NOTCH], [T.panelClick + 30, ALL], [T.film + 4, ALL], [T.film + 44, MID]], kf);

  return (
    <>
      <Desktop camera={cam} menu={<MenuBar app={f >= T.film ? "Trình duyệt" : "Music"} />}>
        {/* Browser window with the film */}
        {f >= T.film - 22 && (
          <Window x={BW.x} y={BW.y} w={BW.w} h={BW.h} chrome={false} show={winShow} radius={10}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 34, display: "flex", alignItems: "center", gap: 7, padding: "0 12px", background: "#2a2a2e" }}>
              {["#ff5f57", "#febc2e", "#28c840"].map((c) => <i key={c} style={{ width: 10, height: 10, borderRadius: 5, background: c }} />)}
              <div style={{ flex: 1, margin: "0 40px 0 24px", height: 20, borderRadius: 6, background: C.fill(0.08), display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontSize: 11.5, color: C.text2, fontFamily: FONT.ui }}>
                <Icon name="lock" size={10} />phim.example
              </div>
            </div>
            <div style={{ position: "absolute", left: 0, top: 34, width: V.w, height: V.h, overflow: "hidden", background: "#000" }}>
              <svg width={V.w} height={V.h} viewBox="0 0 320 180" style={{ display: "block" }}>
                {ad ? (
                  <>
                    <rect width={320} height={180} fill="#d9a441" />
                    <rect x={120} y={50} width={80} height={56} rx={6} fill="#b8842a" />
                    <circle cx={160} cy={78} r={14} fill="#f0d08a" />
                  </>
                ) : <FilmArt f={f} />}
              </svg>
              {ad && (
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 54, textAlign: "center", fontFamily: FONT.ui, fontSize: 22, fontWeight: 700, color: "#2a1d05" }}>Quảng cáo</div>
              )}
              {cue && !ad && f >= T.found + 4 && (
                <div style={{ position: "absolute", left: 0, right: 0, bottom: subB(f), textAlign: "center", opacity: fade(f, cue.a, cue.b, 4, 4) }}>
                  <span
                    style={{
                      fontFamily: FONT.ui, fontWeight: 700, fontSize: subSize(f), lineHeight: 1.25, color: "#fff", padding: "0 16px",
                      textShadow: "-1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000, 0 0 4px rgba(0,0,0,.9)",
                    }}
                  >
                    {cue.text}
                  </span>
                </div>
              )}
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 3, background: "rgba(255,255,255,.2)" }}>
                <div style={{ width: `${fr * 100}%`, height: 3, background: "#e5484d" }} />
                <i style={{ position: "absolute", left: "55%", top: 0, width: 14, height: 3, background: "#f0c040" }} />
              </div>
            </div>
          </Window>
        )}

        {/* Floating lyrics panel */}
        {panelShow > 0.01 && (
          <div
            style={{
              position: "absolute", left: PANEL.x, top: PANEL.y, width: PANEL.w, height: PANEL.h, borderRadius: 8, background: "rgba(5,5,7,.92)", boxShadow: "0 14px 36px rgba(0,0,0,.55)", zIndex: 8,
              opacity: panelShow, transform: `scale(${0.96 + 0.04 * panelShow})`, transformOrigin: "50% 100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7,
              fontFamily: FONT.ui, whiteSpace: "nowrap",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,.42)", opacity: lineDip }}>{ly.prev}</div>
            <div style={{ opacity: lineDip }}><Karaoke text={ly.cur} p={ly.p} size={19} weight={700} /></div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,.42)", opacity: lineDip }}>{ly.next}</div>
          </div>
        )}

        <Notch
          open={open}
          live={live}
          strip={strip}
          contentH={CONTENT_H}
          leading={<Cover size={16} kind={s} t={ct} />}
          trailing={<Bars frame={f} color={tint === "#4d8f5a" ? C.green : mix(tint, "#ffffff", 0.35)} h={14} />}
          stripContent={stripContent}
        >
          {/* A faint tint of the cover colour behind the tab */}
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 100% at 16% 58%, ${hexA(tint, 0.26)}, ${hexA(tint, 0)} 75%)` }} />
          <TabBar active={1} />
          <Page style={{ fontFamily: FONT.ui, color: C.text }}>
            {/* Row above the player */}
            <Chip x={CHIP_MUSIC.x} w={CHIP_MUSIC.w} name="Music" color="#e5486b" active={s === "music"} playing={s !== "film"} pressed={f >= T.musicClick && f < T.musicClick + 5} />
            <Chip x={CHIP_SRC.x} w={CHIP_SRC.w} name={s === "film" ? "phim.example" : "YouTube"} color="#4f86d9" active={browser} playing pressed={f >= T.ytClick && f < T.ytClick + 5} />
            {browser && <Capsule f={f} />}
            <EqCluster />

            {/* Player */}
            <div style={{ position: "absolute", inset: 0, opacity: swap }}>
              <div style={{ position: "absolute", left: 0, top: 26 }}><Cover size={96} kind={s} t={ct} /></div>
              <div style={{ position: "absolute", left: COL, top: 26, width: 330, fontSize: 17, fontWeight: 700, lineHeight: "22px", whiteSpace: "nowrap" }}>{name}</div>
              <div style={{ position: "absolute", left: COL, top: 49, fontSize: 12.5, lineHeight: "16px", color: C.text2, whiteSpace: "nowrap" }}>{artist}</div>
              <div style={{ position: "absolute", right: 0, top: 30, display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, fontWeight: 600, color: C.text2 }}>
                <i style={{ width: 12, height: 12, borderRadius: 3, background: badgeColor }} />{badge}
              </div>
              {/* Progress */}
              <div style={{ position: "absolute", left: COL, top: 79, width: 40, fontSize: 10.5, color: C.text3, fontVariantNumeric: "tabular-nums" }}>{fmt(elapsed)}</div>
              <div style={{ position: "absolute", left: COL + 38, top: 84, width: 358, height: 4, borderRadius: 2, background: C.fill(0.16) }}>
                <div style={{ width: `${fr * 100}%`, height: 4, borderRadius: 2, background: s === "music" ? mix(tint, "#ffffff", 0.45) : "#fff" }} />
              </div>
              <div style={{ position: "absolute", right: 0, top: 79, width: 52, textAlign: "right", fontSize: 10.5, color: C.text3, fontVariantNumeric: "tabular-nums" }}>-{fmt(total - Math.floor(elapsed))}</div>
              {/* Controls */}
              <div style={{ position: "absolute", left: 276 - 11, top: BTN_Y - 11, width: 22, height: 22, display: "grid", placeItems: "center" }}><Icon name="prev" size={18} /></div>
              <div style={{ position: "absolute", left: 336 - 15, top: BTN_Y - 15, width: 30, height: 30, borderRadius: 15, background: "#fff", display: "grid", placeItems: "center" }}>
                <Icon name="pause" size={14} color="#000" />
              </div>
              <div style={{ position: "absolute", left: NEXT_X - 11, top: BTN_Y - 11, width: 22, height: 22, display: "grid", placeItems: "center", transform: `scale(${nextPress ? 0.84 : 1})` }}><Icon name="next" size={18} /></div>
              <div style={{ position: "absolute", right: 14, top: BTN_Y - 9 }}><Bars frame={f} color={s === "music" ? mix(tint, "#ffffff", 0.45) : "#fff"} h={18} /></div>
            </div>

            {/* Lyric row (music only) */}
            {s === "music" && (
              <>
                <div style={{ position: "absolute", left: 28, right: 28, top: LYRIC_Y, height: 20, textAlign: "center", lineHeight: "20px", opacity: lineDip }}>
                  <Karaoke text={ly.cur} p={ly.p} size={12.5} weight={600} />
                </div>
                <div style={{ position: "absolute", right: 0, top: LYRIC_Y, width: 24, height: 20, display: "grid", placeItems: "center", color: panelOn ? C.accent : C.text2 }}><Icon name="pip" size={14} /></div>
                {f >= T.panelClick - 14 && f < T.panelClick + 34 && (
                  <div style={{ position: "absolute", right: 0, top: 112, height: 17, padding: "0 7px", borderRadius: 5, background: "#2a2a2d", boxShadow: "0 0 0 1px rgba(255,255,255,.1)", fontSize: 10.5, fontWeight: 500, display: "flex", alignItems: "center", whiteSpace: "nowrap", zIndex: 4 }}>
                    {f >= T.panelClick + 2 ? "Bảng lời nổi: bật" : "Bảng lời nổi: tắt"}
                  </div>
                )}
              </>
            )}

            {/* Subtitle finder's line */}
            {browser && toast > 0 && (
              <div style={{ position: "absolute", left: 0, top: LYRIC_Y + 1, height: 18, padding: "0 8px", borderRadius: 5, background: "#2a2a2d", boxShadow: "0 0 0 1px rgba(255,255,255,.1)", fontSize: 10.5, fontWeight: 500, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", opacity: toast }}>
                <Icon name="check" size={11} stroke={2.6} color={C.green} />Đã nạp phụ đề Last.Race.WEB-DL, lệch +1.5s
              </div>
            )}

            {/* Menus */}
            {ctx > 0 && (
              <MenuBox x={CHIP_SRC.x} w={138} o={ctx}>
                <Item label="Luôn hiện nguồn này" hot={f >= T.rClick + 16} />
              </MenuBox>
            )}
            {menu1 > 0 && (
              <MenuBox x={CAP_X} w={150} o={menu1}>
                <Item label="Nạp file…" />
                <Item label="Tìm phụ đề tự động" hot={f >= T.find - 8} />
              </MenuBox>
            )}
            {menu2 > 0 && (
              <MenuBox x={CAP_X} w={196} o={menu2}>
                <Item label="Last.Race.WEB-DL" dim />
                <Item label="Đặt lại độ lệch" />
                <Item label="Tự căn theo tiếng thoại" />
                <Item label="Hiện phụ đề nổi trên phim" check />
                <Item label="Tự căn lại khi bị lệch" check hot={f >= T.adA + 2} />
                <div style={{ height: 9, display: "flex", alignItems: "center" }}><i style={{ flex: 1, height: 1, background: C.fill(0.14) }} /></div>
                <Item label="Gỡ phụ đề" tone={C.red} />
              </MenuBox>
            )}
          </Page>
        </Notch>

        {/* The finger pair of a pinch on the subtitle */}
        {f >= T.pinchA - 4 && f < T.pinchB + 8 && (
          <>
            {[-1, 1].map((d) => {
              const sep = kf(f, [[T.pinchA, 36], [T.pinchB, 120]]);
              return (
                <i
                  key={d}
                  style={{
                    position: "absolute", left: SUB_X + (d * sep) / 2 - 8, top: subCenterY(f) + 30, width: 16, height: 16, borderRadius: 8, zIndex: 30,
                    background: "rgba(255,255,255,.35)", boxShadow: "0 0 0 1px rgba(255,255,255,.6)", opacity: fade(f, T.pinchA - 4, T.pinchB + 8, 4, 8),
                  }}
                />
              );
            })}
          </>
        )}

        <Cursor frame={f} moves={moves} clicks={clicks} />
      </Desktop>

      <Tag frame={f} from={T.open + 14} to={T.open + 76} text="Cột sóng theo phổ âm thanh thật" top={566} />
      <Tag frame={f} from={T.next + 4} to={T.next + 58} text="Màu theo ảnh bìa" top={566} />
      <Tag frame={f} from={318} to={382} text="Tô theo từng chữ" top={566} />
      <Tag frame={f} from={T.close + 8} to={T.reArrive + 8} text="Hiện lời 2 dòng dưới notch" top={196} />
      <Tag frame={f} from={T.count + 2} to={T.found} text="Tự căn theo tiếng thoại" top={450} left={624} toggle={false} />

      <Captions
        frame={f}
        label="Media"
        lines={[
          { f: 52, to: 120, text: "Bài đang phát của mọi app, điều khiển ngay dưới notch" },
          { f: 126, to: 232, text: "Nhiều nguồn cùng phát: bấm chip để chuyển" },
          { f: 238, to: 304, text: "Đổi bài: màu nền đổi mượt theo ảnh bìa" },
          { f: 310, to: 380, text: "Lời bài hát chạy theo từng chữ" },
          { f: 398, to: 466, text: "Hai dòng lời ngay dưới notch thu gọn" },
          { f: 472, to: 540, text: "Bảng lời nổi: lời bài hát ở góc màn hình" },
          { f: 572, to: 636, text: "Tìm phụ đề tự động cho phim đang xem" },
          { f: 640, to: 704, text: "Nghe tiếng thoại để tự căn thời gian" },
          { f: 708, to: 770, text: "Phụ đề vẽ ngay trong trang phim; kéo để đổi độ cao" },
          { f: 776, to: 856, text: "Chụm hai ngón trên chữ để đổi cỡ" },
          { f: 862, to: 934, text: "Tự căn lại khi bị lệch, như sau quảng cáo giữa phim" },
        ]}
      />
      {title && <ChapterTitle frame={f} title="Media" sub="Mọi thứ đang phát, ngay dưới notch" />}
    </>
  );
};

export const media: SceneDef = { id: "media", label: "Media", dur: T.end, Comp: MediaScene };
