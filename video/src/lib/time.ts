import { Easing, interpolate, spring } from "remotion";
import { FPS } from "./theme";

// Every moving thing in the video is a pure function of the frame number: no timers, no CSS transitions,
// so any frame renders the same on any machine and a scene plays the same as a clip or as part of the tour.

export type Key = readonly [frame: number, value: number];

export const ease = Easing.bezier(0.4, 0, 0.2, 1);

/** Value between keyframes, eased, held before the first and after the last. */
export function kf(frame: number, keys: readonly Key[], easing: (t: number) => number = ease): number {
  if (keys.length === 1) return keys[0][1];
  return interpolate(
    frame,
    keys.map((k) => k[0]),
    keys.map((k) => k[1]),
    { easing, extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
}

/** The notch's spring (SwiftUI response .38, damping fraction .8 in the app). */
export const NOTCH_SPRING = { mass: 1, stiffness: 273, damping: 26.5 } as const;

/** A value that springs to each new target at its frame; a later target takes over from wherever the last one got to. */
export function springSteps(frame: number, steps: readonly Key[], config = NOTCH_SPRING): number {
  let v = steps[0][1];
  for (let i = 1; i < steps.length; i++) {
    const [f, to] = steps[i];
    if (frame < f) break;
    v += (to - steps[i - 1][1]) * spring({ frame: frame - f, fps: FPS, config });
  }
  return v;
}

/** 0 → 1 spring that starts at `start`. */
export function pop(frame: number, start: number, config = NOTCH_SPRING): number {
  return frame < start ? 0 : spring({ frame: frame - start, fps: FPS, config });
}

/** The last value whose frame has been reached: for text and other discrete states. */
export function step<T>(frame: number, steps: readonly (readonly [number, T])[]): T {
  let v = steps[0][1];
  for (const [f, s] of steps) if (frame >= f) v = s;
  return v;
}

/** Linear 0 → 1 over [start, start + dur]. */
export function prog(frame: number, start: number, dur: number): number {
  return Math.min(1, Math.max(0, (frame - start) / dur));
}

/** Fade in over `inDur` at `start`, out over `outDur` ending at `end`. */
export function fade(frame: number, start: number, end: number, inDur = 8, outDur = 8): number {
  return Math.min(prog(frame, start, inDur), 1 - prog(frame, end - outDur, outDur));
}

/** Text typed from `start`, `cps` characters a second. */
export function typed(frame: number, start: number, text: string, cps = 16): string {
  const n = Math.floor(Math.max(0, frame - start) * (cps / FPS));
  return Array.from(text).slice(0, n).join("");
}

export const sec = (s: number) => Math.round(s * FPS);

/** m:ss for a countdown or a song position. */
export function mmss(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
