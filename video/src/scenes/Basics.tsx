import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT, NOTCH } from "../lib/theme";
import { kf, pop, prog, springSteps, step } from "../lib/time";
import { Desktop, ON_NOTCH } from "../ui/Desktop";
import { Cursor, Move } from "../ui/Cursor";
import { Icon, IconName } from "../ui/Icons";
import { Bars, Captions, ChapterTitle, Window } from "../ui/Kit";
import { Bubble, Notch, Page, TabBar } from "../ui/Notch";
import type { SceneDef, SceneProps } from "./types";

// How the notch works, before any module: open and close, pages and "Khác", swipes, live activities and bubbles,
// the strip under the notch, Classic and Liquid Glass, separate tiles, accent colours, and the pill on a display without a notch.

const T = {
  hover: 54, leave: 104, click: 144, tabs: [160, 178, 196, 218] as const, swipe: 244, swipeUp: 282, close: 296,
  live: 312, bubble1: 350, bubble2: 380, plus: 410, list: 436, listOff: 500, strip: 512, stripOff: 584,
  glassOpen: 594, glass: 612, clear: 642, tiles: 668, solid: 724, accent: [740, 755, 770] as const, pill: 790, end: 840,
} as const;

const tabX = (i: number) => 648 + 36 * i; // centre of tab i in screen points
const TAB_Y = 48;

const moves: Move[] = [
  { f: 0, x: 980, y: 380 },
  { f: T.hover, x: 760, y: 16, d: 22 },
  { f: T.leave + 6, x: 930, y: 300 },
  { f: T.click - 4, x: 760, y: 16 },
  { f: T.tabs[0] - 2, x: tabX(0), y: TAB_Y },
  { f: T.tabs[1] - 2, x: tabX(2), y: TAB_Y },
  { f: T.tabs[2] - 2, x: tabX(4), y: TAB_Y },
  { f: T.tabs[3] - 2, x: tabX(6), y: TAB_Y },
  { f: T.swipe, x: 980, y: 330, d: 18 },
  { f: T.list - 4, x: 1020, y: 16, d: 24 },
  { f: T.listOff + 4, x: 1000, y: 330 },
  { f: T.glassOpen - 4, x: 760, y: 16 },
  { f: T.end, x: 1040, y: 340, d: 40 },
];
const clicks = [T.click, ...T.tabs];

const tabIndex = (f: number) =>
  step(f, [[0, 1], [T.tabs[0], 0], [T.tabs[1], 2], [T.tabs[2], 4], [T.tabs[3], 6], [T.swipe + 8, 5], [T.swipe + 20, 4], [T.glassOpen, 1]] as const);

const MORE: [IconName, string][] = [
  ["sliders", "Âm thanh"], ["camera", "Ảnh chụp"], ["timer", "Hẹn giờ"], ["battery", "Battery"],
  ["tray", "Khay"], ["stack", "Shortcuts"], ["gauge", "Hiệu năng"], ["plug", "Cổng"],
];

/** Short stand-ins for each page; the module chapters show them in full. */
const PageFor: React.FC<{ tab: number; f: number }> = ({ tab, f }) => {
  const text: React.CSSProperties = { fontFamily: FONT.ui, color: C.text };
  if (tab === 1) {
    return (
      <Page style={text}>
        <div style={{ position: "absolute", left: 0, top: 4, width: 92, height: 92, borderRadius: 10, background: C.accent }}>
          <div style={{ position: "absolute", left: 46, top: 16, width: 32, height: 32, borderRadius: 16, background: C.fill(0.45) }} />
          <div style={{ position: "absolute", left: -10, top: 54, width: 150, height: 90, borderRadius: 75, background: C.fill(0.22) }} />
        </div>
        <div style={{ position: "absolute", left: 112, top: 8, fontSize: 16, fontWeight: 700 }}>Đêm thành phố</div>
        <div style={{ position: "absolute", left: 112, top: 30, fontSize: 13, color: C.text2 }}>Ban nhạc Mây</div>
        <div style={{ position: "absolute", left: 112, right: 0, top: 58, height: 4, borderRadius: 2, background: C.fill(0.14) }}>
          <div style={{ width: `${62 + prog(f, 0, 840) * 20}%`, height: "100%", borderRadius: 2, background: C.fill(0.85) }} />
        </div>
        <div style={{ position: "absolute", left: 112, right: 0, top: 74, display: "flex", justifyContent: "center", gap: 34, color: "#fff" }}>
          <Icon name="prev" size={20} /><Icon name="pause" size={22} /><Icon name="next" size={20} />
        </div>
        <div style={{ position: "absolute", right: 0, top: 76 }}><Bars frame={f} /></div>
      </Page>
    );
  }
  if (tab === 0) {
    const cards = ["Trưa nay họp lúc 12:30", "#7D5CFF", "example.com", "func greet()"];
    return (
      <Page style={text}>
        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          {cards.map((c, i) => (
            <div key={c} style={{ width: 128, height: 112, borderRadius: 10, background: "#161618", padding: 10, fontSize: 12, fontFamily: i === 3 ? FONT.mono : FONT.ui }}>
              {i === 1 ? <div style={{ height: 60, borderRadius: 6, background: C.accent, marginBottom: 6 }} /> : null}
              {c}
            </div>
          ))}
        </div>
      </Page>
    );
  }
  if (tab === 2) {
    return (
      <Page style={text}>
        {["Where is the nearest station?", "Ga gần nhất ở đâu?"].map((t, i) => (
          <div key={t} style={{ position: "absolute", top: 8, left: i * 284, width: 276, height: 110, borderRadius: 8, background: C.fill(0.07), padding: 12, fontSize: 15 }}>{t}</div>
        ))}
      </Page>
    );
  }
  if (tab === 4 || tab === 5) {
    const rows = tab === 4 ? [["10:00", "Họp nhóm thiết kế"], ["13:30", "Ăn trưa với Lan"], ["16:00", "Gọi khách hàng"]] : [["!!", "Gửi báo giá"], ["", "Đặt lịch nha sĩ"], ["", "Mua quà sinh nhật"]];
    return (
      <Page style={text}>
        {rows.map(([a, b], i) => (
          <div key={b} style={{ position: "absolute", left: 0, right: 0, top: 6 + i * 36, height: 30, display: "flex", alignItems: "center", gap: 12, fontSize: 14 }}>
            <i style={{ width: 8, height: 8, borderRadius: 4, background: [C.blue, C.orange, C.green][i] }} />
            <span style={{ width: 46, color: C.text2, fontVariantNumeric: "tabular-nums" }}>{a}</span>{b}
          </div>
        ))}
      </Page>
    );
  }
  return (
    <Page style={text}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {MORE.map(([icon, label]) => (
          <div key={label} style={{ height: 54, borderRadius: 8, background: C.fill(0.07), display: "grid", justifyItems: "center", alignContent: "center", gap: 4, fontSize: 11.5, color: C.text }}>
            <Icon name={icon} size={17} />{label}
          </div>
        ))}
      </div>
    </Page>
  );
};

