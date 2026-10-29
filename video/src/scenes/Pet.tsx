import React from "react";
import { useCurrentFrame } from "remotion";
import { C, NOTCH } from "../lib/theme";
import { kf, prog, springSteps } from "../lib/time";
import { Desktop, CameraState } from "../ui/Desktop";
import { Cursor, Move } from "../ui/Cursor";
import { Captions, ChapterTitle } from "../ui/Kit";
import { Notch } from "../ui/Notch";
import type { SceneDef, SceneProps } from "./types";

// A screen holds at most three pets at once, so the notch (widened ~100 pt each side of the camera) shows two sets in turn.
// Set 1, Mèo + Capybara + Hamster: the cat walks into the purple portal left of the camera, comes out on the right and climbs on the
// capybara's back while the hamster runs faster as the machine gets busy. Set 2, Chim cánh cụt + Corgi + Ếch: the penguin belly-slides,
// the frog catches a butterfly, the corgi chases a ball until it gets a pat (hearts).

const T = {
  live: 30, walk: 44, enter: 70, gone: 78, emerge: 84, out: 90, crouch: 96, jump: 100, land: 112, busy: 62, busyFull: 96,
  swap: 122, settle: 184, pet: 204, end: 240,
} as const;
const CAMERA: CameraState = { zoom: 2.4, fx: 756, fy: 120 };

// Stage: the collapsed notch widened to 388 points (x 562 … 950); the 188-wide camera housing sits in the middle (x 662 … 850).
const STAGE = { x: 562, w: 388, h: NOTCH.h };
const LIVE = (STAGE.w - NOTCH.w) / 128;
const FLOOR = 33;
const X = { wheel: 582, catStart: 612, portalIn: 652, portalOut: 858, capy: 910, frog: 578, slide: 632, corgi: 900 };
const BACK_Y = 23.6; // where the cat stands on the capybara
const WAIT_X = 872; // where the cat waits before the jump
const S = { cat: 1.2, penguin: 1.2, frog: 1.3, corgi: 1.25, wheel: 1.1 };
const BUTTERFLY = { x: X.frog + 24, y: 14 }; // where the frog's tongue meets it

const INK = "#17171b";
const GINGER = "#f0a04b", GINGER_D = "#cf7f2c";
const PURPLE = "#7d5cff";

