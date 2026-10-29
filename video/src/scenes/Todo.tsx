import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT } from "../lib/theme";
import { fade, pop, prog, springSteps, typed } from "../lib/time";
import { Desktop, ON_NOTCH } from "../ui/Desktop";
import { Cursor, Move } from "../ui/Cursor";
import { Icon } from "../ui/Icons";
import { Btn, Captions, ChapterTitle } from "../ui/Kit";
import { hexA, Notch, Page, TabBar } from "../ui/Notch";
import type { SceneDef, SceneProps } from "./types";

const T = { open: 50, click: 66, type: 72, parse: 116, tick: 160, end: 210 } as const;

// Page origin in screen points (the open notch is 600 wide).
const PX = 476, PY = 68;
const ROW0 = 36, ROW_H = 24, GAP = 6;
const TICKED = 2;

const TEXT = "!!! gọi khách 15h30 mai";

const OPEN_ITEMS = [
  { title: "Gửi báo giá cho khách", due: "hôm qua", late: true },
  { title: "Trả lời email của Hà", due: "hôm qua", late: true },
  { title: "Chuẩn bị slide thuyết trình", due: "Hôm nay", late: false },
];
const DONE_ITEMS = ["Mua sữa", "Gọi cho mẹ", "Thanh toán tiền điện"];

const moves: Move[] = [
  { f: 0, x: 1000, y: 330 },
  { f: T.click - 3, x: PX + 150, y: PY + 14, d: 20 },
  { f: T.tick - 4, x: PX + 9, y: PY + ROW0 + TICKED * ROW_H + 12, d: 24 },
  { f: T.end, x: PX + 380, y: PY + ROW0 + TICKED * ROW_H + 40, d: 30 },
];
const clicks = [T.click, T.tick];

const Box: React.FC<{ done: boolean }> = ({ done }) =>
  done ? (
    <div style={{ width: 15, height: 15, borderRadius: 8, background: C.green, display: "grid", placeItems: "center", color: "#000" }}>
      <Icon name="check" size={10} stroke={3.2} />
    </div>
  ) : (
    <div style={{ width: 15, height: 15, borderRadius: 8, border: `1.5px solid ${C.text3}`, boxSizing: "border-box" }} />
  );

const Row: React.FC<{ i: number; title: string; done: boolean; strike?: number; right?: React.ReactNode; tint?: number }> = ({ i, title, done, strike = done ? 1 : 0, right, tint = 0 }) => (
  <div
    style={{
      position: "absolute", left: 0, right: 0, top: ROW0 + i * ROW_H + (i >= OPEN_ITEMS.length ? GAP : 0), height: ROW_H - 2, display: "flex", alignItems: "center", gap: 10, padding: "0 4px",
      borderRadius: 5, background: tint > 0 ? `rgba(255,69,58,${0.1 * tint})` : "transparent",
    }}
  >
    <Box done={done} />
    <span style={{ position: "relative", fontSize: 12.5, fontWeight: 500, color: done ? C.text3 : C.text }}>
      {title}
      <i style={{ position: "absolute", left: 0, top: "52%", height: 1.5, width: `${100 * strike}%`, background: C.text2 }} />
    </span>
    <span style={{ flex: 1 }} />
    {right}
  </div>
);

const Due: React.FC<{ children: React.ReactNode; late?: boolean }> = ({ children, late }) =>
  late ? (
    <span style={{ fontSize: 11, fontWeight: 700, color: C.red, background: hexA(C.red, 0.16), borderRadius: 4, padding: "1px 7px" }}>{children}</span>
  ) : (
    <span style={{ fontSize: 11, fontWeight: 500, color: C.text2, fontVariantNumeric: "tabular-nums" }}>{children}</span>
  );

const TodoScene: React.FC<SceneProps> = ({ title = true }) => {
  const f = useCurrentFrame();
  const open = springSteps(f, [[0, 0], [T.open, 1]]);
  const text = typed(f, T.type, TEXT, 14);
  const focus = f >= T.click;
  const caret = focus && Math.floor(f / 15) % 2 === 0;
  const parse = pop(f, T.parse);
  const tickP = prog(f, T.tick, 6);
  const undo = pop(f, T.tick + 4);
  const done = f >= T.tick ? 5 : 4;
  const hl = fade(f, 138, 204, 10, 14);

  return (
    <>
      <Desktop camera={ON_NOTCH}>
        <Notch open={open} contentH={236}>
          <TabBar active={5} />
          <Page style={{ fontFamily: FONT.ui, color: C.text }}>
            <div
              style={{
                position: "absolute", left: 0, top: 0, width: 300, height: 28, borderRadius: 6, background: C.fill(0.08), display: "flex", alignItems: "center", gap: 8, padding: "0 10px",
                boxShadow: focus ? `inset 0 0 0 1.5px ${hexA(C.accent, 0.8)}` : "none",
              }}
            >
              <Icon name="plus" size={13} color={C.text2} />
              <span style={{ fontSize: 12.5, fontWeight: 500, color: text ? C.text : C.text3, whiteSpace: "nowrap" }}>
                {text || "Thêm việc…"}
                {caret && <i style={{ display: "inline-block", width: 1.5, height: 14, background: C.text, marginLeft: 1, verticalAlign: -2 }} />}
              </span>
            </div>
            {parse > 0.01 && (
              <div
                style={{
                  position: "absolute", left: 312, top: 3, height: 22, display: "flex", alignItems: "center", gap: 6, padding: "0 9px", borderRadius: 5, background: hexA(C.blue, 0.2),
                  fontSize: 11.5, fontWeight: 600, color: C.cyan, whiteSpace: "nowrap", opacity: Math.min(1, parse), transform: `translateX(${(1 - parse) * -8}px)`,
                }}
              >
                Ngày mai · 15:30 · <b style={{ color: C.orange, letterSpacing: ".04em" }}>!!!</b>
              </div>
            )}
            <div style={{ position: "absolute", right: 2, top: 6, fontSize: 11.5, fontWeight: 600, color: C.text2, fontVariantNumeric: "tabular-nums" }}>Xong {done}/7</div>

            {OPEN_ITEMS.map((it, i) => (
              <Row
                key={it.title}
                i={i}
                title={it.title}
                done={i === TICKED && tickP > 0}
                strike={i === TICKED ? tickP : 0}
                tint={it.late ? hl : 0}
                right={
                  i === TICKED && undo > 0.01 ? (
                    <span style={{ opacity: Math.min(1, undo) }}><Btn style={{ height: 20, fontSize: 11 }}>Hoàn tác</Btn></span>
                  ) : (
                    <Due late={it.late}>{it.due}</Due>
                  )
                }
              />
            ))}
            {DONE_ITEMS.map((t, i) => <Row key={t} i={OPEN_ITEMS.length + i} title={t} done />)}
          </Page>
        </Notch>
        <Cursor frame={f} moves={moves} clicks={clicks} />
      </Desktop>
      <Captions
        frame={f}
        label="Việc cần làm"
        lines={[
          { f: 52, to: 132, text: "Thêm việc kèm giờ và độ ưu tiên", keys: ["⌃⌥⇧D"] },
          { f: 138, to: 208, text: "Việc quá hạn luôn lên đầu" },
        ]}
      />
      {title && <ChapterTitle frame={f} title="Việc cần làm" sub="Lời nhắc của Apple, gọn trong notch" />}
    </>
  );
};

export const todo: SceneDef = { id: "todo", label: "Việc cần làm", dur: T.end, Comp: TodoScene };
