import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT, SCREEN } from "../lib/theme";
import { kf, pop, prog, springSteps } from "../lib/time";
import { Desktop, MenuBar } from "../ui/Desktop";
import type { CameraState } from "../ui/Desktop";
import { Cursor } from "../ui/Cursor";
import type { Move } from "../ui/Cursor";
import { Icon } from "../ui/Icons";
import { Btn, Captions, ChapterTitle, Window } from "../ui/Kit";
import { Notch, Page, TabBar } from "../ui/Notch";
import type { SceneDef, SceneProps } from "./types";

// Dịch: select text in a reader and a chip appears beside it; ⌃⌥T opens the Dịch tab and puts the translation back.

type Spec = { start: number; drag: number; show: number; end: number; curEnd: number };
const SEL = {
  s1: { start: 54, drag: 22, show: 82, end: 112, curEnd: 90 },
  s2: { start: 122, drag: 8, show: 134, end: 156, curEnd: 142 },
  s3: { start: 164, drag: 8, show: 176, end: 198, curEnd: 184 },
  s4: { start: 206, drag: 8, show: 218, end: 240, curEnd: 226 },
  s5: { start: 248, drag: 14, show: 268, end: 298, curEnd: 276 },
  s6: { start: 304, drag: 14, show: 99999, end: 404, curEnd: 338 },
} as const satisfies Record<string, Spec>;
const T = { open: 324, out: 338, cursorOn: 340, click: 380, replace: 382, close: 392, end: 450 } as const;

const CAM: CameraState = { zoom: 1.5, fx: 700, fy: 220 };
const SELBG = "rgba(10,132,255,.38)";
const A = C.accent;

const EN6 = "Please send me the final report before Friday.";
const VI6 = "Vui lòng gửi cho tôi báo cáo cuối cùng trước thứ Sáu.";

const X = {
  dots: '<path d="M5 12h.01M12 12h.01M19 12h.01"/>',
  swap: '<path d="M4 8h14M14 4l4 4-4 4M20 16H6M10 12l-4 4 4 4"/>',
} as const;
const Sym: React.FC<{ name: keyof typeof X; size?: number; color?: string; stroke?: number }> = ({ name, size = 12, color = "currentColor", stroke = 1.9 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
    style={{ display: "block", flex: "none", color }} dangerouslySetInnerHTML={{ __html: X[name] }} />
);

// ---------- chips beside the selection ----------
const chipBox: React.CSSProperties = {
  background: "rgba(0,0,0,.92)", boxShadow: `0 0 0 1px ${C.fill(0.14)}, 0 10px 28px rgba(0,0,0,.5)`, borderRadius: 8, fontFamily: FONT.ui, color: C.text, boxSizing: "border-box",
};
const OpenBtn: React.FC = () => (
  <span style={{ height: 20, padding: "0 9px", borderRadius: 6, background: A, fontSize: 11, fontWeight: 600, display: "inline-flex", alignItems: "center", lineHeight: 1.3, flex: "none" }}>Mở</span>
);
const Dots: React.FC = () => (
  <span style={{ width: 18, height: 18, display: "grid", placeItems: "center", color: C.text2, flex: "none" }}><Sym name="dots" size={14} stroke={2.6} /></span>
);
/** A conversion: one line with what was understood, "Mở" and "⋯". */
const ConvChip: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ ...chipBox, display: "flex", alignItems: "center", gap: 8, padding: "6px 7px 6px 10px", whiteSpace: "nowrap" }}>
    <Sym name="swap" size={12} color={A} stroke={2.2} />
    <span style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.4 }}>{text}</span>
    <OpenBtn /><Dots />
  </div>
);
/** A translation: the first line of the original, the result, then the button row. */
const TranslateChip: React.FC<{ original: string; text: string }> = ({ original, text }) => (
  <div style={{ ...chipBox, width: 292, padding: "10px 10px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
    <div style={{ fontSize: 10, lineHeight: 1.4, color: C.text2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{original}</div>
    <div style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.45 }}>{text}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 8, height: 24 }}>
      <Icon name="translate" size={12} color={A} stroke={2.2} />
      <span style={{ flex: 1 }} />
      <OpenBtn /><Dots />
    </div>
  </div>
);
/** A proper name has no translation to show: only a small round button. */
const RoundBtn: React.FC = () => (
  <div style={{ ...chipBox, width: 22, height: 22, borderRadius: 11, display: "grid", placeItems: "center" }}>
    <Icon name="translate" size={11} color={C.text} stroke={2.2} />
  </div>
);