const moves: Move[] = [
  { f: 0, x: 1000, y: 200 },
  { f: T.pet - 3, x: X.corgi + 11, y: 24, d: 30 },
  { f: T.end - 2, x: X.corgi + 60, y: 80, d: 24 },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const bump = (f: number, at: number, w = 6) => Math.exp(-(((f - at) / w) ** 2));
const mix = (a: number[], b: number[], t: number) => `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], t))).join(",")})`;

/** Wheel angle: slow, speeding up while the machine gets busy (integral of an angular speed that ramps up). */
function wheelAngle(f: number): number {
  const slow = 0.09, fast = 0.5, a0 = T.busy, a1 = T.busyFull;
  if (f <= a0) return slow * f;
  const t = Math.min(f, a1) - a0;
  let a = slow * a0 + slow * t + ((fast - slow) * t * t) / (2 * (a1 - a0));
  if (f > a1) a += fast * (f - a1);
  return a;
}

type CatState = { x: number; y: number; sx: number; sy: number; moving: boolean; perched: boolean };
function catAt(f: number): CatState {
  const base = { y: FLOOR, sx: 1, sy: 1, moving: false, perched: false };
  if (f < T.walk) return { ...base, x: X.catStart };
  if (f < T.enter) return { ...base, x: lerp(X.catStart, X.portalIn - 6, (f - T.walk) / (T.enter - T.walk)), moving: true };
  if (f < T.gone) {
    const t = (f - T.enter) / (T.gone - T.enter);
    return { ...base, x: X.portalIn - 6 + 8 * t, sx: 1 - t, moving: true };
  }
  if (f < T.emerge) return { ...base, x: X.portalOut, sx: 0 };
  if (f < T.out) {
    const t = (f - T.emerge) / (T.out - T.emerge);
    return { ...base, x: X.portalOut + 7 * t, sx: t, moving: true };
  }
  if (f < T.crouch) return { ...base, x: lerp(X.portalOut + 7, WAIT_X, (f - T.out) / (T.crouch - T.out)), moving: true };
  if (f < T.jump) return { ...base, x: WAIT_X, sy: 1 - 0.14 * Math.sin((Math.PI * (f - T.crouch)) / (T.jump - T.crouch)) };
  if (f < T.land) {
    const t = (f - T.jump) / (T.land - T.jump);
    const e = 1 - (1 - t) * (1 - t);
    return { ...base, x: lerp(WAIT_X, X.capy - 3, e), y: lerp(FLOOR, BACK_Y, e) - 3.5 * Math.sin(Math.PI * t) };
  }
  return { ...base, x: X.capy - 3, y: BACK_Y, perched: true };
}

const Cat: React.FC<{ s: CatState; f: number; dy?: number }> = ({ s, f, dy = 0 }) => {
  if (s.sx < 0.03) return null;
  const lift = (k: number) => (s.moving ? Math.max(0, Math.sin(s.x * 1.1 + (k === 0 ? 0 : Math.PI))) * 1.8 : 0);
  const tail = Math.sin(f * 0.12) * 1.6;
  return (
    <g transform={`translate(${s.x} ${s.y + dy}) scale(${s.sx * S.cat} ${s.sy * S.cat})`}>
      <path d={`M-6.8,-6.2 C-11.5,-6.4 -11.4,${-12.4 + tail} -8.2,${-13.2 + tail}`} fill="none" stroke={GINGER} strokeWidth={2.1} strokeLinecap="round" />
      <rect x={-6.4} y={-3.7 - lift(0)} width={2.3} height={3.7} rx={1.1} fill={GINGER_D} />
      <rect x={3.6} y={-3.7 - lift(1)} width={2.3} height={3.7} rx={1.1} fill={GINGER_D} />
      <ellipse cx={-0.8} cy={-6.4} rx={7.4} ry={4.6} fill={GINGER} />
      <path d="M-3.6,-10.2 v2.2 M-0.8,-10.6 v2.6 M2,-10.2 v2.2" stroke={GINGER_D} strokeWidth={0.9} strokeLinecap="round" />
      <rect x={-4} y={-3.7 - lift(1)} width={2.5} height={3.7} rx={1.2} fill={GINGER} />
      <rect x={2.1} y={-3.7 - lift(0)} width={2.5} height={3.7} rx={1.2} fill={GINGER} />
      <polygon points="2.4,-13.2 3.2,-18 6.2,-14.4" fill={GINGER} />
      <polygon points="6.8,-14.4 9.2,-18 9.8,-12.8" fill={GINGER} />
      <circle cx={6} cy={-10.4} r={4.6} fill={GINGER} />
      <polygon points="3.5,-14.3 3.7,-16.6 5.2,-14.7" fill="#f2a7a0" />
      <circle cx={8} cy={-10.8} r={0.8} fill={INK} />
      <circle cx={10.4} cy={-9.4} r={0.6} fill="#f08a8a" />
    </g>
  );
};

const Capybara: React.FC<{ f: number; dy: number }> = ({ f, dy }) => {
  const bob = 0.3 * Math.sin(f * 0.09) + dy;
  return (
    <g transform={`translate(${X.capy} ${bob})`}>
      <ellipse cx={0} cy={29.8} rx={16.5} ry={6.6} fill="#b58a5e" />
      <rect x={10} y={23.6} width={15} height={9} rx={4.5} fill="#b58a5e" />
      <rect x={18.5} y={25.2} width={7.5} height={6.6} rx={3} fill="#9a7048" />
      <circle cx={23.8} cy={26.8} r={0.9} fill={INK} />
      <circle cx={15.8} cy={27} r={1.05} fill={INK} />
      <circle cx={11.5} cy={23.8} r={2.1} fill="#9a7048" />
      <circle cx={14.8} cy={22.4} r={3} fill="#ffb02e" />
      <path d="M14.8,19.8 q1.8,-1.1 2.9,0 q-1.3,1.3 -2.9,0z" fill="#58a85a" />
    </g>
  );
};

const Pool: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={X.capy - 31} y={28.6} width={62} height={5.4} rx={2.7} fill="#3b8ed0" opacity={0.94} />
    <rect x={X.capy - 31} y={28.6} width={62} height={1.2} rx={0.6} fill="#8ccbf5" opacity={0.9} />
    {[0, 1].map((k) => (
      <path key={k} d={`M${X.capy - 16 + k * 28 + 2 * Math.sin(f * 0.1 + k)},31.6 h6`} stroke="#8ccbf5" strokeWidth={0.8} strokeLinecap="round" opacity={0.8} />
    ))}
  </g>
);

