import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT } from "../lib/theme";
import { fade, kf, pop, prog, springSteps, typed } from "../lib/time";
import { Desktop, ON_NOTCH } from "../ui/Desktop";
import { Cursor, Move } from "../ui/Cursor";
import { Icon } from "../ui/Icons";
import { Btn, Captions, ChapterTitle } from "../ui/Kit";
import { hexA, Notch, Page, TabBar } from "../ui/Notch";
import type { SceneDef, SceneProps } from "./types";

const T = { live: 34, open: 78, hover: 112, plus: 150, type: 160, preview: 208, end: 240 } as const;

// Page origin in screen points (the open notch is 600 wide).
const PX = 476, PY = 68;
const at = (x: number, y: number) => ({ x: PX + x, y: PY + y });
const BTN = { join: at(47, 116), plus: at(546, 12) };

const moves: Move[] = [
  { f: 0, x: 1000, y: 330 },
  { f: T.hover, ...BTN.join, d: 28 },
  { f: T.plus - 3, ...BTN.plus, d: 26 },
  { f: T.end, x: PX + 470, y: PY + 100, d: 30 },
];
const clicks = [T.plus];

const EVENTS = [
  { time: "10:00", title: "Họp nhóm thiết kế", color: C.blue },
  { time: "12:00", title: "Ăn trưa với Linh", color: C.green },
  { time: "13:00", title: "Demo sản phẩm", color: C.orange },
  { time: "17:30", title: "Chạy bộ", color: C.pink },
];

const QUICK = "họp nhóm 3h chiều mai";