const Pointer: React.FC = () => (
  <svg width={17} height={25} viewBox="0 0 16 24" style={{ display: "block", filter: "drop-shadow(0 1px 2px rgba(0,0,0,.5))" }}>
    <path d="M1.5 1.5v18.5l4.6-4.6 3.4 7.1 3-1.4-3.3-6.9h6.4z" fill="#fff" stroke="#000" strokeWidth={1.3} strokeLinejoin="round" />
  </svg>
);

/**
 * Selected text inside the paragraph. The highlight is a growing part of the text itself, the pointer is anchored to the end of that
 * part and the chip to the whole span, so both follow the real text layout without measuring anything.
 */
const Sel: React.FC<{ f: number; a: Spec; text: string; chip?: React.ReactNode; chipAt?: "start" | "end"; chipShow?: number; full?: boolean }> = ({ f, a, text, chip, chipAt = "start", chipShow = a.show, full }) => {
  const chars = Array.from(text);
  const active = f >= a.start && f < a.end;
  const n = full ? chars.length : Math.round(prog(f, a.start, a.drag) * chars.length);
  const head = active ? chars.slice(0, n).join("") : "";
  const tail = active ? chars.slice(n).join("") : text;
  const ap = prog(f, a.start - 10, 10);
  const curO = kf(f, [[a.start - 10, 0], [a.start - 6, 1], [a.curEnd - 6, 1], [a.curEnd, 0]]);
  const chipO = pop(f, chipShow) * (1 - prog(f, a.end - 6, 6));
  return (
    <span style={{ position: "relative" }}>
      <span style={{ position: "relative", background: n > 0 && active ? SELBG : undefined }}>
        {head}
        {curO > 0.01 && (
          <i style={{ position: "absolute", right: -3, top: "52%", zIndex: 50, opacity: curO, transform: `translate(${(1 - ap) * -70}px, ${(1 - ap) * 40}px)`, pointerEvents: "none" }}><Pointer /></i>
        )}
      </span>
      {tail}
      {chip && chipO > 0.01 && (
        <div
          style={{
            position: "absolute", top: "100%", marginTop: 6, zIndex: 40, fontSize: 12, lineHeight: 1.4, fontWeight: 400, textDecoration: "none", opacity: chipO, transform: `translateY(${(1 - chipO) * -5}px)`,
            ...(chipAt === "start" ? { left: 0 } : { right: -11 }),
          }}
        >
          {chip}
        </div>
      )}
    </span>
  );
};

// ---------- the reader ----------
const P: React.FC<{ top: number; children: React.ReactNode }> = ({ top, children }) => (
  <div style={{ position: "absolute", left: 32, top, width: 576, fontSize: 15, lineHeight: "23px", color: "#e4e4e7" }}>{children}</div>
);

const Reader: React.FC<{ f: number }> = ({ f }) => {
  const done = f >= T.replace;
  return (
    <Window x={380} y={50} w={640} h={490} title="Launch notes" radius={8} style={{ overflow: "visible" }}>
      <P top={22}><span style={{ fontSize: 22, fontWeight: 700, lineHeight: "30px", color: C.text }}>Notes from the Da Nang launch</span></P>
      <P top={72}>
        <Sel f={f} a={SEL.s1} text="Caching stores a copy of data closer to where it is needed." chip={<TranslateChip original="Caching stores a copy of data closer to where it is needed." text="Bộ nhớ đệm lưu một bản sao của dữ liệu gần nơi cần dùng hơn." />} />
        {" "}Reads get faster and the origin server stays calm.
      </P>
      <P top={164}>
        The kiosk is <Sel f={f} a={SEL.s2} text="5 ft 11 in" chip={<ConvChip text="5 ft 11 in → 180 cm" />} /> tall. The call starts at{" "}
        <Sel f={f} a={SEL.s3} text="3pm PST" chip={<ConvChip text="3pm PST → Giờ máy · UTC+7: 06:00 (hôm sau)" />} />.
      </P>
      <P top={212}>
        Every sprint needs <Sel f={f} a={SEL.s4} text="(2+3)*4" chip={<ConvChip text="(2+3)*4 = 20" />} /> story points of buffer.
      </P>
      <P top={260}>
        Run the audit with <Sel f={f} a={SEL.s5} text="Northwind Studio" chip={<RoundBtn />} chipAt="end" /> before release.
      </P>
      <P top={328}>
        <Sel f={f} a={SEL.s6} text={done ? VI6 : EN6} full={done} />
      </P>
    </Window>
  );
};

