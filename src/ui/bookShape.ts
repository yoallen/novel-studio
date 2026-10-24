// The shape of the book: the geometry behind the drawing on the Today page, kept free of the page
// so it can be tested.
//
// The line is the whole book, from its first word to THE END, as long as her target length (or, with no
// target, as long as the push would make it). Where she is comes from words alone: every word in the
// book over that length. The line's rise and fall is a story's tension: quiet in the set-up, wobbling
// through the struggle, dropping at the dark moment, peaking at the climax. The beats are signposts at
// the share of the book their sheet gives them. A writing push is a stretch marked under the line,
// from where the book stood on its first day to where its goal would take it.

export type ShapeDay = { day: string; words: number; goal?: number | null; set?: boolean; future?: boolean; today?: boolean };
export type ShapeSegment = { id: string; name: string; from: number; to: number; moment?: string | null };
export type ShapeLabel = { id: string; name: string; x: number; y: number; reached: boolean; now: boolean; tick: [number, number] };
export type Box = { x0: number; x1: number; y0: number; y1: number };

export const W = 700, H = 300;
const L = 20, R = 640, BASE = 255;
/** Label sizes, in drawing units: beats reached, beats ahead, and the words that must always be there. */
export const SIZE = { reached: 30, ahead: 25, here: 27, end: 36, push: 24 };

/** A label's width in the pen's narrow hand, a little generous so nothing touches. */
export const labelWidth = (name: string, size: number) => name.length * size * 0.42 + 10;
/** A pen label's box at a baseline, anchored at its start, middle or end. */
export function boxAt(x: number, y: number, name: string, size: number, anchor: 'start' | 'middle' | 'end' = 'middle'): Box {
  const w = labelWidth(name, size), x0 = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2;
  return { x0, x1: x0 + w, y0: y - size, y1: y + 3 };
}

/** Tension by share of the book: a common dramatic shape, not any one sheet's, and not her plot. */
const K: [number, number][] = [[0, 0], [0.08, 4], [0.1, 18], [0.18, 24], [0.2, 50], [0.35, 80], [0.5, 130], [0.62, 152], [0.74, 186], [0.77, 104], [0.8, 96], [0.84, 165], [0.95, 220], [0.985, 130], [1, 104]];
export function tension(t: number) {
  for (let i = 1; i < K.length; i++) {
    const [a, ya] = K[i - 1]!, [b, yb] = K[i]!;
    if (t <= b) { const u = (t - a) / (b - a), s = u * u * (3 - 2 * u); return ya + (yb - ya) * s; }
  }
  return 104;
}

/** A small, steady hand tremor: the same novel always draws the same line. */
function rng(seedText: string) {
  let s = 7; for (const ch of seedText) s = (s * 31 + ch.charCodeAt(0)) % 233280;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
}

const N = 600;
export function line(seedText: string) {
  const r = rng(seedText); let drift = 0;
  const pts: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N; drift = (drift + (r() - 0.5) * 0.3) * 0.92;
    const wobble = t > 0.2 && t < 0.74 ? Math.sin(t * 80) * (4 + (t - 0.2) * 11) : 0; // the struggle wobbles
    pts.push([L + t * (R - L), BASE - tension(t) - wobble + drift]);
  }
  return pts;
}
const clamp = (t: number) => Math.min(1, Math.max(0, t));
export const at = (pts: [number, number][], t: number) => pts[Math.round(clamp(t) * N)]!;
export const path = (pts: [number, number][], a: number, b: number, dy = 0) => {
  const i = Math.round(clamp(a) * N), j = Math.round(clamp(b) * N);
  return j <= i ? '' : 'M' + pts.slice(i, j + 1).map((p) => `${p[0].toFixed(1)} ${(p[1] + dy).toFixed(1)}`).join(' L');
};

/**
 * How long the line is, and what was already in the book before the first day shown.
 * `total` is the words written in the days shown (the push so far, or the month so far).
 */
export function frame(o: { bookWords: number; total: number; target?: number | null; pushGoal?: number | null }) {
  const base = Math.max(0, o.bookWords - Math.max(0, o.total));
  const planned = o.target || (o.pushGoal ? base + o.pushGoal : 0);
  if (!planned) return null;
  // A book that runs past its length stretches the line: THE END moves out with her.
  const length = Math.max(planned, o.bookWords, 1);
  const push = o.pushGoal ? { from: base / length, to: Math.min(1, (base + o.pushGoal) / length) } : null;
  return { length, base, push, measured: (o.target ? 'target' : 'push') as 'target' | 'push', past: o.bookWords > planned };
}

