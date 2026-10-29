import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT } from "../lib/theme";
import { kf, springSteps, step } from "../lib/time";
import { Desktop, CameraState } from "../ui/Desktop";
import { Icon } from "../ui/Icons";
import { Captions, ChapterTitle } from "../ui/Kit";
import { Notch } from "../ui/Notch";
import type { SceneDef, SceneProps } from "./types";

// Live activities on the collapsed notch, one after another: earphones, network (up, then lost), Caps Lock, a finished download, volume.
// There is no cursor and no replacement HUD: the notch only widens, says one short thing and settles back.

const T = { start: 34, net: 62, off: 80, caps: 98, dl: 122, vol: 146, end: 180, collapse: 170 } as const;
const CAMERA: CameraState = { zoom: 2.2, fx: 756, fy: 120 };

type Act = "none" | "hp" | "net" | "off" | "caps" | "dl" | "vol";

const label: React.CSSProperties = { fontFamily: FONT.ui, fontWeight: 700, fontSize: 13, lineHeight: 1, color: "#fff", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" };
const small: React.CSSProperties = { ...label, fontSize: 10.5 };

const CapsGlyph: React.FC = () => (
  <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round">
    <path d="M12 3L4 12h4.5v4.5h7V12H20z" />
    <path d="M8.5 20.5h7" />
  </svg>
);

const WifiOff: React.FC = () => (
  <span style={{ position: "relative", display: "block", width: 17, height: 17 }}>
    <Icon name="wifi" size={17} color={C.red} stroke={2} />
    <svg width={17} height={17} viewBox="0 0 24 24" style={{ position: "absolute", left: 0, top: 0 }}>
      <path d="M3 3l18 18" stroke="#000" strokeWidth={5} strokeLinecap="round" />
      <path d="M3 3l18 18" stroke={C.red} strokeWidth={2} strokeLinecap="round" />
    </svg>
  </span>
);

const SystemScene: React.FC<SceneProps> = ({ title = true }) => {
  const f = useCurrentFrame();
  const live = springSteps(f, [[0, 0], [T.start, 1], [T.collapse, 0]]);
  const act = step<Act>(f, [[0, "none"], [T.start, "hp"], [T.net, "net"], [T.off, "off"], [T.caps, "caps"], [T.dl, "dl"], [T.vol, "vol"]]);
  const start = step(f, [[0, 0], [T.start, T.start], [T.net, T.net], [T.off, T.off], [T.caps, T.caps], [T.dl, T.dl], [T.vol, T.vol]]);
  const appear = kf(f, [[start, 0], [start + 6, 1]]);
  const level = kf(f, [[T.vol, 0.25], [T.vol + 18, 0.62]]);

  let leading: React.ReactNode = null;
  let trailing: React.ReactNode = null;
  if (act === "hp") {
    leading = <Icon name="headphones" size={17} color="#fff" stroke={2} />;
    trailing = <span style={label}>80%</span>;
  } else if (act === "net") {
    leading = <Icon name="wifi" size={17} color={C.green} stroke={2} />;
    trailing = <span style={small}>Đã kết nối</span>;
  } else if (act === "off") {
    leading = <WifiOff />;
    trailing = <span style={{ ...small, color: C.red }}>Mất mạng</span>;
  } else if (act === "caps") {
    leading = <CapsGlyph />;
    trailing = <span style={label}>Bật</span>;
  } else if (act === "dl") {
    leading = <Icon name="download" size={17} color={C.cyan} stroke={2} />;
    trailing = <span style={small}>baocao.pdf</span>;
  } else if (act === "vol") {
    leading = <Icon name="speaker" size={17} color="#fff" stroke={2} />;
    trailing = (
      <span style={{ width: 40, height: 4, borderRadius: 2, background: C.fill(0.25), overflow: "hidden", display: "block" }}>
        <i style={{ display: "block", width: `${level * 100}%`, height: "100%", background: "#fff" }} />
      </span>
    );
  }

  return (
    <>
      <Desktop camera={CAMERA}>
        <Notch
          live={live}
          leading={<span style={{ display: "flex", opacity: appear, transform: `scale(${0.85 + 0.15 * appear})` }}>{leading}</span>}
          trailing={<span style={{ display: "flex", opacity: appear, transform: `translateX(${(1 - appear) * 6}px)` }}>{trailing}</span>}
        />
      </Desktop>
      <Captions
        frame={f}
        label="Hệ thống"
        lines={[
          { f: 46, to: 108, text: "Bluetooth, mạng, Caps Lock, tải xong, âm lượng" },
          { f: 114, to: 176, text: "Báo nhanh rồi gọn lại" },
        ]}
      />
      {title && <ChapterTitle frame={f} title="Hệ thống" sub="Sự kiện nhỏ, báo ngay trên notch" />}
    </>
  );
};

export const system: SceneDef = { id: "system", label: "Hệ thống", dur: T.end, Comp: SystemScene };