// ---------- the Dịch tab ----------
const Select: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, height: 22, padding: "0 9px", borderRadius: 6, background: C.fill(0.1), fontSize: 12, fontWeight: 500, whiteSpace: "nowrap" }}>
    {children}<Icon name="chevron" size={9} stroke={2.6} />
  </span>
);
const IconBtn: React.FC<{ name: "speaker" | "copy" }> = ({ name }) => (
  <span style={{ width: 24, height: 22, borderRadius: 6, background: "rgba(0,0,0,.6)", display: "grid", placeItems: "center" }}><Icon name={name} size={12} /></span>
);

const DichTab: React.FC<{ f: number }> = ({ f }) => {
  const out = kf(f, [[T.out, 0], [T.out + 8, 1]]);
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, display: "flex", alignItems: "center", gap: 6 }}>
        <Select>Tự nhận diện · Tiếng Anh</Select>
        <span style={{ width: 24, height: 22, display: "grid", placeItems: "center" }}><Sym name="swap" size={14} /></span>
        <Select>Tiếng Việt</Select>
      </div>
      <div style={{ position: "absolute", left: 0, top: 30, width: 275, height: 104, boxSizing: "border-box", padding: 8, borderRadius: 8, background: C.fill(0.08), fontSize: 13, lineHeight: 1.45 }}>
        {EN6}
        <div style={{ position: "absolute", right: 8, bottom: 8 }}><IconBtn name="speaker" /></div>
      </div>
      <div style={{ position: "absolute", left: 285, top: 30, width: 275, height: 104, boxSizing: "border-box", padding: 8, borderRadius: 8, background: C.fill(0.05), fontSize: 13, lineHeight: 1.45 }}>
        <div style={{ opacity: out }}>{VI6}</div>
        <div style={{ position: "absolute", right: 8, bottom: 8, display: "flex", gap: 4, opacity: out }}><IconBtn name="speaker" /><IconBtn name="copy" /></div>
      </div>
      <div style={{ position: "absolute", left: 0, top: 142, opacity: out }}>
        <Btn tone={A} pressed={f >= T.click - 1} style={{ height: 22 }}>Thay vào chỗ đang chọn</Btn>
      </div>
    </>
  );
};

// ---------- the scene ----------
const moves: Move[] = [{ f: 0, x: 740, y: 330 }, { f: T.click - 4, x: 561, y: 222, d: 30 }];

const TranslationScene: React.FC<SceneProps> = ({ title = true }) => {
  const f = useCurrentFrame();
  const open = springSteps(f, [[0, 0], [T.open, 1], [T.close, 0]]);
  const curO = kf(f, [[T.cursorOn - 4, 0], [T.cursorOn + 4, 1]]);
  return (
    <>
      <Desktop camera={CAM} menu={<MenuBar app="Trình đọc" />}>
        <Reader f={f} />
        <Notch open={open} contentH={220}>
          <TabBar active={2} />
          <Page style={{ fontFamily: FONT.ui, color: C.text }}><DichTab f={f} /></Page>
        </Notch>
        {f > T.cursorOn - 6 && (
          <div style={{ position: "absolute", left: 0, top: 0, width: SCREEN.w, height: SCREEN.h, zIndex: 100, opacity: curO, pointerEvents: "none" }}>
            <Cursor frame={f} moves={moves} clicks={[T.click]} />
          </div>
        )}
      </Desktop>
      <Captions
        frame={f}
        label="Dịch"
        lines={[
          { f: 48, to: 118, text: "Bôi đen một câu, bản dịch hiện ngay cạnh đó" },
          { f: 122, to: 242, text: "Đổi đơn vị, múi giờ và phép tính" },
          { f: 246, to: 306, text: "Tên riêng thì có nút dịch nhỏ" },
          { f: 312, to: 386, text: "Dịch rồi thay luôn vào chỗ đang chọn", keys: ["⌃⌥T"] },
          { f: 390, to: 450, text: "Dịch trên máy bằng Apple, hoặc Google, Microsoft, LLM" },
        ]}
      />
      {title && <ChapterTitle frame={f} title="Dịch" sub="Bôi đen là hiểu" />}
    </>
  );
};

export const translation: SceneDef = { id: "translation", label: "Dịch", dur: T.end, Comp: TranslationScene };
