import { describe, it, expect } from 'vitest';
import { line, layout, boxAt, SIZE, GAP, type ShapeSegment, type BeatState } from '../src/ui/bookShape';

// Nothing on the book map may crowd anything else: no two words touch, no word sits on the line, every
// pink beat keeps its name and its *writing here*, and THE END has its own room past the end of the line.
const SHEET: [string, number, number, string | null][] = [
  ['Opening Image', 0, 0.01, 'opening'], ['Theme Stated', 0.05, 0.05, null], ['Set-Up', 0.01, 0.1, null], ['Catalyst', 0.1, 0.1, 'inciting'],
  ['Debate', 0.1, 0.2, null], ['Break into Two', 0.2, 0.2, 'threshold'], ['B Story', 0.22, 0.22, null], ['Fun and Games', 0.2, 0.5, null],
  ['Midpoint', 0.5, 0.5, 'midpoint'], ['Bad Guys Close In', 0.5, 0.75, null], ['All Is Lost', 0.75, 0.75, 'lowest'],
  ['Dark Night of the Soul', 0.75, 0.8, null], ['Break into Three', 0.8, 0.8, 'third'], ['Finale', 0.8, 0.99, 'climax'], ['Final Image', 0.99, 1, 'ending'],
];
const segs: ShapeSegment[] = SHEET.map(([name, from, to, moment], i) => ({ id: `b${i}`, name, from, to, moment }));
const touch = (a: any, b: any) => a.x0 < b.x1 + GAP / 2 && a.x1 > b.x0 - GAP / 2 && a.y0 < b.y1 + GAP / 2 && a.y1 > b.y0 - GAP / 2;

function check(seed: string, now: string[], writtenUpTo: number) {
  const pts = line(seed);
  const stateOf = (s: ShapeSegment): BeatState => (now.includes(s.id) ? 'now' : Number(s.id.slice(1)) < writtenUpTo ? 'written' : 'ahead');
  const { end, marks, words } = layout(pts, segs, stateOf);
  const boxes = [
    { n: 'THE END', ...boxAt(end.x, end.y, 'THE END', SIZE.end, 'start') },
    ...words.map((l) => ({ n: l.name, ...boxAt(l.x, l.y, l.name, l.state === 'ahead' ? SIZE.ahead : SIZE.reached) })),
    ...marks.map((m) => ({ n: m.text, ...boxAt(m.lx, m.ly, m.text, SIZE.here, m.anchor) })),
  ];
  const where = `${seed} now=${now.join(',')} written<${writtenUpTo}`;
  for (const b of boxes) {
    expect(b.x0 >= 0 && b.x1 <= 1000 && b.y0 >= 0, `${b.n} off the page, ${where}`).toBe(true);
    expect(pts.some(([x, y]) => x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1), `${b.n} on the line, ${where}`).toBe(false);
  }
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) expect(touch(boxes[i], boxes[j]), `${boxes[i]!.n} crowds ${boxes[j]!.n}, ${where}`).toBe(false);
  for (const id of now) {
    expect(words.some((l) => l.id === id), `${id} lost its name, ${where}`).toBe(true);
    // Its name is always there. Its own words by the dot are there when a clear spot is close by; a pink
    // beat crowded by its neighbors keeps its pink name and dot, and never a stroke wandering across the map.

  }
  // A name set higher or lower than the line stays close, never far off the map.
  for (const l of words) expect(Math.abs(l.y - l.tick[1]), `${l.name} too far from its beat, ${where}`).toBeLessThan(150);
  // *writing here* is always there, except when two pink beats are crowded together at the very start, where
  // their two pink names already say it and there is no clear room for more.
  const spread = now.map((id) => segs.find((s) => s.id === id)!.from);
  const crowdedStart = now.length > 1 && Math.max(...spread) < 0.08;
  if (now.length && !crowdedStart) expect(marks.length, `no *writing here*, ${where}`).toBeGreaterThan(0);
  expect(marks[0]?.text ?? 'writing here').toBe('writing here');
  for (const m of marks) expect(Math.hypot(m.lx - m.x, m.ly - m.y), `${m.text} too far from its dot, ${where}`).toBeLessThan(180);
  // The turning points always make it, unless one is squeezed right between beats she is writing in.
  for (const k of ['Catalyst', 'Midpoint', 'All Is Lost']) {
    const tp = segs.find((s) => s.name === k)!;
    const squeezed = now.some((id) => { const s = segs.find((x) => x.id === id)!; return Math.abs(s.from - tp.from) <= 0.1 || Math.abs(s.to - tp.from) <= 0.1; });
    if (!squeezed) expect(words.some((l) => l.name === k), `${k} missing, ${where}`).toBe(true);
  }
}

describe('the book map has room for everything', () => {
  it('one beat being written, anywhere in the book, with any amount written', () => {
    for (const seed of ['p1', 'gull-point', 'x9']) for (let i = 0; i < segs.length; i++) for (const w of [0, i, segs.length]) check(seed, [`b${i}`], w);
  });
  it('two beats being written at once, including far apart and side by side', () => {
    for (const seed of ['p1', 'gull-point']) for (let i = 0; i < segs.length; i++) for (let j = i + 1; j < segs.length; j++) check(seed, [`b${i}`, `b${j}`], i);
  });
  it('three or four at once', () => {
    for (const now of [['b4', 'b9', 'b13'], ['b0', 'b7', 'b13'], ['b2', 'b5', 'b9', 'b14'], ['b7', 'b8', 'b9', 'b10']]) check('p1', now, 3);
  });
});