const Hamster: React.FC<{ f: number }> = ({ f }) => {
  const a = wheelAngle(f);
  const swing = 2.1 * Math.sin(a * 2.2);
  const load = f < T.busy - 6 ? 0.22 : kf(f, [[T.busy - 6, 0.22], [T.busyFull - 4, 0.95]]);
  const sweat = clamp01((f - 88) / 8);
  const cy = FLOOR - 12.5 * S.wheel;
  return (
    <g>
      <g transform={`translate(${X.wheel} ${cy}) scale(${S.wheel})`}>
        <circle r={12.5} fill="rgba(255,255,255,.05)" stroke="#9aa3b2" strokeWidth={1.3} />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const t = a + (i * Math.PI) / 3;
          return <line key={i} x1={0} y1={0} x2={11.8 * Math.cos(t)} y2={11.8 * Math.sin(t)} stroke="rgba(255,255,255,.28)" strokeWidth={0.8} />;
        })}
        <circle r={1.4} fill="#9aa3b2" />
        <g transform={`translate(0 ${0.5 * Math.sin(a * 4.4)})`}>
          <ellipse cx={-1.5 + swing} cy={11.4} rx={1.7} ry={1} fill="#dfae76" />
          <ellipse cx={3 - swing} cy={11.4} rx={1.7} ry={1} fill="#dfae76" />
          <ellipse cx={0} cy={7.4} rx={5.8} ry={4.6} fill="#eec58f" />
          <ellipse cx={1.2} cy={8.6} rx={3.6} ry={2.6} fill="#fff1dc" />
          <circle cx={4.8} cy={5.6} r={3.7} fill="#eec58f" />
          <circle cx={3} cy={2.7} r={1.5} fill="#f1a9a0" />
          <circle cx={6} cy={2.5} r={1.5} fill="#f1a9a0" />
          <circle cx={5.9} cy={5.2} r={0.75} fill={INK} />
          <circle cx={8.3} cy={6.3} r={0.6} fill="#e98b8b" />
          <circle cx={6.2} cy={7.2} r={1.3} fill="#f5b3a6" opacity={0.75} />
          <path d="M8.6,0.2 q1.4,2 0,3 q-1.4,-1 0,-3z" fill="#a9dcff" opacity={sweat} />
        </g>
      </g>
      <rect x={X.wheel - 13} y={1.6} width={26} height={2.6} rx={1.3} fill="rgba(255,255,255,.2)" />
      <rect x={X.wheel - 13} y={1.6} width={26 * load} height={2.6} rx={1.3} fill={mix([48, 209, 88], [255, 69, 58], clamp01((load - 0.3) / 0.65))} />
    </g>
  );
};

/** The penguin lying on its belly, sliding back and forth along the floor. */
const PenguinSlide: React.FC<{ f: number }> = ({ f }) => {
  const phi = (2 * Math.PI * (f - T.swap)) / 90;
  const x = X.slide + 19 * Math.sin(phi);
  const dir = Math.cos(phi) >= 0 ? 1 : -1;
  const fast = Math.abs(Math.cos(phi)) > 0.4;
  return (
    <g transform={`translate(${x} ${FLOOR}) scale(${dir * S.penguin} ${S.penguin})`}>
      {fast && <path d="M-11,-2.4 h-5 M-10,-5.2 h-4 M-11,-7.6 h-3" stroke="rgba(255,255,255,.5)" strokeWidth={0.7} strokeLinecap="round" />}
      <ellipse cx={-7.6} cy={-3.2} rx={2.2} ry={1} fill="#ffb13b" />
      <ellipse cx={0} cy={-4.6} rx={8.4} ry={4.6} fill="#4b5c85" />
      <ellipse cx={0.6} cy={-2.4} rx={7} ry={2.5} fill="#f2f4f8" />
      <ellipse cx={-1.2} cy={-5.6} rx={3.4} ry={1} fill="#3b4a70" transform="rotate(-14 -1.2 -5.6)" />
      <circle cx={5.4} cy={-6.4} r={1.1} fill="#fff" />
      <circle cx={5.8} cy={-6.4} r={0.6} fill={INK} />
      <polygon points="8,-5.6 11.8,-4.6 8,-3.6" fill="#ffb13b" />
    </g>
  );
};

