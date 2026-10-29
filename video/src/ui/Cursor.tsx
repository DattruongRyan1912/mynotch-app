import React from "react";
import { kf } from "../lib/time";

/** One move: arrive at (x, y) in points at frame `f`, travelling for `d` frames (default 16). */
export type Move = { f: number; x: number; y: number; d?: number };

export function cursorAt(frame: number, moves: readonly Move[]): { x: number; y: number } {
  const xs: [number, number][] = [[0, moves[0].x]];
  const ys: [number, number][] = [[0, moves[0].y]];
  let last = 0;
  for (let i = 1; i < moves.length; i++) {
    const m = moves[i];
    const startF = Math.max(last + 1, m.f - (m.d ?? 16));
    const endF = Math.max(startF + 1, m.f);
    xs.push([startF, moves[i - 1].x], [endF, m.x]);
    ys.push([startF, moves[i - 1].y], [endF, m.y]);
    last = endF;
  }
  return { x: kf(frame, xs), y: kf(frame, ys) };
}

/** The pointer, drawn in points, with a small press on each click frame. */
export const Cursor: React.FC<{ frame: number; moves: readonly Move[]; clicks?: readonly number[]; hidden?: boolean }> = ({
  frame, moves, clicks = [], hidden,
}) => {
  if (hidden) return null;
  const { x, y } = cursorAt(frame, moves);
  const pressed = clicks.some((c) => frame >= c && frame < c + 5);
  return (
    <svg
      width={17}
      height={25}
      viewBox="0 0 16 24"
      style={{ position: "absolute", left: x, top: y, zIndex: 100, transformOrigin: "0 0", transform: `scale(${pressed ? 0.85 : 1})`, filter: "drop-shadow(0 1px 2px rgba(0,0,0,.5))" }}
    >
      <path d="M1.5 1.5v18.5l4.6-4.6 3.4 7.1 3-1.4-3.3-6.9h6.4z" fill="#fff" stroke="#000" strokeWidth={1.3} strokeLinejoin="round" />
    </svg>
  );
};
