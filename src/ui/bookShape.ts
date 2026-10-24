// The shape of the book: the geometry behind the drawing on the Today page, kept free of the page
// so it can be tested.
//
// The line is the whole book, from its first word to THE END. Its rise and fall is a story's tension: quiet
// in the set-up, wobbling through the struggle, dropping at the dark moment, peaking at the climax. The beats
// are signposts at the share of the book their sheet gives them. Where she is comes from her writing, never
// from a word count: a beat is in ink once a scene on it has words, in pink while she is writing in it.

export type ShapeDay = { day: string; words: number; goal?: number | null; set?: boolean; future?: boolean; today?: boolean };
export type ShapeSegment = { id: string; name: string; from: number; to: number; moment?: string | null; written?: boolean };
/** How a beat stands: written in (ink), being written now (pink), or still ahead (pencil). */
export type BeatState = 'written' | 'now' | 'ahead';
export type ShapeLabel = { id: string; name: string; x: number; y: number; state: BeatState; tick: [number, number] };
export type Box = { x0: number; x1: number; y0: number; y1: number };

// The drawing is wide, the whole width of the page, so the beats have room to breathe; THE END is written
// past the end of the line, not under it.
export const W = 1000, H = 360;
const L = 20, R = 850, BASE = 275;
/** Label sizes, in drawing units: beats reached, beats ahead, and the words that must always be there. */
export const SIZE = { reached: 34, ahead: 29, here: 31, end: 42, push: 24 };
/** The least space between any two things on the map, in drawing units. */
export const GAP = 10;

/**
 * A label's width in the pen's narrow hand, measured from Just Another Hand: capitals and the wide m and w
 * take more room than the rest. A little generous, so nothing touches.
 */
export const labelWidth = (name: string, size: number) =>
  [...name].reduce((a, ch) => a + (ch === ' ' ? 0.15 : /[A-Z]/.test(ch) ? 0.37 : /[mwMW]/.test(ch) ? 0.4 : 0.27), 0) * size + 8;
/** A pen label's box at a baseline, anchored at its start, middle or end: tall letters above, tails below. */
export function boxAt(x: number, y: number, name: string, size: number, anchor: 'start' | 'middle' | 'end' = 'middle'): Box {
  const w = labelWidth(name, size), x0 = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2;
  return { x0, x1: x0 + w, y0: y - size * 0.78, y1: y + size * 0.32 };
}
const hits = (a: Box, b: Box, gap = GAP) => a.x0 < b.x1 + gap && a.x1 > b.x0 - gap && a.y0 < b.y1 + gap && a.y1 > b.y0 - gap;
/** Does a box touch the line, with room to spare? */
const onLine = (pts: [number, number][], b: Box, gap = GAP - 2) => pts.some(([x, y]) => x >= b.x0 - gap && x <= b.x1 + gap && y >= b.y0 - gap && y <= b.y1 + gap);
const inside = (b: Box) => b.x0 >= 2 && b.x1 <= W - 2 && b.y0 >= 2 && b.y1 <= H - 2;

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

/** Where a beat sits on the line: a moment at its point, a stretch at its middle. */
export const spotOf = (s: ShapeSegment) => (s.to - s.from < 0.015 ? s.from : (s.from + s.to) / 2);
/** The stretch of line a beat covers, at least wide enough to see. */
export const stretchOf = (s: ShapeSegment): [number, number] => [s.from, Math.min(1, Math.max(s.to, s.from + 0.012))];

/**
 * Which beats get written on the line. There isn't room for every one, so the beats she is writing now come
 * first, then the turning points (the inciting moment, the move into act two, the midpoint, the lowest point,
 * the move into act three, the climax), then any others wherever they don't crowd a label or cross the line.
 * Beats written in and beats being written are larger; beats still ahead smaller, in pencil.
 */
export function labels(pts: [number, number][], segs: ShapeSegment[], stateOf: (s: ShapeSegment) => BeatState, reserved: Box[] = [], only?: (s: ShapeSegment) => boolean, rows = 2): ShapeLabel[] {
  if (!segs.length) return [];
  const rank = (s: ShapeSegment) => (stateOf(s) === 'now' ? -1 : s.moment && MAJOR.includes(s.moment) ? MAJOR.indexOf(s.moment) : s.moment ? 10 : 20);
  const order = segs.map((s, i) => ({ s, i })).filter(({ s }) => !only || only(s)).sort((a, b) => rank(a.s) - rank(b.s) || a.i - b.i);
  const boxes: Box[] = reserved;
  const placed: (ShapeLabel & { i: number })[] = [];
  for (const { s, i } of order) {
    const t = spotOf(s), [x, y] = at(pts, t), state = stateOf(s);
    const size = state === 'ahead' ? SIZE.ahead : SIZE.reached, w = labelWidth(s.name, size);
    // Right by its beat: above the line, then below, then nudged a little to either side, then one step
    // further off. The first spot that touches nothing else wins. A name never floats away from its beat:
    // one that finds no clear spot close by is left off the line (it is still in the chooser).
    const tries: [number, number][] = [];
    for (let dy = 0; dy < rows; dy++) for (const dx of [0, -0.3, 0.3, -0.45, 0.45]) {
      tries.push([x + dx * w, -(GAP + dy * (size * 0.9))]);
      tries.push([x + dx * w, GAP + dy * (size * 0.9)]);
    }
    for (const [cx0, off] of tries) {
      const cx = Math.min(W - w / 2 - 4, Math.max(w / 2 + 4, cx0));
      const under = pts.filter(([px]) => px >= cx - w / 2 - GAP && px <= cx + w / 2 + GAP).map(([, py]) => py);
      const ly = off < 0 ? Math.min(...under) + off - size * 0.32 : Math.max(...under) + off + size * 0.78;
      const b = boxAt(cx, ly, s.name, size);
      if (!inside(b) || onLine(pts, b) || boxes.some((o) => hits(b, o))) continue;
      boxes.push(b);
      placed.push({ i, id: s.id, name: s.name, x: cx, y: ly, state, tick: [x, y] });
      break;
    }
  }
  return placed.sort((a, b) => a.i - b.i).map(({ i: _i, ...l }) => l);
}