type Fly = { x: number; y: number; visible: boolean; tongue: number };
/** The butterfly flutters in towards the frog; the tongue shoots out, brings it back and the frog swallows. One cycle is 96 frames. */
function flyAt(f: number): Fly & { c: number } {
  const c = (((f - T.swap + 40) % 96) + 96) % 96;
  const R = BUTTERFLY;
  const mouth = { x: X.frog + 6.4 * S.frog, y: FLOOR - 5 * S.frog };
  if (c >= 60 && c < 68) return { c, x: R.x, y: R.y, visible: true, tongue: c < 64 ? (c - 60) / 4 : 1 };
  if (c >= 68 && c < 74) {
    const q = 1 - (c - 68) / 6;
    return { c, x: lerp(mouth.x, R.x, q), y: lerp(mouth.y, R.y, q), visible: true, tongue: q };
  }
  if (c >= 74 && c < 84) return { c, x: R.x, y: R.y, visible: false, tongue: 0 };
  const p = c >= 84 ? (c - 84) / 72 : (c + 12) / 72;
  const k = 1 - p;
  return { c, x: R.x + k * 34 + 5 * Math.sin(f * 0.17) * k, y: R.y - 2 * k + 3.5 * Math.sin(f * 0.23 + 1) * k, visible: true, tongue: 0 };
}

const FrogAndFly: React.FC<{ f: number }> = ({ f }) => {
  const fly = flyAt(f);
  const gulp = fly.c >= 74 && fly.c < 80 ? 0.1 * Math.sin((Math.PI * (fly.c - 74)) / 6) : 0;
  const blink = f % 84 < 3 ? 0.15 : 1;
  const mouth = { x: X.frog + 6.4 * S.frog, y: FLOOR - 5 * S.frog };
  const flap = 0.35 + 0.65 * Math.abs(Math.sin(f * 0.9));
  return (
    <g>
      <g transform={`translate(${X.frog} ${FLOOR}) scale(${S.frog} ${S.frog * (1 + gulp)})`}>
        <ellipse cx={-4} cy={-1.6} rx={3.2} ry={1.8} fill="#58ad5a" />
        <ellipse cx={0} cy={-4.2} rx={6.2} ry={4.1} fill="#69c26b" />
        <ellipse cx={1} cy={-2.8} rx={4} ry={2.2} fill="#bfe8a6" />
        <ellipse cx={3.8} cy={-1.2} rx={2} ry={1.2} fill="#58ad5a" />
        <circle cx={0.8} cy={-8.4} r={2} fill="#69c26b" />
        <circle cx={4.2} cy={-8.2} r={2} fill="#69c26b" />
        <ellipse cx={0.9} cy={-8.5} rx={1.3} ry={1.3 * blink} fill="#fff" />
        <ellipse cx={4.3} cy={-8.3} rx={1.3} ry={1.3 * blink} fill="#fff" />
        <circle cx={1.2} cy={-8.5} r={0.65 * blink} fill={INK} />
        <circle cx={4.6} cy={-8.3} r={0.65 * blink} fill={INK} />
        <path d="M2.6,-4.6 q2.6,1.6 3.8,-0.4" fill="none" stroke={INK} strokeWidth={0.6} strokeLinecap="round" />
      </g>
      {fly.tongue > 0 && (
        <g>
          <line x1={mouth.x} y1={mouth.y} x2={lerp(mouth.x, BUTTERFLY.x, fly.tongue)} y2={lerp(mouth.y, BUTTERFLY.y, fly.tongue)} stroke="#ef6b8a" strokeWidth={1.5} strokeLinecap="round" />
          <circle cx={lerp(mouth.x, BUTTERFLY.x, fly.tongue)} cy={lerp(mouth.y, BUTTERFLY.y, fly.tongue)} r={1.3} fill="#ef6b8a" />
        </g>
      )}
      {fly.visible && (
        <g transform={`translate(${fly.x} ${fly.y})`}>
          <ellipse cx={-1.8} cy={-0.8} rx={2.3} ry={1.9 * flap} fill="#c9b8ff" transform="rotate(-25 -1.8 -0.8)" />
          <ellipse cx={1.8} cy={-0.8} rx={2.3} ry={1.9 * flap} fill="#c9b8ff" transform="rotate(25 1.8 -0.8)" />
          <ellipse cx={-1.3} cy={1} rx={1.5} ry={1.2 * flap} fill="#9d86ff" />
          <ellipse cx={1.3} cy={1} rx={1.5} ry={1.2 * flap} fill="#9d86ff" />
          <rect x={-0.3} y={-1.8} width={0.6} height={4} rx={0.3} fill={INK} />
        </g>
      )}
    </g>
  );
};

