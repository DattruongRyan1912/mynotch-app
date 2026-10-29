import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT } from "../lib/theme";
import { pop, springSteps, typed } from "../lib/time";
import { Desktop, ON_NOTCH } from "../ui/Desktop";
import { Cursor, Move } from "../ui/Cursor";
import { Icon } from "../ui/Icons";
import { Btn, Captions, ChapterTitle } from "../ui/Kit";
import { Notch, Page, TabBar, hexA } from "../ui/Notch";
import type { SceneDef, SceneProps } from "./types";

// The Cổng page: which process holds which port. Ask whether 8000 is free, then stop node on 3000 (with a confirm row).

const T = { open: 46, focus: 66, type: 70, result: 92, hover: 110, stop: 124, yes: 150, end: 180 } as const;

const PX = 476, PY = 68;
const at = (x: number, y: number) => ({ x: PX + x, y: PY + y });
const ROW_Y = 34, ROW_H = 32, ROW_GAP = 2;
const rowY = (i: number) => ROW_Y + i * (ROW_H + ROW_GAP);
// Row buttons, right-aligned with 8 of padding: Mở, Chép, Dừng.
const BTN = { stop: at(528, rowY(0) + 16), yes: at(474, rowY(0) + 16) };

const moves: Move[] = [
  { f: 0, x: 980, y: 330 },
  { f: T.open - 2, x: 760, y: 16, d: 28 },
  { f: T.focus - 2, ...at(288 + 130, 13), d: 18 },
  { f: T.hover - 2, ...at(330, rowY(0) + 16), d: 18 },
  { f: T.stop - 2, ...BTN.stop, d: 12 },
  { f: T.yes - 2, ...BTN.yes, d: 16 },
  { f: T.end - 4, ...at(300, 80), d: 20 },
];
const clicks = [T.focus, T.stop, T.yes];

const ROWS = [
  { port: "3000", tag: "Node", proc: "node", pid: "PID 4127" },
  { port: "5173", tag: "Vite", proc: "node", pid: "PID 4210" },
  { port: "5432", tag: "Postgres", proc: "postgres", pid: "PID 612" },
];

const Field: React.FC<{ x: number; icon: "search" | "plug"; focused?: boolean; children: React.ReactNode }> = ({ x, icon, focused, children }) => (
  <div
    style={{
      position: "absolute", left: x, top: 0, width: 272, height: 26, borderRadius: 6, boxSizing: "border-box", padding: "0 8px", display: "flex", alignItems: "center", gap: 7,
      background: C.fill(0.08), boxShadow: focused ? `inset 0 0 0 1.5px ${C.accent}` : "none", fontSize: 12, color: C.text2,
    }}
  >
    <Icon name={icon} size={13} />
    {children}
  </div>
);

