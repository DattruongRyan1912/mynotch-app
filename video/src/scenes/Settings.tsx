import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT, MENU_H } from "../lib/theme";
import { kf, pop, springSteps, step } from "../lib/time";
import { cameraAt, Desktop, MenuBar } from "../ui/Desktop";
import { Cursor, Move } from "../ui/Cursor";
import { Icon, IconName } from "../ui/Icons";
import { Btn, Captions, ChapterTitle, Window } from "../ui/Kit";
import { Notch } from "../ui/Notch";
import type { SceneDef, SceneProps } from "./types";

// Menu bar (hide icons, the hidden-icons bar, black menu bar, the app's menu) and the Settings window
// (Quyền with "Cấp lần lượt", "Trang trên notch", "Dung lượng" with "Dọn").

const T = {
  hide: 50, bar: 116, barOff: 158, black: 170, menu: 206, openSettings: 232,
  grant: 270, pageTabs: 296, pageStorage: 326, clean: 342, end: 360,
} as const;

// Menu bar extras, right to left from the MyNotch icon (x is the icon's left edge, points).
const ICON_X = 1196;
const EXTRAS: [string, number][] = [["#5e5ce6", 0], ["#30d158", 1], ["#ff9f0a", 2], ["#64d2ff", 3], ["#bf5af2", 4], ["#ff375f", 5], ["#ffd60a", 6]];
const extraX = (i: number) => ICON_X - 28 * (i + 1);

// Settings window.
const WX = 376, WY = 150, WW = 760, WH = 520;
const SIDE = ["Quyền", "Chung", "Giao diện", "Dung lượng", "Trang trên notch"];
const MODULES = ["Clipboard", "Media", "Âm thanh", "Ảnh chụp", "Dịch", "AI agents", "Lịch", "Việc cần làm"];
const sideY = (i: number) => WY + 30 + 14 + 26 * i + 13; // centre of sidebar row i
const CX = WX + 200 + 24; // page content left
const CY = WY + 30 + 22; // page content top

const moves: Move[] = [
  { f: 0, x: 1000, y: 400 },
  { f: T.bar - 4, x: ICON_X + 8, y: 18, d: 24 },
  { f: T.black, x: 1060, y: 260 },
  { f: T.menu - 4, x: ICON_X + 8, y: 18 },
  { f: T.openSettings - 4, x: ICON_X + 30, y: 58 },
  { f: T.grant - 4, x: CX + 465, y: CY + 12, d: 20 },
  { f: T.pageTabs - 4, x: WX + 60, y: sideY(4) },
  { f: T.pageStorage - 4, x: WX + 60, y: sideY(3) },
  { f: T.clean - 4, x: CX + 485, y: CY + 68 },
];
const clicks = [T.bar, T.menu, T.openSettings, T.grant, T.pageTabs, T.pageStorage, T.clean];

const Row: React.FC<{ y: number; icon: IconName; name: string; why: string; state: string; ok: boolean }> = ({ y, icon, name, why, state, ok }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y, height: 40, display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, borderTop: "1px solid rgba(255,255,255,.06)" }}>
    <Icon name={icon} size={16} color={C.text2} />
    <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>{name}</div><div style={{ fontSize: 11, color: C.text3 }}>{why}</div></div>
    <span style={{ fontSize: 11, fontWeight: 600, color: ok ? C.green : C.orange }}>{state}</span>
    {!ok && <Btn>Cấp quyền</Btn>}
  </div>
);