/** The corgi runs after a ball that rolls ahead of it, then both settle and the corgi waits for a pat. */
const CorgiBall: React.FC<{ f: number }> = ({ f }) => {
  const k = (2 * Math.PI) / 84;
  const settle = prog(f, T.settle, 14);
  const amp = 1 - settle;
  const ph = k * (f - T.swap);
  const vel = (1 - settle) * Math.cos(ph - 0.7) + settle;
  const cx = X.corgi + 15 * amp * Math.sin(ph - 0.7);
  const dir = vel >= 0 ? 1 : -1;
  const bx = cx + 22 * Math.tanh(4 * vel);
  const running = amp * Math.abs(Math.cos(ph - 0.7)) > 0.08;
  const petted = f >= T.pet;
  const lift = (n: number) => (running ? Math.max(0, Math.sin(f * 0.75 + (n === 0 ? 0 : Math.PI))) * 1.9 : 0);
  const bob = running ? 0.5 * Math.abs(Math.sin(f * 0.75)) : petted ? Math.abs(Math.sin((f - T.pet) * 0.35)) * 1.1 * (1 - prog(f, T.pet, 26)) : 0;
  const wag = petted || !running ? Math.sin(f * 0.8) * 1.3 : 0;
  const ballHop = running ? 2.6 * Math.abs(Math.sin(f * 0.36)) : 0;
  return (
    <g>
      <g transform={`translate(${cx} ${FLOOR - bob}) scale(${dir * S.corgi} ${S.corgi})`}>
        <circle cx={-8.6} cy={-7.4 + wag} r={1.8} fill="#e9a45e" />
        <rect x={-5.6} y={-3.6 - lift(0)} width={2.3} height={3.6} rx={1.1} fill="#c98443" />
        <rect x={4.6} y={-3.6 - lift(1)} width={2.3} height={3.6} rx={1.1} fill="#c98443" />
        <ellipse cx={0} cy={-6.6} rx={8.6} ry={4.4} fill="#e9a45e" />
        <ellipse cx={4.2} cy={-4.9} rx={3.9} ry={2.4} fill="#fff4e2" />
        <rect x={-3.8} y={-3.6 - lift(1)} width={2.5} height={3.6} rx={1.2} fill="#e9a45e" />
        <rect x={6.2} y={-3.6 - lift(0)} width={2.5} height={3.6} rx={1.2} fill="#fff4e2" />
        <polygon points="5.6,-10.6 6.2,-15.4 9.2,-11" fill="#c98443" />
        <polygon points="9.2,-10.8 11.6,-14.8 12.2,-10" fill="#c98443" />
        <circle cx={8.6} cy={-9.4} r={4.1} fill="#e9a45e" />
        <ellipse cx={11.2} cy={-8.2} rx={2.6} ry={1.7} fill="#fff4e2" />
        <circle cx={13.4} cy={-8.6} r={0.8} fill={INK} />
        {petted ? <path d="M8.8,-10.2 q1.2,-1.5 2.4,0" fill="none" stroke={INK} strokeWidth={0.7} strokeLinecap="round" /> : <circle cx={9.8} cy={-10.4} r={0.8} fill={INK} />}
        {running && <ellipse cx={11.6} cy={-6.4} rx={1.1} ry={0.9} fill="#ef6b8a" />}
      </g>
      <g transform={`translate(${bx} ${FLOOR - 2.6 - ballHop})`}>
        <circle r={2.7} fill="#f0605a" />
        <path d="M-2.2,-0.6 q2.2,-2 4.4,0" fill="none" stroke="#fff" strokeWidth={0.6} opacity={0.8} />
      </g>
    </g>
  );
};

