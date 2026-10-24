import { describe, it, expect, afterEach } from 'vitest';
import { layoutShelf, pagesOf, type ShelfDay } from '../src/ui/ink';
import { mergeSettings, settingsOf } from '../src/core/settings';
import { freshStore } from './helpers.js';
import { Progress } from '../src/core/progress.js';

const day = (i: number, words: number, extra: Partial<ShelfDay> = {}): ShelfDay => ({ day: `2026-11-${String(i + 1).padStart(2, '0')}`, words, met: words >= 1667, rest: false, today: false, future: false, ...extra });

describe('the bookcase drawing', () => {
  it('a book for each day written, as thick as its words; a chair for a rest day; nothing for a day missed', () => {
    const days = [day(0, 3200), day(1, 800), day(2, 0), day(3, 0, { rest: true }), day(4, 1667), day(5, 0, { future: true })];
    const { items } = layoutShelf(days, 600, 'x');
    expect(items.map((i) => i.kind)).toEqual(['book', 'book', 'chair', 'book']);
    const [big, small] = items as any[];
    expect(big.w).toBeGreaterThan(small.w);
    expect(big.ink).toBe(true); expect(small.ink).toBe(false);
  });
  it('a long push still fits its shelf, and the same push always draws the same', () => {
    const days = Array.from({ length: 90 }, (_, i) => day(i % 28, 3000));
    const { end } = layoutShelf(days, 560, 'y');
    expect(end).toBeLessThanOrEqual(1100); // narrowest books for a very long push
    expect(layoutShelf(days.slice(0, 30), 560, 'y').end).toBeLessThanOrEqual(560);
    expect(layoutShelf(days, 560, 'y')).toEqual(layoutShelf(days, 560, 'y'));
  });
  it('pages are words at the words-per-page she set', () => {
    expect(pagesOf(19600)).toBe(78);
    expect(pagesOf(19600, 300)).toBe(65);
  });
});

describe('past pushes are kept as shelves', () => {
  let env: ReturnType<typeof freshStore>;
  afterEach(() => env?.cleanup());
  it('a push replaced by a new one is kept, once; the bookcase lists every push begun, newest first', () => {
    const a = { name: 'Summer push', start: '2026-07-01', end: '2026-07-21', words: 21000 };
    const b = { name: 'Fall Draft', start: '2026-11-01', end: '2026-11-30', words: 50000 };
    let s = mergeSettings({}, { push: a });
    s = mergeSettings({ settings: s }, { push: b });
    s = mergeSettings({ settings: s }, { push: b });
    expect(s.pastPushes).toEqual([a]);
    expect(settingsOf({ settings: s }).pastPushes).toEqual([a]);
    env = freshStore();
    const p = env.brain.createProject('Shelf Book');
    env.brain.updateSettings(p.id as string, { push: a });
    env.brain.updateSettings(p.id as string, { push: b, dayGoals: { '2026-11-07': 0 } });
    const shelves = new Progress(env.store, env.ms).shelves(p.id as string, { tz: 'UTC', now: new Date('2026-11-12T18:00:00Z') });
    expect(shelves.map((x) => x.name)).toEqual(['Fall Draft', 'Summer push']);
    expect(shelves[0]).toMatchObject({ current: true, done: false, dayNo: 12, daysTotal: 30 });
    expect(shelves[1]).toMatchObject({ current: false, done: true });
    expect(shelves[0]!.days.find((d) => d.day === '2026-11-07')).toMatchObject({ rest: true });
  });
});
