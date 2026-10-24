// The shape of the book: the geometry behind the drawing on the Today page, kept free of the page
// so it can be tested. One pen line runs the length of the book. How far along it she is comes from
// words alone (words written over the goal); the line's rise and fall is a story's tension, quiet
// in the set-up, wobbling through the struggle, dropping at the dark moment, peaking at the climax.
// The beats are signposts on it, at the share of the book their sheet gives them.

export type ShapeDay = { day: string; words: number; goal?: number | null; set?: boolean; future?: boolean; today?: boolean };
export type ShapeSegment = { id: string; name: string; from: number; to: number };
export type ShapeLabel = { name: string; x: number; y: number; rot: number; reached: boolean; tick: [number, number] };

export const W = 1000, H = 330;
/** A label's width in the pen's narrow hand, a little generous so nothing touches. */
export const labelWidth = (name: string, size: number) => name.length * size * 0.42 + 10;
const L = 40, R = 920, BASE = 290;

/** Tension by share of the book: a common dramatic shape, not any one sheet's. */
const K: [number, number][] = [[0, 0], [0.08, 4], [0.1, 20], [0.18, 26], [0.2, 55], [0.35, 90], [0.5, 150], [0.62, 175], [0.74, 215], [0.77, 120], [0.8, 110], [0.84, 190], [0.95, 255], [0.985, 150], [1, 120]];
export function tension(t: number) {
  for (let i = 1; i < K.length; i++) {
    const [a, ya] = K[i - 1]!, [b, yb] = K[i]!;
    if (t <= b) { const u = (t - a) / (b - a), s = u * u * (3 - 2 * u); return ya + (yb - ya) * s; }
  }
  return 120;
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
    const t = i / N; drift = (drift + (r() - 0.5) * 0.35) * 0.92;
    const wobble = t > 0.2 && t < 0.74 ? Math.sin(t * 95) * (5 + (t - 0.2) * 14) : 0; // the struggle wobbles
    pts.push([L + t * (R - L), BASE - tension(t) - wobble + drift]);
  }
  return pts;
}
export const at = (pts: [number, number][], t: number) => pts[Math.round(Math.min(1, Math.max(0, t)) * N)]!;
export const path = (pts: [number, number][], a: number, b: number) => {
  const i = Math.round(Math.min(1, Math.max(0, a)) * N), j = Math.round(Math.min(1, Math.max(0, b)) * N);
  return j <= i ? '' : 'M' + pts.slice(i, j + 1).map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L');
};

/**
 * Where she is and where each day ended. `base` is words already in the book before the first day shown
 * (zero for a push that starts a fresh draft). A day that cut words never walks her backwards on the line:
 * the line is how far she has come, and the figures say the rest.
 */
export function walk(days: ShapeDay[], goal: number, base = 0) {
  let run = base, far = base;
  const ends = days.map((d) => {
    if (!d.future) { run += d.words; far = Math.max(far, run); }
    return { ...d, t: Math.min(1, far / goal) };
  });
  return { done: Math.min(1, far / goal), ends, past: far > goal };
}

const restDay = (d: ShapeDay) => !!d.set && d.goal === 0;

/** Day marks: a tick where each written day ended, a chair where she rested on purpose. Nothing for a day missed. */
export function marks(days: ShapeDay[], goal: number, base = 0) {
  const { ends } = walk(days, goal, base);
  return {
    ticks: ends.filter((d) => !d.future && d.words > 0 && !d.today).map((d) => ({ t: d.t, day: d.day })),
    chairs: ends.filter((d) => !d.future && restDay(d)).map((d) => ({ t: d.t, day: d.day })),
  };
}

/**
 * Which beats get written on the line. There isn't room for every one, so she always sees the beat she is
 * in and the next one; the rest go in order wherever they don't crowd another label. Beats behind her are
 * written larger, in ink; beats ahead smaller, in pencil.
 */
export type Box = { x0: number; x1: number; y0: number; y1: number };
/** A pen label's box at a baseline, anchored at its start, middle or end. */
export function boxAt(x: number, y: number, name: string, size: number, anchor: 'start' | 'middle' | 'end' = 'middle'): Box {
  const w = labelWidth(name, size), x0 = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2;
  return { x0, x1: x0 + w, y0: y - size, y1: y + 3 };
}

export function labels(pts: [number, number][], segs: ShapeSegment[], done: number, reserved: Box[] = []): ShapeLabel[] {
  if (!segs.length) return [];
  const spot = (s: ShapeSegment) => (s.to - s.from < 0.015 ? s.from : (s.from + s.to) / 2);
  const inIdx = Math.max(0, segs.findIndex((s) => done >= s.from && done < Math.max(s.to, s.from + 0.0001)));
  const nextIdx = segs.findIndex((s) => s.from > done);
  const order = [inIdx, nextIdx, ...segs.map((_, i) => i)].filter((i, k, a) => i >= 0 && a.indexOf(i) === k);
  const boxes: Box[] = [...reserved];
  const placed: (ShapeLabel & { i: number })[] = [];
  for (const i of order) {
    const s = segs[i]!, t = spot(s), [x, y] = at(pts, t), reached = t <= done;
    const size = reached ? 30 : 24, w = labelWidth(s.name, size);
    // Above the line first; where the line falls away (the dark moment), below it. A label sits clear of
    // the line across its whole width, and steps further out rather than crowd another label.
    const slope = at(pts, Math.min(1, t + 0.02))[1] - at(pts, Math.max(0, t - 0.02))[1];
    const cx = Math.min(W - w / 2 - 4, Math.max(w / 2 + 4, x));
    const under = pts.filter(([px]) => px >= cx - w / 2 && px <= cx + w / 2).map(([, py]) => py);
    const top = Math.min(y, ...under), bottom = Math.max(y, ...under);
    const above = [top - 10, top - 10 - size - 4], below = [bottom + size + 6, bottom + 2 * size + 10];
    const tries = slope > 25 ? [...below, ...above] : [above[0]!, below[0]!, above[1]!, below[1]!];
    for (const ly of tries) {
      const b = { x0: cx - w / 2, x1: cx + w / 2, y0: ly - size, y1: ly + 3 };
      if (b.y0 < 0 || b.y1 > H) continue;
      if (boxes.some((o) => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0)) continue;
      boxes.push(b);
      placed.push({ i, name: s.name, x: cx, y: ly, rot: 0, reached, tick: [x, y] });
      break;
    }
  }
  return placed.sort((a, b) => a.i - b.i).map(({ i: _i, ...l }) => l);
}