const Heart: React.FC<{ x: number; y: number; s: number; o: number }> = ({ x, y, s, o }) => (
  <path d="M0,2.4 C-3.6,-0.2 -2.5,-3.4 0,-1.8 C2.5,-3.4 3.6,-0.2 0,2.4z" transform={`translate(${x} ${y}) scale(${s})`} fill={C.pink} opacity={o} />
);

const Portal: React.FC<{ x: number; pulse: number; f: number }> = ({ x, pulse, f }) => (
  <g transform={`translate(${x} 22) scale(${1 + 0.22 * pulse} ${1 + 0.1 * pulse})`}>
    <ellipse rx={3.8} ry={11.2} fill="#241a52" stroke="#9d86ff" strokeWidth={1.3} />
    <ellipse rx={1.7} ry={7 + 0.8 * Math.sin(f * 0.2)} fill={PURPLE} opacity={0.75 + 0.25 * pulse} />
  </g>
);

const PetScene: React.FC<SceneProps> = ({ title = true }) => {
  const f = useCurrentFrame();
  const live = springSteps(f, [[0, 0], [T.live, LIVE]]);
  const w = NOTCH.w + 128 * live;
  const cut = Math.max(0, (STAGE.w - w) / 2);
  const set1 = 1 - prog(f, T.swap, 8);
  const set2 = prog(f, T.swap + 4, 8);
  const cat = catAt(f);
  const landDip = f >= T.land && f < T.land + 10 ? 0.9 * Math.sin((Math.PI * (f - T.land)) / 10) : 0;
  const inPortal = bump(f, T.enter + 4) + bump(f, T.gone);
  const outPortal = bump(f, T.emerge + 3);
  const head = { x: X.corgi + 10.5, y: 21 };
  const hearts = [0, 1, 2].map((n) => {
    const t = (f - (T.pet + n * 9)) / 30;
    return t >= 0 && t < 1 ? { n, t } : null;
  });

  return (
    <>
      <Desktop camera={CAMERA}>
        <Notch live={live} />
        <div style={{ position: "absolute", left: STAGE.x, top: 0, width: STAGE.w, height: STAGE.h, zIndex: 25, clipPath: `inset(0 ${cut}px)`, opacity: clamp01((live - 0.5) / 0.5) }}>
          <svg width={STAGE.w} height={STAGE.h} viewBox={`${STAGE.x} 0 ${STAGE.w} ${STAGE.h}`} style={{ display: "block" }}>
            {set1 > 0 && (
              <g opacity={set1}>
                <Capybara f={f} dy={landDip} />
                {cat.perched && <Cat s={cat} f={f} dy={landDip + 0.35 * Math.sin(f * 0.09)} />}
                <Pool f={f} />
                <Hamster f={f} />
                {!cat.perched && <Cat s={cat} f={f} />}
                <Portal x={X.portalIn} pulse={inPortal} f={f} />
                <Portal x={X.portalOut} pulse={outPortal} f={f} />
              </g>
            )}
            {set2 > 0 && (
              <g opacity={set2}>
                <FrogAndFly f={f} />
                <PenguinSlide f={f} />
                <CorgiBall f={f} />
                {hearts.map((h) => h && (
                  <Heart key={h.n} x={head.x + [-5, 1, 7][h.n]} y={15 - 11 * h.t} s={0.9 + 0.4 * (1 - h.t)} o={Math.sin(Math.PI * Math.min(1, h.t * 1.1))} />
                ))}
              </g>
            )}
          </svg>
        </div>
        <Cursor frame={f} moves={moves} clicks={[T.pet]} hidden={f < T.pet - 34} />
      </Desktop>
      <Captions
        frame={f}
        label="Thú cưng"
        lines={[
          { f: 46, to: 118, text: "Chơi chung với nhau, chạy nhanh khi máy bận" },
          { f: 128, to: 236, text: "Sáu bạn nhỏ sống trên notch, mỗi màn hình tối đa 3 bạn" },
        ]}
      />
      {title && <ChapterTitle frame={f} title="Thú cưng" sub="Mèo, capybara, hamster, chim cánh cụt, corgi, ếch" />}
    </>
  );
};

export const pet: SceneDef = { id: "pet", label: "Thú cưng", dur: T.end, Comp: PetScene };
