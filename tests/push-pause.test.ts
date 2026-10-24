import { describe, it, expect, afterEach } from 'vitest';
import { mergeSettings, settingsOf, pausePush, resumePush, endPushEarly, pushRunning, type ProjectSettings } from '../src/core/settings';
import { freshStore } from './helpers.js';
import { Progress } from '../src/core/progress.js';
import { pushSaid, layoutShelf } from '../src/ui/penGeometry';

const day = (o: number) => { const d = new Date(); d.setDate(d.getDate() + o); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const T = day(0);

describe('a push that is running is changed, paused or ended, never replaced', () => {
  it('editing keeps it one push; a new push cannot start on top of it', () => {
    let s = mergeSettings({}, { push: { name: 'Third Push', start: day(-5), end: day(8), words: 5000 } });
    const id = s.push!.id!;
    s = mergeSettings({ settings: s }, { push: { id, name: 'Third Push, fixed', start: day(-5), end: day(10), words: 5000 } });
    expect(s.push).toMatchObject({ id, name: 'Third Push, fixed', end: day(10) });
    expect(s.pastPushes).toHaveLength(0);
    expect(() => mergeSettings({ settings: s }, { push: { name: 'Another', start: T, end: day(3), words: 100 } })).toThrow(/still running/);
    expect(() => mergeSettings({ settings: s }, { push: null })).toThrow(/still running/);
  });
  it('a push that has ended makes way for a new one, which counts from the moment it starts', () => {
    let s = mergeSettings({}, { push: { name: 'Done one', start: day(-9), end: day(-1), words: 300 } });
    s = mergeSettings({ settings: s }, { push: { name: 'New one', start: T, end: day(9), words: 900 } });
    expect(s.pastPushes.map((x) => x.name)).toEqual(['Done one']);
    expect(s.push!.startedAt).toBeTruthy();
  });
  it('the next push is planned for after this one, and takes over on its own first day', () => {
    let s = mergeSettings({}, { push: { name: 'October', start: day(-5), end: day(2), words: 5000 } });
    expect(() => mergeSettings({ settings: s }, { nextPush: { name: 'Too soon', start: day(1), end: day(20), words: 10 } })).toThrow(/after October ends/);
    s = mergeSettings({ settings: s }, { nextPush: { name: 'November', start: day(3), end: day(32), words: 50000, deadline: true } });
    expect(settingsOf({ settings: s }, day(2)).push!.name).toBe('October');
    const later = settingsOf({ settings: s }, day(3));
    expect(later.push!.name).toBe('November');
    expect(later.nextPush).toBeNull();
    expect(later.pastPushes.map((x) => x.name)).toEqual(['October']);
  });
});

describe('pausing', () => {
  const base = (): ProjectSettings => mergeSettings({}, { push: { name: 'Third Push', start: day(-5), end: day(8), words: 5000 } });
  it('moving the last day out keeps the full push; coming back early takes the unused days off', () => {
    const s = pausePush(base(), day(4), true);
    expect(s.push!.end).toBe(day(12));
    expect(s.push!.pauses).toEqual([{ from: T, back: day(4), extend: true, daysAdded: 4 }]);
    const r = resumePush(s, T);
    expect(r.push!.end).toBe(day(8));
    expect(r.push!.pauses).toEqual([]);
  });
  it('a real deadline keeps its last day when she says so; a pause needs a day to come back', () => {
    const s = pausePush(base(), day(4), false);
    expect(s.push!.end).toBe(day(8));
    expect(() => pausePush(base(), T, true)).toThrow(/tomorrow or later/);
    expect(() => pausePush(s, day(6), true)).toThrow(/already paused/);
  });
  it('ending early sends it to the finished shelf as it stands', () => {
    const s = endPushEarly(base(), T, '2026-01-01T00:00:00.000Z');
    expect(s.push).toBeNull();
    expect(s.pastPushes[0]).toMatchObject({ name: 'Third Push', end: T, endedEarly: { on: T, plannedEnd: day(8) } });
    expect(pushRunning(s.pastPushes[0]!, T)).toBe(false);
  });
});

describe('a paused push on the page and the shelf', () => {
  let env: ReturnType<typeof freshStore>;
  afterEach(() => env?.cleanup());
  it('paused days ask nothing, their share moves to the days after, and the shelf stacks them', () => {
    env = freshStore();
    const p = env.brain.createProject('Pause Book');
    env.brain.updateSettings(p.id as string, { push: { name: 'Third Push', start: day(-2), end: day(7), words: 1000 } });
    env.brain.pushAction(p.id as string, 'pause', { back: day(3), extend: true });
    const prog = new Progress(env.store, env.ms);
    const r = prog.progress(p.id as string);
    expect(r.paused).toEqual({ back: day(3) });
    expect(r.days.filter((d: any) => d.paused).map((d) => d.day)).toEqual([day(0), day(1), day(2)]);
    expect(r.days.find((d) => d.day === day(3))!.goal).toBeGreaterThan(100);
    const shelf = prog.shelves(p.id as string)[0]!;
    expect(pushSaid(shelf as any)).toMatch(/paused until/);
    const { items } = layoutShelf(shelf.days.map((d: any) => ({ ...d, future: d.day > day(2) ? d.future : false })), 600, 'x');
    expect(items.find((i) => i.kind === 'pause')).toMatchObject({ days: 3 });
  });
  it('an early end reads plainly on the shelf', () => {
    expect(pushSaid({ name: 'Third Push', start: day(-5), end: T, goal: 5000, total: 1240, done: true, current: false, dayNo: 6, daysTotal: 6, endedEarly: { on: T, plannedDays: 14 } })).toBe('Ended early, day 6 of 14: 1,240 of 5,000 words.');
  });
});