const SettingsScene: React.FC<SceneProps> = ({ title = true }) => {
  const f = useCurrentFrame();
  const hidden = springSteps(f, [[0, 0], [T.hide, 1]]);
  const bar = springSteps(f, [[0, 0], [T.bar, 1], [T.barOff, 0]]);
  const black = kf(f, [[T.black, 0], [T.black + 14, 1]]);
  const menu = f >= T.menu && f < T.openSettings + 4 ? pop(f, T.menu) : 0;
  const win = pop(f, T.openSettings);
  const page = step(f, [[0, 0], [T.pageTabs, 4], [T.pageStorage, 3]] as const);
  const granting = f >= T.grant && page === 0;
  const cleaned = f >= T.clean;
  const camera = cameraAt(f, [
    [0, { zoom: 1.9, fx: 1080, fy: 60 }],
    [T.black - 4, { zoom: 1.9, fx: 1080, fy: 60 }],
    [T.black + 12, { zoom: 1.6, fx: 860, fy: 60 }],
    [T.menu - 14, { zoom: 1.6, fx: 860, fy: 60 }],
    [T.menu - 2, { zoom: 1.9, fx: 1080, fy: 60 }],
    [T.openSettings - 10, { zoom: 1.9, fx: 1080, fy: 60 }],
    [T.openSettings + 14, { zoom: 1.25, fx: 756, fy: 400 }],
  ], kf);

  return (
    <>
      <Desktop camera={camera} menu={<MenuBar black={black} />}>
        <Notch />
        {EXTRAS.map(([col, i]) => (
          <span key={col} style={{ position: "absolute", top: 11, left: extraX(i) + 14 * hidden * (i + 1) * 0.2, width: 15, height: 15, borderRadius: 4, background: col, opacity: 1 - hidden, zIndex: 30 }} />
        ))}
        <div style={{ position: "absolute", top: 9, left: ICON_X, width: 19, height: 19, color: C.text, zIndex: 31 }}><Icon name="pip" size={19} /></div>
        {bar > 0.01 && (
          <div style={{ position: "absolute", top: 4, left: ICON_X - 8 - 7 * 28 * bar, width: 7 * 28 * bar, height: 28, borderRadius: 7, background: "#1c1c1f", boxShadow: "0 0 0 1px rgba(255,255,255,.12)", overflow: "hidden", zIndex: 32, display: "flex", alignItems: "center", gap: 10, padding: "0 8px" }}>
            {EXTRAS.map(([col]) => <span key={col} style={{ flex: "none", width: 18, height: 18, borderRadius: 5, background: col }} />)}
          </div>
        )}
        {menu > 0 && (
          <div style={{ position: "absolute", top: MENU_H + 2, left: ICON_X - 6, width: 230, padding: 5, borderRadius: 8, background: "rgba(40,40,44,.96)", boxShadow: "0 0 0 1px rgba(255,255,255,.12), 0 12px 30px rgba(0,0,0,.5)", fontFamily: FONT.ui, fontSize: 13, color: C.text, opacity: menu, zIndex: 40 }}>
            {[["Open Settings…", "⌘,"], ["Hide Notch", ""], ["Hiện icon đã ẩn", ""], ["Pause All Modules", ""], ["Quit MyNotch", "⌘Q"]].map(([a, k], i) => (
              <div key={a} style={{ display: "flex", justifyContent: "space-between", padding: "4px 10px", borderRadius: 5, background: i === 0 && f >= T.openSettings - 8 ? C.blue : "transparent" }}>
                <span>{a}</span><span style={{ color: C.text2 }}>{k}</span>
              </div>
            ))}
          </div>
        )}
        {win > 0.01 && (
          <Window x={WX} y={WY} w={WW} h={WH} title="MyNotch Settings" show={win}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 200, background: "rgba(255,255,255,.03)", borderRight: "1px solid rgba(255,255,255,.07)", padding: "14px 10px", fontSize: 13 }}>
              {SIDE.map((s, i) => (
                <div key={s} style={{ height: 26, display: "flex", alignItems: "center", gap: 8, padding: "0 10px", borderRadius: 6, background: i === page ? C.accentSoft : "transparent" }}>
                  <span style={{ flex: 1 }}>{s}</span>
                  {i === 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: "0 6px", borderRadius: 4, background: C.red }}>2</span>}
                </div>
              ))}
              <div style={{ fontSize: 11, fontWeight: 600, color: C.text3, margin: "12px 10px 4px" }}>Mô-đun</div>
              {MODULES.map((m) => <div key={m} style={{ height: 24, display: "flex", alignItems: "center", padding: "0 10px", color: C.text2 }}>{m}</div>)}
            </div>
            <div style={{ position: "absolute", left: 224, right: 24, top: 22, bottom: 0, fontSize: 13 }}>
              {page === 0 && (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <b style={{ fontSize: 18 }}>Còn 2 quyền chưa cấp.</b><Btn tone={C.accent} pressed={f >= T.grant - 2 && f < T.grant + 4}>Cấp lần lượt</Btn>
                  </div>
                  {granting && (
                    <div style={{ marginTop: 12, padding: "8px 12px", borderRadius: 6, background: "rgba(125,92,255,.16)", display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, opacity: pop(f, T.grant) }}>
                      <span style={{ flex: 1 }}>Bước 1/2: Ghi màn hình</span><Btn>Mở Cài đặt</Btn><Btn>Bỏ qua</Btn><Btn>Dừng</Btn>
                    </div>
                  )}
                  <div style={{ position: "absolute", left: 0, right: 0, top: granting ? 92 : 50 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.text3, marginBottom: 6 }}>Cần thiết</div>
                    <div style={{ position: "relative", height: 80 }}>
                      <Row y={0} icon="camera" name="Ghi màn hình" why="Ảnh chụp: chụp và quay màn hình" state="Chưa cấp" ok={false} />
                      <Row y={40} icon="calendar" name="Lịch" why="Lịch: đọc sự kiện hôm nay" state="Đã cấp" ok />
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.text3, margin: "14px 0 6px" }}>Tuỳ chọn</div>
                    <div style={{ position: "relative", height: 80 }}>
                      <Row y={0} icon="hand" name="Trợ năng" why="Clipboard: dán thẳng vào app đang dùng" state="Đã cấp" ok />
                      <Row y={40} icon="speaker" name="Ghi âm thanh hệ thống" why="Media: phổ nhạc thật và căn phụ đề" state="Chưa cấp" ok={false} />
                    </div>
                  </div>
                </>
              )}
              {page === 4 && (
                <>
                  <b style={{ fontSize: 18 }}>Trang trên notch</b>
                  {[["Trên thanh", ["Clipboard", "Media", "Dịch", "AI agents", "Lịch", "Việc cần làm"]], ["Trong mục Khác", ["Âm thanh", "Ảnh chụp", "Hẹn giờ", "Battery", "Khay", "Shortcuts", "Hiệu năng", "Cổng"]]].map(([h, items], c) => (
                    <div key={h as string} style={{ position: "absolute", top: 40, left: c * 250, width: 236 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.text3, marginBottom: 6 }}>{h as string}</div>
                      {(items as string[]).map((it) => (
                        <div key={it} style={{ height: 30, display: "flex", alignItems: "center", gap: 8, padding: "0 10px", marginBottom: 4, borderRadius: 6, background: C.fill(0.06) }}>
                          <span style={{ color: C.text3 }}>⋮⋮</span>{it}
                        </div>
                      ))}
                    </div>
                  ))}
                  <div style={{ position: "absolute", right: 0, top: 0 }}><Btn>Thứ tự mặc định</Btn></div>
                </>
              )}
              {page === 3 && (
                <>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                    <b style={{ fontSize: 18 }}>MyNotch đang dùng</b>
                    <span style={{ fontSize: 18, fontWeight: 700, color: C.text2, fontVariantNumeric: "tabular-nums" }}>{cleaned ? "226 MB" : "412 MB"}</span>
                    {cleaned && <span style={{ fontSize: 12.5, color: C.green, opacity: pop(f, T.clean) }}>Vừa giải phóng 186 MB</span>}
                  </div>
                  {[["Clipboard · Ảnh và file", "186 MB"], ["Ảnh chụp · Bộ nhớ tạm", "154 MB"], ["Clipboard · Xem trước link", "12 MB"], ["Media · Phụ đề", "3 MB"]].map(([a, b], i) => (
                    <div key={a} style={{ position: "absolute", left: 0, right: 0, top: 50 + 40 * i, height: 36, display: "flex", alignItems: "center", gap: 10, borderTop: "1px solid rgba(255,255,255,.06)" }}>
                      <span style={{ flex: 1 }}>{a}</span>
                      <span style={{ color: C.text2, fontVariantNumeric: "tabular-nums" }}>{i === 0 && cleaned ? "0 KB" : b}</span>
                      <Btn pressed={i === 0 && f >= T.clean - 2 && f < T.clean + 4}>Dọn</Btn>
                    </div>
                  ))}
                  <div style={{ position: "absolute", left: 0, top: 220, fontSize: 12, color: C.text3 }}>Tự dọn: xoá bộ nhớ tạm cũ hơn 30 ngày</div>
                </>
              )}
            </div>
          </Window>
        )}
        <Cursor frame={f} moves={moves} clicks={clicks} />
      </Desktop>
      <Captions
        frame={f}
        label="Menu bar và Settings"
        lines={[
          { f: 46, to: 110, text: "Ẩn bớt icon trên menu bar" },
          { f: 114, to: 164, text: "Bấm icon MyNotch để mở thanh icon ẩn" },
          { f: 168, to: 230, text: "Tô đen thanh menu cho liền với notch" },
          { f: 236, to: 292, text: "Trang Quyền: cấp lần lượt quyền còn thiếu" },
          { f: 296, to: 324, text: "Tự sắp xếp trang trên notch" },
          { f: 328, to: 360, text: "Dọn bộ nhớ tạm; dữ liệu ở trên máy bạn" },
        ]}
      />
      {title && <ChapterTitle frame={f} title="Menu bar và Settings" sub="Gọn gàng, chỉ xin quyền cần" />}
    </>
  );
};

export const settings: SceneDef = { id: "settings", label: "Menu bar và Settings", dur: T.end, Comp: SettingsScene };