const LIST: [IconName, string, string, string][] = [
  ["music", "Đêm thành phố", "Ban nhạc Mây", C.accent],
  ["timer", "Tập trung", "24:12", C.orange],
  ["terminal", "Claude Code", "Đang chạy", C.green],
  ["checklist", "Việc cần làm", "Còn 3 việc", C.cyan],
];

const glassTile = (clarity: number): React.CSSProperties => ({
  position: "absolute", background: `rgba(24,26,32,${0.32 - 0.2 * clarity})`, backdropFilter: "blur(18px) saturate(1.8)",
  boxShadow: "inset 0 0 0 1px rgba(255,255,255,.35)", overflow: "hidden", zIndex: 21,
});

const BasicsScene: React.FC<SceneProps> = ({ title = true }) => {
  const f = useCurrentFrame();
  const tiles = f >= T.tiles && f < T.solid;
  const open = tiles ? 0 : springSteps(f, [[0, 0], [T.hover, 1], [T.leave, 0], [T.click, 1], [T.close, 0], [T.glassOpen, 1]]);
  const tilesOpen = springSteps(f, [[0, 0], [T.tiles, 1], [T.solid, 0]]);
  const live = springSteps(f, [[0, 0], [T.live, 1]]);
  const listH = springSteps(f, [[0, 0], [T.list, 4 * 28 + 10], [T.listOff, 0]]);
  const lyricH = springSteps(f, [[0, 0], [T.strip, 36], [T.stripOff, 0]]);
  const glass = kf(f, [[T.glass, 0], [T.glass + 18, 1]]);
  const clarity = kf(f, [[T.clear, 0], [T.clear + 14, 1]]);
  const accent = step(f, [[0, C.accent], [T.accent[0], C.blue], [T.accent[1], C.pink], [T.accent[2], C.green]] as const);
  const tab = tabIndex(f);
  const notchW = NOTCH.w + 128 * live;
  const b1 = pop(f, T.bubble1), b2 = pop(f, T.bubble2);
  const plus = f >= T.plus;
  const pill = kf(f, [[T.pill, 0], [T.pill + 12, 1]]);

  const swipeDot = f >= T.swipe && f < T.close ? (
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, display: "flex", justifyContent: "center", gap: 10, opacity: 0.9 }}>
      {[0, 1].map((i) => {
        const x = f < T.swipeUp ? kf(f, [[T.swipe, 30], [T.swipe + 12, -30], [T.swipe + 14, 30], [T.swipe + 26, -30]]) : 0;
        const y = f >= T.swipeUp ? kf(f, [[T.swipeUp, 20], [T.close, -40]]) : 0;
        return <i key={i} style={{ width: 14, height: 14, borderRadius: 7, background: C.fill(0.85), transform: `translate(${x}px, ${y}px)` }} />;
      })}
    </div>
  ) : null;

  return (
    <>
      <Desktop camera={ON_NOTCH}>
        {f >= T.glassOpen - 20 && (
          <Window x={300} y={60} w={600} h={420} title="Ảnh" show={kf(f, [[T.glassOpen - 20, 0], [T.glassOpen - 6, 1]])}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(165deg, #3a5b70 0%, #6f6a72 45%, #8a5f45 70%, #2c2a33 100%)" }}>
              <div style={{ position: "absolute", left: 360, top: 70, width: 110, height: 110, borderRadius: 55, background: "#d6a26a" }} />
              <div style={{ position: "absolute", left: -40, right: -40, top: 230, height: 200, borderRadius: "50%", background: "#24303a" }} />
              <div style={{ position: "absolute", left: 120, right: -80, top: 270, height: 200, borderRadius: "50%", background: "#1b2229" }} />
            </div>
          </Window>
        )}
        <Notch
          open={open}
          live={live}
          strip={Math.max(listH, lyricH)}
          glass={glass}
          clarity={clarity}
          leading={<span style={{ width: 16, height: 16, borderRadius: 4, background: C.accent }} />}
          trailing={<Bars frame={f} />}
          stripContent={
            listH > lyricH ? (
              <div style={{ width: "100%", padding: "4px 14px", fontFamily: FONT.ui }}>
                {LIST.map(([icon, a, b, col]) => (
                  <div key={a} style={{ height: 28, display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: C.text }}>
                    <Icon name={icon} size={14} color={col} /><span style={{ flex: 1 }}>{a}</span><span style={{ color: C.text2 }}>{b}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", fontFamily: FONT.ui, lineHeight: 1.35 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>Thành phố lên đèn, mình anh lang thang</div>
                <div style={{ fontSize: 11, color: C.text2 }}>Gió đêm khẽ hát câu ca rất riêng</div>
              </div>
            )
          }
        >
          <TabBar active={tab} accent={accent} />
          <PageFor tab={tab} f={f} />
        </Notch>
        {f >= T.live && f < T.glassOpen && (
          <>
            <Bubble index={0} show={b1} notchW={notchW}><Icon name="timer" size={15} color={C.orange} /></Bubble>
            <Bubble index={1} show={b2} notchW={notchW}>
              {plus ? <span style={{ fontFamily: FONT.ui, fontSize: 12, fontWeight: 700, color: C.text }}>+2</span> : <Icon name="terminal" size={15} color={C.green} />}
            </Bubble>
          </>
        )}
        {tiles && (
          <>
            <div style={{ ...glassTile(1), left: 756 - 145, top: 34 + 8 * tilesOpen, width: 290, height: 36 * tilesOpen, borderRadius: 12, opacity: tilesOpen }}>
              <TabBar active={1} accent={accent} />
            </div>
            <div style={{ ...glassTile(1), left: 456, top: 34 + 52 * tilesOpen, width: 600, height: 150 * tilesOpen, borderRadius: 22, opacity: tilesOpen }}>
              <div style={{ position: "absolute", inset: 0, top: -26 }}><PageFor tab={1} f={f} /></div>
            </div>
          </>
        )}
        {swipeDot}
        <Cursor frame={f} moves={moves} clicks={clicks} />
      </Desktop>
      {f >= T.pill && (
        <AbsoluteFill style={{ opacity: pill }}>
          <Desktop camera={ON_NOTCH}>
            <div style={{ position: "absolute", top: 5, left: 756 - (185 + 128) / 2, width: 185 + 128, height: 32, borderRadius: 16, background: "#000", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", zIndex: 20 }}>
              <span style={{ width: 16, height: 16, borderRadius: 4, background: accent }} />
              <Bars frame={f} color={accent} />
            </div>
          </Desktop>
        </AbsoluteFill>
      )}
      <Captions
        frame={f}
        label="Notch"
        lines={[
          { f: 56, to: 124, text: "Rê chuột lên là mở, rê ra là gọn", keys: ["⌃⌥N"] },
          { f: 146, to: 238, text: "6 trang trên thanh, các trang khác trong Khác" },
          { f: 242, to: 306, text: "Vuốt hai ngón: ngang đổi trang, dọc mở và đóng" },
          { f: 312, to: 428, text: "Nhiều việc cùng lúc: phần còn lại thành bong bóng" },
          { f: 432, to: 506, text: "Rê vào bong bóng để xem cả danh sách" },
          { f: 512, to: 588, text: "Dải dưới notch: lời bài hát, hẹn giờ, duyệt quyền" },
          { f: 594, to: 664, text: "Cổ điển hoặc Liquid Glass, Cân bằng hoặc Trong vắt" },
          { f: 668, to: 726, text: "Khi mở: một khối hoặc ô rời" },
          { f: 730, to: 786, text: "Màu nhấn theo ý bạn" },
          { f: 792, to: 840, text: "Màn không có notch: viên thuốc nổi" },
        ]}
      />
      {title && <ChapterTitle frame={f} title="Notch" sub="Rê chuột lên là mở, rê ra là gọn" />}
    </>
  );
};

export const basics: SceneDef = { id: "basics", label: "Notch", dur: T.end, Comp: BasicsScene };
