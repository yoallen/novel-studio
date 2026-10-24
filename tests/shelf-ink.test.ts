import { describe, it, expect, afterEach } from 'vitest';
import { layoutShelf, pagesOf, type ShelfDay } from '../src/ui/penGeometry';
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
    expect(s.pastPushes).toHaveLength(1);
    expect(s.pastPushes[0]).toMatchObject(a);
    expect(settingsOf({ settings: s }).pastPushes[0]).toMatchObject(a);
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

import { pushSaid, layoutPushBooks, type PushShelf } from '../src/ui/penGeometry';
describe('what a push came to, in plain words', () => {
  const p = (x: Partial<PushShelf>): PushShelf => ({ name: 'Nothing Push', start: '2026-10-23', end: '2026-10-23', goal: 30, total: 17, done: true, current: false, dayNo: 1, daysTotal: 1, ...x });
  it('a finished push says what it wrote and whether it reached its goal, never "57,309 of 30"', () => {
    expect(pushSaid(p({}))).toBe('17 of 30 words.');
    expect(pushSaid(p({ total: 30 }))).toBe('30 words. Goal met.');
    expect(pushSaid(p({ total: 52 }))).toBe('52 words. Goal of 30 met, 22 extra.');
    expect(pushSaid(p({ goal: null, total: 1 }))).toBe('1 word.');
  });
  it('a running push adds the day it is on', () => {
    expect(pushSaid(p({ done: false, current: true, goal: 5000, total: 1240, dayNo: 6, daysTotal: 14 }))).toBe('1,240 of 5,000 words, day 6 of 14');
    expect(pushSaid(p({ done: false, current: true, goal: 30, total: 45, dayNo: 1, daysTotal: 2 }))).toBe('45 words, goal of 30 met, day 1 of 2');
  });
  it('a push replaced before its end counts as finished', () => {
    expect(pushSaid(p({ done: false, current: false }))).toBe('17 of 30 words.');
  });
  it('finished pushes are books as thick as their words, sharing shelves until one is full', () => {
    const pushes = [p({ total: 17 }), p({ name: 'November 2025', start: '2025-11-01', total: 51200, goal: 50000 }), p({ name: 'Spring Revision Sprint', start: '2026-03-01', total: 8300, goal: 10000 })];
    const { books, rows } = layoutPushBooks(pushes, 600);
    expect(rows).toBe(1);
    expect(books[1]!.w).toBeGreaterThan(books[2]!.w);
    expect(books[2]!.w).toBeGreaterThan(books[0]!.w);
    expect(books.map((b) => b.ink)).toEqual([false, true, false]);
    const many = Array.from({ length: 30 }, (_, i) => p({ name: `Push ${i}`, start: `2026-01-${String(i + 1).padStart(2, '0')}`, total: 40000 }));
    const laid = layoutPushBooks(many, 600);
    expect(laid.rows).toBeGreaterThan(1);
    for (const b of laid.books) expect(b.x + b.w).toBeLessThanOrEqual(600);
  });
});
