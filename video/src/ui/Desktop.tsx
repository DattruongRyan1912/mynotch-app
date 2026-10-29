import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT, MENU_H, PT, SCREEN, VIDEO } from "../lib/theme";
import { Icon } from "./Icons";

/** Where the camera looks: zoom 1 shows the whole screen; the focus point (in points) is kept near the top middle. */
export type CameraState = { zoom: number; fx: number; fy: number };
export const WIDE: CameraState = { zoom: 1, fx: SCREEN.w / 2, fy: SCREEN.h / 2 };
export const ON_NOTCH: CameraState = { zoom: 1.75, fx: SCREEN.w / 2, fy: 120 };

function cameraTransform({ zoom, fx, fy }: CameraState): string {
  const s = zoom * PT;
  let tx = VIDEO.w / 2 - fx * s;
  let ty = VIDEO.h * 0.4 - fy * s;
  // Never show past the screen's edges.
  tx = Math.min(0, Math.max(VIDEO.w - SCREEN.w * s, tx));
  ty = Math.min(0, Math.max(VIDEO.h - SCREEN.h * s, ty));
  return `translate(${tx}px, ${ty}px) scale(${s})`;
}

/** An original abstract wallpaper: dark slate with two soft light folds. */
export const Wallpaper: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      // Folds are pairs of circles: a dark one and, just larger, a light rim, so each fold has one crisp lit edge.
      background: [
        "radial-gradient(58% 72% at 104% -6%, #262b34 0 60%, transparent 60.3%)",
        "radial-gradient(59% 73% at 104% -6%, rgba(206,214,224,.5) 0 60%, transparent 60.6%)",
        "radial-gradient(80% 90% at 104% -6%, rgba(120,132,150,.22), transparent 70%)",
        "radial-gradient(70% 80% at -8% 112%, #1d2129 0 58%, transparent 58.3%)",
        "radial-gradient(71% 81% at -8% 112%, rgba(170,180,198,.32) 0 58%, transparent 58.6%)",
        "radial-gradient(60% 50% at 30% 30%, #20232c, transparent 70%)",
        "linear-gradient(160deg, #191c23, #0f1115)",
      ].join(","),
    }}
  />
);

export const MenuBar: React.FC<{ app?: string; black?: number; extra?: React.ReactNode }> = ({ app = "Ghi chú", black = 0, extra }) => {
  const items = ["Tệp", "Sửa", "Định dạng", "Xem", "Cửa sổ", "Trợ giúp"];
  return (
    <div
      style={{
        position: "absolute", left: 0, right: 0, top: 0, height: MENU_H, display: "flex", alignItems: "center",
        padding: "0 14px", gap: 20, fontFamily: FONT.ui, fontSize: 13.5, color: C.text,
        background: `rgba(0,0,0,${0.22 + 0.78 * black})`,
      }}
    >
      <span style={{ width: 14, height: 14, borderRadius: 4, background: C.fill(0.85) }} />
      <b style={{ fontWeight: 700 }}>{app}</b>
      {items.map((i) => <span key={i} style={{ opacity: 0.92 }}>{i}</span>)}
      <span style={{ flex: 1 }} />
      {extra}
      <Icon name="wifi" size={16} />
      <Icon name="battery" size={20} />
      <Icon name="search" size={15} />
      <span style={{ fontVariantNumeric: "tabular-nums" }}>T4 29 thg 10  09:41</span>
    </div>
  );
};

/** The screen: wallpaper, menu bar and whatever the scene draws, in points, seen through the camera. */
export const Desktop: React.FC<{ camera?: CameraState; menu?: React.ReactNode; children?: React.ReactNode }> = ({
  camera = WIDE, menu, children,
}) => (
  <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: SCREEN.w, height: SCREEN.h, transformOrigin: "0 0", transform: cameraTransform(camera) }}>
      <Wallpaper />
      {menu ?? <MenuBar />}
      {children}
    </div>
  </AbsoluteFill>
);

/** Camera that moves between states at given frames. */
export function cameraAt(frame: number, keys: readonly (readonly [number, CameraState])[], mix: (f: number, k: readonly (readonly [number, number])[]) => number): CameraState {
  return {
    zoom: mix(frame, keys.map(([f, c]) => [f, c.zoom] as const)),
    fx: mix(frame, keys.map(([f, c]) => [f, c.fx] as const)),
    fy: mix(frame, keys.map(([f, c]) => [f, c.fy] as const)),
  };
}
