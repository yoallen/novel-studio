import { describe, it, expect } from 'vitest';
import { line, walk, marks, labels, at, tension, labelWidth, frame, SIZE, type ShapeDay } from '../src/ui/bookShape';

const nov = (words: number[], extra: Partial<ShapeDay>[] = []): ShapeDay[] =>
  Array.from({ length: 30 }, (_, i) => ({ day: `2026-11-${String(i + 1).padStart(2, '0')}`, words: words[i] ?? 0, future: i >= words.length, today: i === words.length - 1, ...(extra[i] ?? {}) }));

describe('the shape of the book', () => {
  const words = [2100, 1700, 1900, 0, 2600, 1500, 0, 2300, 1800, 3100, 1700, 900];
  const days = nov(words, { 6: { set: true, goal: 0 } } as any);

  it('the line is the whole book; the push is a stretch of it', () => {
    // An 80,000-word book, 30,000 already written, a 50,000-word push 19,600 in.
    const f = frame({ bookWords: 49600, total: 19600, target: 80000, pushGoal: 50000 })!;
    expect(f).toMatchObject({ length: 80000, base: 30000, measured: 'target', past: false });
    expect(f.push!.from).toBeCloseTo(30000 / 80000, 5);
    expect(f.push!.to).toBe(1);
    expect(walk(days, f.length, f.base).done).toBeCloseTo(49600 / 80000, 5);
    // No target: the push is as long as the book will be, and says so.
    expect(frame({ bookWords: 19600, total: 19600, pushGoal: 50000 })).toMatchObject({ length: 50000, measured: 'push' });
    // Past the length she set, the line stretches with her.
    expect(frame({ bookWords: 90000, total: 1000, target: 80000 })).toMatchObject({ length: 90000, past: true, push: null });
    // Nothing to measure against: no line.
    expect(frame({ bookWords: 500, total: 500 })).toBeNull();
  });

  it('word count alone moves her along the line', () => {
    const { done } = walk(days, 50000);
    expect(done).toBeCloseTo(19600 / 50000, 5);
    // Without a push, the book's own target, counting the words already there.
    expect(walk(days, 100000, 30400).done).toBeCloseTo(0.5, 5);
    // Past the goal she is at the end, and the line says so.
    expect(walk(nov([60000]), 50000).done).toBe(1);
  });

  it('a tick for each day written, a chair for the rest day she set, nothing for a day missed', () => {
    const { ticks, chairs } = marks(days, 50000);
    expect(ticks).toHaveLength(9); // ten days with words, less today (today is the dot)
    expect(chairs).toHaveLength(1);
    expect(chairs[0]!.t).toBeCloseTo((2100 + 1700 + 1900 + 2600 + 1500) / 50000, 5);
  });

  it('a day of cutting never walks her backwards', () => {
    const { ends, done } = walk(nov([3000, -1000, 500]), 50000);
    expect(ends[1]!.t).toBeCloseTo(3000 / 50000, 5);
    expect(done).toBeCloseTo(3000 / 50000, 5); // 2,500 written net; the line holds at the farthest point
  });

  it('the line has a story shape and draws the same for the same novel', () => {
    expect(tension(0.5)).toBeGreaterThan(tension(0.2));
    expect(tension(0.78)).toBeLessThan(tension(0.74)); // the dark moment drops
    expect(tension(0.95)).toBeGreaterThan(tension(0.74)); // the climax is the peak
    expect(line('p1')).toEqual(line('p1'));
  });

  it('she always sees the beat she is in and the next; labels never crowd each other', () => {
    const segs = [
      ['Opening Image', 0, 0.01], ['Theme Stated', 0.05, 0.05], ['Set-Up', 0.01, 0.1], ['Catalyst', 0.1, 0.1], ['Debate', 0.1, 0.2],
      ['Break into Two', 0.2, 0.2], ['B Story', 0.22, 0.22], ['Fun and Games', 0.2, 0.5], ['Midpoint', 0.5, 0.5], ['Bad Guys Close In', 0.5, 0.75],
      ['All Is Lost', 0.75, 0.75], ['Dark Night of the Soul', 0.75, 0.8], ['Break into Three', 0.8, 0.8], ['Finale', 0.8, 0.99], ['Final Image', 0.99, 1],
    ].map(([name, from, to], i) => ({ id: `b${i}`, name: name as string, from: from as number, to: to as number }));
    const pts = line('p1');
    const moments: Record<string, string> = { 'Opening Image': 'opening', Catalyst: 'inciting', 'Break into Two': 'threshold', Midpoint: 'midpoint', 'All Is Lost': 'lowest', 'Break into Three': 'third', Finale: 'climax', 'Final Image': 'ending' };
    for (const sg of segs) (sg as any).moment = moments[sg.name] ?? null;
    const got = labels(pts, segs, 0.392, [], 'b7');
    const names = got.map((l) => l.name);
    expect(names).toContain('Fun and Games');
    expect(names).toContain('Midpoint');
    // The turning points come before minor beats.
    for (const k of ['Catalyst', 'Break into Two', 'All Is Lost', 'Break into Three']) expect(names, k).toContain(k);
    expect(got.find((l) => l.name === 'Fun and Games')!.now).toBe(true);
    expect(got.find((l) => l.name === 'Fun and Games')!.reached).toBe(true);
    expect(got.find((l) => l.name === 'Midpoint')!.reached).toBe(false);
    expect(got.length).toBeGreaterThanOrEqual(6);
    const box = (l: (typeof got)[number]) => { const size = l.reached || l.now ? SIZE.reached : SIZE.ahead, w = labelWidth(l.name, size); return { x0: l.x - w / 2, x1: l.x + w / 2, y0: l.y - size, y1: l.y + 3 }; };
    for (const l of got) { const b = box(l); expect(pts.some(([x, y]) => x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1), `${l.name} crosses the line`).toBe(false); }
    for (const a of got) for (const b of got) if (a !== b) { const p = box(a), q = box(b); expect(p.x0 < q.x1 && p.x1 > q.x0 && p.y0 < q.y1 && p.y1 > q.y0, `${a.name} / ${b.name}`).toBe(false); }
    expect(at(pts, 1)[0]).toBeGreaterThan(at(pts, 0)[0]);
  });
});
