import { loadFont as loadUI } from "@remotion/google-fonts/BeVietnamPro";
import { loadFont as loadDisplay } from "@remotion/google-fonts/BricolageGrotesque";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

export const FPS = 30;
export const VIDEO = { w: 1920, h: 1080 };

// The desktop is a 14-inch MacBook Pro screen measured in points (1512 wide).
// Everything inside <Desktop> is drawn in points; one point is PT video pixels.
export const PT = VIDEO.w / 1512;
export const SCREEN = { w: 1512, h: VIDEO.h / PT };
export const MENU_H = 37;
export const NOTCH = { w: 188, h: 34, ear: 6 };
export const OPEN_W = 600;

// Fonts are fetched from Google Fonts at render time, so a Linux CI machine draws the same letters (and Vietnamese marks) as a Mac.
const subsets: ("latin" | "latin-ext" | "vietnamese")[] = ["latin", "latin-ext", "vietnamese"];
export const FONT = {
  ui: loadUI("normal", { weights: ["400", "500", "600", "700"], subsets }).fontFamily,
  display: loadDisplay("normal", { weights: ["500", "800"], subsets }).fontFamily,
  mono: loadMono("normal", { weights: ["400", "500"], subsets }).fontFamily,
};

export const C = {
  ink: "#050507",
  panel: "#111113",
  line: "#27272a",
  text: "#ffffff",
  text2: "rgba(255,255,255,.62)",
  text3: "rgba(255,255,255,.38)",
  fill: (a: number) => `rgba(255,255,255,${a})`,
  accent: "#7d5cff",
  accentSoft: "rgba(125,92,255,.32)",
  green: "#30d158",
  mint: "#63e6be",
  cyan: "#64d2ff",
  blue: "#0a84ff",
  orange: "#ff9f0a",
  yellow: "#ffd60a",
  red: "#ff453a",
  pink: "#ff375f",
};