/**
 * Where each day ended on the line. A day that cut words never walks her backwards: the line is how far
 * she has come, and the figures say the rest.
 */
export function walk(days: ShapeDay[], length: number, base = 0) {
  let run = base, far = base;
  const ends = days.map((d) => {
    if (!d.future) { run += d.words; far = Math.max(far, run); }
    return { ...d, t: Math.min(1, far / length) };
  });
  return { done: Math.min(1, far / length), ends };
}

const restDay = (d: ShapeDay) => !!d.set && d.goal === 0;

/** Day marks: a tick where each written day ended, a chair where she rested on purpose. Nothing for a day missed. */
export function marks(days: ShapeDay[], length: number, base = 0) {
  const { ends } = walk(days, length, base);
  return {
    ticks: ends.filter((d) => !d.future && d.words > 0 && !d.today).map((d) => ({ t: d.t, day: d.day })),
    chairs: ends.filter((d) => !d.future && restDay(d)).map((d) => ({ t: d.t, day: d.day })),
  };
}

/** The turning points every sheet shares, in the order she should always be able to find them. */
const MAJOR = ['inciting', 'threshold', 'midpoint', 'lowest', 'third', 'climax'];

/**
 * Which beats get written on the line. There isn't room for every one, so the beat her plan says she is in
 * comes first, then the turning points (the inciting moment, the move into act two, the midpoint, the lowest
 * point, the move into act three, the climax), then any others wherever they don't crowd a label or cross
 * the line. Beats behind her are written larger, in ink; beats ahead smaller, in pencil.
 */
export function labels(pts: [number, number][], segs: ShapeSegment[], done: number, reserved: Box[] = [], nowId: string | null = null): ShapeLabel[] {
  if (!segs.length) return [];
  const spot = (s: ShapeSegment) => (s.to - s.from < 0.015 ? s.from : (s.from + s.to) / 2);
  const rank = (s: ShapeSegment) => (s.id === nowId ? -1 : s.moment && MAJOR.includes(s.moment) ? MAJOR.indexOf(s.moment) : s.moment ? 10 : 20);
  const order = segs.map((s, i) => ({ s, i })).sort((a, b) => rank(a.s) - rank(b.s) || a.i - b.i);
  const boxes: Box[] = [...reserved];
  const placed: (ShapeLabel & { i: number })[] = [];
  for (const { s, i } of order) {
    const t = spot(s), [x, y] = at(pts, t), reached = done > 0 && t <= done, now = s.id === nowId;
    const size = reached || now ? SIZE.reached : SIZE.ahead, w = labelWidth(s.name, size);
    // Above the line first; where the line falls away (the dark moment), below it. A label sits clear of
    // the line across its whole width, and steps further out rather than crowd another label.
    const slope = at(pts, Math.min(1, t + 0.02))[1] - at(pts, Math.max(0, t - 0.02))[1];
    const cx = Math.min(W - w / 2 - 4, Math.max(w / 2 + 4, x));
    const under = pts.filter(([px]) => px >= cx - w / 2 && px <= cx + w / 2).map(([, py]) => py);
    const top = Math.min(y, ...under), bottom = Math.max(y, ...under);
    const above = [top - 10, top - 10 - size - 4], below = [bottom + size + 8, bottom + 2 * size + 12];
    const tries = slope > 25 ? [...below, ...above] : [above[0]!, below[0]!, above[1]!, below[1]!];
    for (const ly of tries) {
      const b = { x0: cx - w / 2, x1: cx + w / 2, y0: ly - size, y1: ly + 3 };
      if (b.y0 < 0 || b.y1 > H) continue;
      if (boxes.some((o) => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0)) continue;
      boxes.push(b);
      placed.push({ i, id: s.id, name: s.name, x: cx, y: ly, reached, now, tick: [x, y] });
      break;
    }
  }
  return placed.sort((a, b) => a.i - b.i).map(({ i: _i, ...l }) => l);
}
