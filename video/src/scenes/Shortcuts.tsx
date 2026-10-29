import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT } from "../lib/theme";
import { pop, springSteps } from "../lib/time";
import { Desktop, ON_NOTCH } from "../ui/Desktop";
import { Cursor, Move } from "../ui/Cursor";
import { Icon, IconName } from "../ui/Icons";
import { Btn, Captions, ChapterTitle } from "../ui/Kit";
import { Notch, Page, TabBar } from "../ui/Notch";
import type { SceneDef, SceneProps } from "./types";

// Grid of favourite Apple Shortcuts. Two are run: "Nén ảnh" ends with a tick strip under the collapsed notch,
// "Tạo ghi chú họp" returns text, which opens the notch as a toast with a Chép button.

const T = { open: 44, textRun: 56, zipRun: 66, close: 82, zipDone: 90, zipEnd: 118, toast: 118, end: 150 } as const;

const PX = 476, PY = 68;
const at = (x: number, y: number) => ({ x: PX + x, y: PY + y });
const CELL = { w: 134, h: 88, gx: 142, y0: 8 };

const SHORTCUTS: { name: string; icon: IconName; color: string }[] = [
  { name: "Bật chế độ tập trung", icon: "eye", color: "#5864d6" },
  { name: "Gửi vị trí", icon: "pin", color: "#2f9a68" },
  { name: "Tạo ghi chú họp", icon: "doc", color: "#d4852a" },
  { name: "Nén ảnh", icon: "photo", color: "#c4507a" },
];
const TEXT = 2, ZIP = 3;
const cell = (i: number) => ({ x: i * CELL.gx, y: CELL.y0 });
const centre = (i: number) => at(cell(i).x + CELL.w / 2, cell(i).y + CELL.h / 2);

const moves: Move[] = [
  { f: 0, x: 980, y: 330 },
  { f: T.open - 2, x: 760, y: 16, d: 28 },
  { f: T.textRun - 2, ...centre(TEXT), d: 14 },
  { f: T.zipRun - 2, ...centre(ZIP), d: 8 },
  { f: T.close, x: 960, y: 330, d: 14 },
];
const clicks = [T.textRun, T.zipRun];

const Spinner: React.FC<{ frame: number }> = ({ frame }) => (
  <svg width={26} height={26} viewBox="0 0 26 26">
    <circle cx={13} cy={13} r={9} fill="none" stroke={C.fill(0.2)} strokeWidth={2.4} />
    <circle cx={13} cy={13} r={9} fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeDasharray="16 41" transform={`rotate(${frame * 16} 13 13)`} />
  </svg>
);

const ShortcutsScene: React.FC<SceneProps> = ({ title = true }) => {
  const f = useCurrentFrame();
  const open = springSteps(f, [[0, 0], [T.open, 1], [T.close, 0], [T.toast, 1]]);
  const strip = springSteps(f, [[0, 0], [T.zipDone, 26], [T.zipEnd - 2, 0]]);
  const toastMode = f >= T.toast - 2;
  const running = (i: number) => (i === TEXT && f >= T.textRun && f < T.toast) || (i === ZIP && f >= T.zipRun && f < T.zipDone);
  const pressed = (i: number) => (i === TEXT ? f >= T.textRun && f < T.textRun + 6 : i === ZIP && f >= T.zipRun && f < T.zipRun + 6);
  const tick = pop(f, T.zipDone);
  const toast = pop(f, T.toast + 2);

  return (
    <>
      <Desktop camera={ON_NOTCH}>
        <Notch
          open={open}
          strip={strip}
          contentH={toastMode ? 76 : 164}
          stripContent={(
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: FONT.ui, fontSize: 12, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", transform: `scale(${0.9 + 0.1 * tick})` }}>
              <span style={{ width: 15, height: 15, borderRadius: 8, background: C.green, display: "grid", placeItems: "center", color: "#06130a" }}>
                <Icon name="check" size={10} stroke={3} />
              </span>
              Đã chạy Nén ảnh
            </span>
          )}
        >
          {!toastMode && (
            <>
              <TabBar active={6} badge="stack" />
              <Page style={{ fontFamily: FONT.ui, color: C.text }}>
                {SHORTCUTS.map((s, i) => (
                  <div
                    key={s.name}
                    style={{
                      position: "absolute", left: cell(i).x, top: cell(i).y, width: CELL.w, height: CELL.h, borderRadius: 6, boxSizing: "border-box", padding: "12px 12px 0",
                      display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10, background: pressed(i) || running(i) ? C.fill(0.18) : C.fill(0.08),
                    }}
                  >
                    <span style={{ width: 30, height: 30, borderRadius: 6, flex: "none", display: "grid", placeItems: "center", background: running(i) ? "transparent" : s.color, color: "#fff" }}>
                      {running(i) ? <Spinner frame={f} /> : <Icon name={s.icon} size={17} stroke={2} />}
                    </span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.25 }}>{s.name}</span>
                  </div>
                ))}
              </Page>
            </>
          )}
          {toastMode && (
            <div style={{ position: "absolute", left: 20, right: 20, top: 8, fontFamily: FONT.ui, color: C.text, opacity: toast, transform: `translateY(${(1 - toast) * 6}px)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 600, color: C.text2, height: 18 }}>
                <span style={{ width: 16, height: 16, borderRadius: 4, background: SHORTCUTS[TEXT].color, display: "grid", placeItems: "center", color: "#fff" }}>
                  <Icon name={SHORTCUTS[TEXT].icon} size={10} stroke={2.2} />
                </span>
                {SHORTCUTS[TEXT].name}
              </div>
              <div style={{ position: "absolute", left: 0, top: 24, fontSize: 15, fontWeight: 600 }}>Họp nhóm 09:30 · 3 việc cần làm</div>
              <div style={{ position: "absolute", right: 0, top: 22 }}><Btn icon="copy">Chép</Btn></div>
            </div>
          )}
        </Notch>
        <Cursor frame={f} moves={moves} clicks={clicks} />
      </Desktop>
      <Captions frame={f} label="Shortcuts" lines={[{ f: 48, to: 148, text: "Chạy Apple Shortcuts ưa thích từ notch" }]} />
      {title && <ChapterTitle frame={f} title="Shortcuts" sub="Các shortcut ưa thích, một chạm" />}
    </>
  );
};

export const shortcuts: SceneDef = { id: "shortcuts", label: "Shortcuts", dur: T.end, Comp: ShortcutsScene };