export type HereMark = { id: string; x: number; y: number; text: string; lx: number; ly: number; anchor: 'start' | 'end'; leader: string };

/** Points along a gentle curve from the dot to its words, for drawing and for keeping other words off it. */
function leaderPts(x: number, y: number, ex: number, ey: number): [number, number][] {
  // A hand's curl: out from the dot along the slant, then easing level into the words.
  const cx = x + (ex - x) * 0.35, cy = ey;
  const out: [number, number][] = [];
  for (let i = 0; i <= 40; i++) { const u = i / 40, v = 1 - u; out.push([v * v * x + 2 * v * u * cx + u * u * ex, v * v * y + 2 * v * u * cy + u * u * ey]); }
  return out;
}

/**
 * The whole map's words, placed so nothing crowds anything: THE END past the end of the line, then the
 * names of the beats she is writing in, then *writing here* / *and here* by each pink dot, its fine pen
 * stroke kept clear of every word, then the turning points, then every other beat that fits.
 */
export function layout(pts: [number, number][], segs: ShapeSegment[], stateOf: (s: ShapeSegment) => BeatState) {
  const [ex, ey] = at(pts, 1);
  const end = { x: ex + 18, y: ey + SIZE.end * 0.3 };
  const boxes: Box[] = [boxAt(end.x, end.y, 'THE END', SIZE.end, 'start')];
  const nowSegs = segs.filter((s) => stateOf(s) === 'now');
  // Room for each dot, so no word sits on one.
  for (const s of nowSegs) { const [x, y] = at(pts, spotOf(s)); boxes.push({ x0: x - 7, x1: x + 7, y0: y - 7, y1: y + 7 }); }
  const major = (s: ShapeSegment) => !!s.moment && MAJOR.includes(s.moment);
  const nowLabels = labels(pts, segs, stateOf, boxes, (s) => stateOf(s) === 'now');
  const marks: HereMark[] = [];
  nowSegs.forEach((s) => {
    const [x, y] = at(pts, spotOf(s)), size = SIZE.here;
    // Two pink beats side by side share one set of words: a second *and here* there would only crowd.
    if (marks.some((m) => Math.hypot(m.x - x, m.y - y) < 100)) return;
    const text = marks.length === 0 ? 'writing here' : 'and here';
    const w = labelWidth(text, size);
    const tries: [number, number, 'start' | 'end'][] = [];
    // Every nearby spot, closest first (below a little ahead of above), so there is always a clear one.
    // Close by, never far: a stroke longer than a short reach would wander across the map, so a dot with no
    // clear spot near it keeps only its pink name. Slanting spots read best, below a little before above.
    for (let dx = 20; dx <= 130; dx += 10) for (let dy = -110; dy <= 110; dy += 10) for (const side of [1, -1] as const) {
      if (Math.abs(dy) < 20) continue;
      tries.push([x + side * dx, y + dy, side > 0 ? 'start' : 'end']);
    }
    const cost = ([lx, ly]: [number, number, unknown]) => Math.hypot(lx - x, ly - y) * (ly > y ? 0.9 : 1) + Math.abs(Math.abs(lx - x) - Math.abs(ly - y)) * 0.4;
    tries.sort((a, b) => cost(a) - cost(b));
    let pick: HereMark | null = null;
    for (const [lx, ly, anchor] of tries) {
      const b = boxAt(lx, ly, text, size, anchor);
      if (!inside(b) || onLine(pts, b) || boxes.some((o) => hits(b, o))) continue;
      const tx = anchor === 'start' ? lx - 4 : lx + 4, ty = ly - size * 0.3;
      const lp = leaderPts(x + Math.sign(tx - x) * 6, y + Math.sign(ty - y) * 6, tx, ty);
      // The stroke leaves from its own dot, but must not cross the line again or touch any word.
      if (lp.slice(6).some(([px, py]) => pts.some(([qx, qy]) => Math.abs(px - qx) < 4 && Math.abs(py - qy) < 4))) continue;
      if (lp.slice(6).some(([px, py]) => boxes.some((o) => px > o.x0 - 3 && px < o.x1 + 3 && py > o.y0 - 3 && py < o.y1 + 3))) continue;
      boxes.push(b);
      for (const [px, py] of lp) boxes.push({ x0: px - 2, x1: px + 2, y0: py - 2, y1: py + 2 });
      pick = { id: s.id, x, y, text, lx, ly, anchor, leader: 'M' + lp.map(([px, py]) => `${px.toFixed(1)} ${py.toFixed(1)}`).join(' L') };
      break;
    }
    if (pick) marks.push(pick);
  });
  // Then the turning points, so she can find her way along the line, and last every other beat that fits.
  const turning = labels(pts, segs, stateOf, boxes, (s) => stateOf(s) !== 'now' && major(s));
  const rest = labels(pts, segs, stateOf, boxes, (s) => stateOf(s) !== 'now' && !major(s));
  const order = new Map(segs.map((s, i) => [s.id, i]));
  const dots = nowSegs.map((s) => { const [x, y] = at(pts, spotOf(s)); return { id: s.id, x, y }; });
  return { end, dots, marks, words: [...nowLabels, ...turning, ...rest].sort((a, b) => order.get(a.id)! - order.get(b.id)!), boxes };
}
