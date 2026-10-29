import { intro } from "./Intro";
import { basics } from "./Basics";
import { media } from "./Media";
import { equalizer } from "./Equalizer";
import { clipboard } from "./Clipboard";
import { translation } from "./Translation";
import { screenshot } from "./Screenshot";
import { aiagents } from "./AIAgents";
import { calendar } from "./Calendar";
import { todo } from "./Todo";
import { battery } from "./Battery";
import { shelf } from "./Shelf";
import { performance } from "./Performance";
import { ports } from "./Ports";
import { shortcuts } from "./Shortcuts";
import { system } from "./System";
import { pet } from "./Pet";
import { settings } from "./Settings";
import { outro } from "./Outro";
import { timer } from "./Timer";
import type { SceneDef } from "./types";

/** The tour, in order. Each scene file exports its SceneDef (id, label, length in frames at 30 fps). */
export const SCENES: SceneDef[] = [
  intro, basics, media, equalizer, clipboard, translation, screenshot, aiagents, calendar, todo, timer, battery, shelf, performance, ports, shortcuts, system, pet, settings, outro,
];

/** Modules that also get a short clip of their own (the tour's intro, basics, settings and outro do not). */
export const CLIP_IDS = [
  "media", "equalizer", "clipboard", "translation", "screenshot", "aiagents", "calendar", "todo",
  "timer", "battery", "shelf", "performance", "ports", "shortcuts", "system", "pet",
];