const CalendarScene: React.FC<SceneProps> = ({ title = true }) => {
  const f = useCurrentFrame();
  const open = springSteps(f, [[0, 0], [T.open, 1]]);
  const live = springSteps(f, [[0, 0], [T.live, 1]]);
  // Quick add replaces the day view: the notch shrinks to fit it.
  const quick = prog(f, T.plus + 2, 10);
  const contentH = kf(f, [[T.plus, 226], [T.plus + 14, 160]]);
  const day = 1 - quick;
  const text = typed(f, T.type, QUICK, 14);
  const caret = f >= T.plus + 6 && Math.floor(f / 15) % 2 === 0;
  const preview = pop(f, T.preview);
  const hoverJoin = f >= T.hover - 4 && f < T.plus - 6;
  const seen = fade(f, T.open + 6, T.plus, 10, 8);

  return (
    <>
      <Desktop camera={ON_NOTCH}>
        <Notch
          open={open}
          live={live}
          contentH={contentH}
          leading={
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <i style={{ width: 8, height: 8, borderRadius: 4, background: C.blue }} />
              <Icon name="timer" size={15} color={C.text} />
            </span>
          }
          trailing={<span style={{ fontFamily: FONT.ui, fontWeight: 700, fontSize: 12.5, color: C.text, whiteSpace: "nowrap" }}>5 phút</span>}
        >
          <TabBar active={4} />
          <Page style={{ fontFamily: FONT.ui, color: C.text }}>
            <div style={{ position: "absolute", left: 0, top: 0, fontSize: 14.5, fontWeight: 700 }}>Thứ Tư, 29 tháng 10</div>
            <div
              style={{
                position: "absolute", right: 0, top: 0, width: 28, height: 22, borderRadius: 6, display: "grid", placeItems: "center",
                background: f >= T.plus && f < T.plus + 6 ? C.fill(0.26) : quick > 0.5 ? C.fill(0.18) : C.fill(0.1),
              }}
            >
              <Icon name="plus" size={14} />
            </div>

            {day > 0.02 && (
              <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, opacity: day }}>
                <div style={{ position: "absolute", left: 0, top: 30, width: 250, height: 104, borderRadius: 8, background: C.fill(0.07) }}>
                  <div style={{ position: "absolute", left: 12, top: 9, display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, fontWeight: 600, color: C.text2 }}>
                    <i style={{ width: 7, height: 7, borderRadius: 4, background: C.blue }} />
                    Sắp tới
                  </div>
                  <div style={{ position: "absolute", left: 12, top: 27, fontSize: 15, fontWeight: 700 }}>Họp nhóm thiết kế</div>
                  <div style={{ position: "absolute", left: 12, top: 49, fontSize: 11.5, color: C.text2, fontVariantNumeric: "tabular-nums" }}>10:00 – 11:00</div>
                  <div style={{ position: "absolute", left: 12, top: 72, display: "flex", gap: 6 }}>
                    <Btn tone={C.blue} pressed={hoverJoin} style={{ width: 70, justifyContent: "center", filter: hoverJoin ? "brightness(1.2)" : undefined }}>Tham gia</Btn>
                    <Btn style={{ width: 64, justifyContent: "center" }}>Báo lại</Btn>
                    <Btn style={{ width: 64, justifyContent: "center" }}>Bỏ qua</Btn>
                  </div>
                </div>
                <div style={{ position: "absolute", left: 266, top: 30, right: 0 }}>
                  {EVENTS.map((e, i) => (
                    <div
                      key={e.title}
                      style={{
                        height: 24, display: "flex", alignItems: "center", gap: 10, padding: "0 8px", borderRadius: 5,
                        background: i === 0 ? hexA(C.blue, 0.14 + 0.06 * seen) : "transparent",
                      }}
                    >
                      <i style={{ width: 8, height: 8, borderRadius: 4, background: e.color, flex: "none" }} />
                      <span style={{ width: 40, fontSize: 11.5, color: C.text2, fontVariantNumeric: "tabular-nums" }}>{e.time}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: "nowrap" }}>{e.title}</span>
                    </div>
                  ))}
                </div>
                <div style={{ position: "absolute", left: 0, right: 0, top: 142, height: 1, background: C.fill(0.1) }} />
                <div style={{ position: "absolute", left: 0, top: 150, fontSize: 11.5, color: C.text2, whiteSpace: "nowrap" }}>
                  <b style={{ color: C.text, fontWeight: 600 }}>Hôm nay:</b> 4 sự kiện, rảnh 14:00–16:00, kết thúc lúc 18:30
                </div>
              </div>
            )}

            {quick > 0.02 && (
              <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, opacity: quick }}>
                <div
                  style={{
                    position: "absolute", left: 0, right: 0, top: 30, height: 32, borderRadius: 6, background: C.fill(0.08), display: "flex", alignItems: "center", padding: "0 12px",
                    boxShadow: `inset 0 0 0 1.5px ${hexA(C.accent, 0.8)}`, fontSize: 13.5, fontWeight: 500, whiteSpace: "nowrap",
                  }}
                >
                  {text}
                  {caret && <i style={{ display: "inline-block", width: 1.5, height: 15, background: C.text, marginLeft: 1 }} />}
                </div>
                {preview > 0.01 && (
                  <div
                    style={{
                      position: "absolute", left: 0, top: 70, height: 30, display: "flex", alignItems: "center", gap: 8, padding: "0 12px", borderRadius: 6,
                      background: hexA(C.blue, 0.18), color: C.cyan, fontSize: 12.5, fontWeight: 600, opacity: Math.min(1, preview), transform: `translateY(${(1 - preview) * -6}px)`,
                    }}
                  >
                    <Icon name="calendar" size={14} />
                    Ngày mai · 15:00 – 16:00
                  </div>
                )}
              </div>
            )}
          </Page>
        </Notch>
        <Cursor frame={f} moves={moves} clicks={clicks} />
      </Desktop>
      <Captions
        frame={f}
        label="Lịch"
        lines={[
          { f: 50, to: 140, text: "Báo họp trước, kèm nút Tham gia" },
          { f: 146, to: 236, text: "Thêm sự kiện bằng một câu tiếng Việt" },
        ]}
      />
      {title && <ChapterTitle frame={f} title="Lịch" sub="Cuộc họp kế tiếp, không bỏ lỡ" />}
    </>
  );
};

export const calendar: SceneDef = { id: "calendar", label: "Lịch", dur: T.end, Comp: CalendarScene };
