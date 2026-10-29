import React from "react";
import { SCREEN } from "../lib/theme";
import { MenuBar, Wallpaper } from "../ui/Desktop";

/** A MacBook drawn in CSS, its screen showing the desktop in points; `width` is the lid's width in video pixels. */
export const Laptop: React.FC<{ width: number; x: number; y: number; children?: React.ReactNode; opacity?: number }> = ({ width, x, y, children, opacity = 1 }) => {
  const pad = width * 0.012;
  const screenW = width - 2 * pad;
  const s = screenW / SCREEN.w;
  const screenH = SCREEN.h * s;
  return (
    <div style={{ position: "absolute", left: x - width / 2, top: y, width, opacity }}>
      <div style={{ background: "#141317", borderRadius: width * 0.022, padding: pad, boxShadow: "inset 0 0 0 2px #2c2a33, 0 40px 120px rgba(0,0,0,.6)" }}>
        <div style={{ position: "relative", width: screenW, height: screenH, borderRadius: width * 0.01, overflow: "hidden", background: "#000" }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: SCREEN.w, height: SCREEN.h, transformOrigin: "0 0", transform: `scale(${s})` }}>
            <Wallpaper />
            <MenuBar />
            {children}
          </div>
        </div>
      </div>
      <div style={{ height: width * 0.016, margin: `0 -${width * 0.05}px`, borderRadius: `2px 2px ${width * 0.02}px ${width * 0.02}px`, background: "linear-gradient(#c9c7d0, #96949f)", position: "relative" }}>
        <div style={{ position: "absolute", left: "50%", top: 0, width: "13%", height: "40%", transform: "translateX(-50%)", borderRadius: `0 0 ${width * 0.006}px ${width * 0.006}px`, background: "#86848f" }} />
      </div>
    </div>
  );
};