const PortsScene: React.FC<SceneProps> = ({ title = true }) => {
  const f = useCurrentFrame();
  const open = springSteps(f, [[0, 0], [T.open, 1]]);
  const focused = f >= T.focus && f < T.hover - 6;
  const text = typed(f, T.type, "8000", 9);
  const caret = focused && Math.floor(f / 8) % 2 === 0;
  const result = pop(f, T.result);
  const hover = f >= T.hover;
  const confirm = f >= T.stop + 2 && f < T.yes + 2;
  const done = f >= T.yes + 2;
  const doneIn = pop(f, T.yes + 2);

  return (
    <>
      <Desktop camera={ON_NOTCH}>
        <Notch open={open}>
          <TabBar active={6} badge="plug" />
          <Page style={{ fontFamily: FONT.ui, color: C.text }}>
            <Field x={0} icon="search">
              <span style={{ color: C.text3 }}>Lọc theo cổng hoặc tên</span>
            </Field>
            <Field x={288} icon="plug" focused={focused}>
              {text === "" && !focused && <span style={{ color: C.text3 }}>Cổng nào đang bị chiếm?</span>}
              {(text !== "" || focused) && (
                <span style={{ color: "#fff", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                  {text}<i style={{ display: "inline-block", width: 1.5, height: 13, marginLeft: 1, verticalAlign: "-2px", background: caret ? "#fff" : "transparent" }} />
                </span>
              )}
              {result > 0 && (
                <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5, color: C.green, fontWeight: 600, opacity: result, transform: `translateX(${(1 - result) * 6}px)` }}>
                  <Icon name="check" size={13} stroke={2.4} />Cổng 8000 trống
                </span>
              )}
            </Field>

            {ROWS.map((r, i) => {
              const first = i === 0;
              const asking = first && confirm;
              const stopped = first && done;
              return (
                <div
                  key={r.port}
                  style={{
                    position: "absolute", left: 0, right: 0, top: rowY(i), height: ROW_H, borderRadius: 6, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 10, padding: "0 10px",
                    background: asking ? "rgba(255,69,58,.14)" : first && hover && !stopped ? C.fill(0.09) : C.fill(0.05),
                  }}
                >
                  {asking ? (
                    <>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Dừng node (cổng 3000)?</span>
                      <span style={{ position: "absolute", right: 8, top: 4, display: "flex", gap: 6 }}>
                        <Btn tone={C.red} pressed={f >= T.yes - 1} style={{ width: 48, justifyContent: "center", boxSizing: "border-box" }}>Dừng</Btn>
                        <Btn style={{ width: 48, justifyContent: "center", boxSizing: "border-box" }}>Huỷ</Btn>
                      </span>
                    </>
                  ) : stopped ? (
                    <>
                      <div style={{ width: 18, height: 18, borderRadius: 9, background: C.green, display: "grid", placeItems: "center", color: "#06130a", transform: `scale(${0.5 + 0.5 * doneIn})` }}>
                        <Icon name="check" size={12} stroke={3} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, opacity: doneIn }}>Đã dừng node (cổng 3000)</span>
                    </>
                  ) : (
                    <>
                      <span style={{ width: 54, fontFamily: FONT.mono, fontWeight: 500, fontSize: 18, letterSpacing: "-.02em" }}>{r.port}</span>
                      <span style={{ width: 64, display: "flex" }}>
                        <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: hexA(C.accent, 0.3), color: "#cdbfff" }}>{r.tag}</span>
                      </span>
                      <span style={{ width: 138, display: "inline-flex", alignItems: "baseline", gap: 6, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
                        {r.proc}<span style={{ fontFamily: FONT.mono, fontSize: 10.5, fontWeight: 400, color: C.text3 }}>{r.pid}</span>
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: C.text2, whiteSpace: "nowrap" }}>
                        <Icon name="lock" size={11} />Chỉ máy này
                      </span>
                      {first && hover && (
                        <span style={{ position: "absolute", right: 8, top: 4, display: "flex", gap: 6, opacity: pop(f, T.hover) }}>
                          <Btn style={{ width: 40, justifyContent: "center", boxSizing: "border-box" }}>Mở</Btn>
                          <Btn style={{ width: 48, justifyContent: "center", boxSizing: "border-box" }}>Chép</Btn>
                          <Btn tone={C.red} pressed={f >= T.stop - 1 && f < T.stop + 6} style={{ width: 48, justifyContent: "center", boxSizing: "border-box" }}>Dừng</Btn>
                        </span>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </Page>
        </Notch>
        <Cursor frame={f} moves={moves} clicks={clicks} />
      </Desktop>
      <Captions
        frame={f}
        label="Cổng"
        lines={[
          { f: 48, to: 112, text: "Cổng nào đang mở, của tiến trình nào" },
          { f: 118, to: 178, text: "Mở, chép địa chỉ hoặc dừng ngay" },
        ]}
      />
      {title && <ChapterTitle frame={f} title="Cổng" sub="Cổng nào đang bị chiếm, bởi ai" />}
    </>
  );
};

export const ports: SceneDef = { id: "ports", label: "Cổng", dur: T.end, Comp: PortsScene };
