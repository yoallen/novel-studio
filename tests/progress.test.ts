import { describe, it, expect, afterEach } from 'vitest';
import { freshStore } from './helpers.js';
import { Progress, dayIn } from '../src/core/progress.js';
import { dailyGoalOn, pushPace } from '../src/core/goals.js';

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());

const words = (n: number) => Array.from({ length: n }, (_, i) => `w${i}`).join(' ');

function setup() {
  env = freshStore();
  const p = env.brain.createProject('November Book');
  const ch = env.ms.addChapter(p.id);
  const progress = new Progress(env.store, env.ms);
  /** Type a scene up to `total` words, as if saved at `at`. */
  const type = (sceneId: string, total: number, at: string, reason?: string) => {
    const s = env.ms.scene(sceneId);
    env.ms.saveScene(sceneId, { doc: env.doc(words(total)), expectVersion: s.prose_version as number, reason });
    const last = env.store.db.prepare('SELECT id FROM scene_revisions WHERE scene_id=? ORDER BY rowid DESC LIMIT 1').get(sceneId) as { id: string };
    env.store.db.prepare('UPDATE scene_revisions SET created_at=? WHERE id=?').run(at, last.id);
  };
  return { p, ch, progress, type };
}

describe('drafting progress', () => {
  it('counts what typing added and cut each day, in her own time zone', () => {
    const { p, ch, progress, type } = setup();
    const s = env.ms.addScene(ch.id);
    type(s.id, 500, '2026-11-01T14:00:00.000Z');
    type(s.id, 1700, '2026-11-01T22:00:00.000Z');
    // 11:30 pm in New York on Nov 1 is already Nov 2 in UTC: it still belongs to Nov 1.
    type(s.id, 1800, '2026-11-02T03:30:00.000Z');
    type(s.id, 1600, '2026-11-02T15:00:00.000Z'); // cut 200 words
    const d = progress.dailyWords(p.id, 'America/New_York');
    expect(d.get('2026-11-01')).toBe(1800);
    expect(d.get('2026-11-02')).toBe(-200);
  });

  it('a manuscript brought in, an editor’s changes, and a restored version are not writing', () => {
    const { p, ch, progress, type } = setup();
    const s = env.ms.addScene(ch.id, { text: words(3000) }); // brought in whole
    env.store.db.prepare('UPDATE scene_revisions SET created_at=? WHERE scene_id=?').run('2026-11-03T12:00:00.000Z', s.id);
    type(s.id, 3100, '2026-11-03T13:00:00.000Z');
    type(s.id, 2500, '2026-11-03T14:00:00.000Z', "Editor's changes from \"draft.docx\"");
    type(s.id, 2600, '2026-11-03T15:00:00.000Z');
    expect(progress.dailyWords(p.id, 'UTC').get('2026-11-03')).toBe(200);
  });

  it('November: daily bars, the running total, what is left per day, and the streak', () => {
    const { p, ch, progress, type } = setup();
    env.brain.updateSettings(p.id, { goal: { type: 'words', target: 1667, note: '' }, push: { name: 'November', start: '2026-11-01', end: '2026-11-30', words: 50000 } });
    const s = env.ms.addScene(ch.id);
    type(s.id, 2000, '2026-11-01T15:00:00.000Z');
    type(s.id, 3000, '2026-11-02T15:00:00.000Z');
    type(s.id, 4700, '2026-11-03T15:00:00.000Z');
    const r = progress.progress(p.id, { tz: 'America/New_York', now: new Date('2026-11-04T14:00:00.000Z') });
    expect(r.push?.name).toBe('November');
    expect(r.days).toHaveLength(30);
    expect(r.days.slice(0, 4).map((d) => d.words)).toEqual([2000, 1000, 1700, 0]);
    expect(r.days[3]!.today).toBe(true);
    expect(r.days[4]!.future).toBe(true);
    expect(r.total).toBe(4700);
    expect(r.daysLeft).toBe(27);
    expect(r.perDayNeeded).toBe(Math.ceil((50000 - 4700) / 27));
    expect(r.streak).toBe(3); // today has no words yet, and that does not break it
    // Today's goal is an even share of what is left: 45,300 words over 27 days.
    expect(r.dailyGoal).toBe(Math.ceil(45300 / 27));
    // Planned by the end of yesterday: 3 x 1,667 = 5,001. She wrote 4,700, so 301 behind.
    expect(r.behind).toBe(301);
  });

  it('before the push starts it shows what is ahead; without a push it shows this month', () => {
    const { p, progress } = setup();
    env.brain.updateSettings(p.id, { push: { name: 'November', start: '2026-11-01', end: '2026-11-30', words: 50000 } });
    const ahead = progress.progress(p.id, { tz: 'UTC', now: new Date('2026-10-20T12:00:00.000Z') });
    expect(ahead.status).toBe('ahead');
    expect(ahead.daysLeft).toBe(30);
    expect(ahead.perDayNeeded).toBe(1667);
    const later = progress.progress(p.id, { tz: 'UTC', now: new Date('2026-12-15T12:00:00.000Z') });
    expect(later.push).toBeNull();
    expect(later.start).toBe('2026-12-01');
    expect(later.end).toBe('2026-12-31');
    const feb = progress.progress(p.id, { tz: 'UTC', now: new Date('2028-02-10T12:00:00.000Z') });
    expect(feb.days).toHaveLength(29);
  });

  it('a push needs real days in order', () => {
    const { p } = setup();
    expect(() => env.brain.updateSettings(p.id, { push: { name: 'x', start: '2026-11-30', end: '2026-11-01', words: 1 } })).toThrow(/comes before/);
    expect(() => env.brain.updateSettings(p.id, { push: { name: 'x', start: 'Nov 1', end: '2026-11-30', words: 1 } })).toThrow(/first and a last day/);
    expect(env.brain.updateSettings(p.id, { push: null }).push).toBeNull();
  });

  it('a time zone it does not know falls back to the computer’s own', () => {
    expect(dayIn('Not/AZone', new Date('2026-11-01T12:00:00Z'))).toMatch(/^2026-11-0[12]$/);
  });

  it('the push sets its own pace on its own days; before it, there is no goal unless she keeps an everyday one', () => {
    const { p, progress } = setup();
    const push = { name: 'November', start: '2026-11-01', end: '2026-11-30', words: 50000 };
    env.brain.updateSettings(p.id, { push });
    expect(pushPace(push)).toBe(1667);
    const oct16 = progress.progress(p.id, { tz: 'UTC', now: new Date('2026-10-16T12:00:00.000Z') });
    expect(oct16.push).toBeNull(); // more than two weeks out: this month, and no goal yet
    expect(oct16.dailyGoal).toBeNull();
    // Four days in with nothing written, today carries an even share of all 50,000 over the 26 days left.
    expect(progress.progress(p.id, { tz: 'UTC', now: new Date('2026-11-05T12:00:00.000Z') }).dailyGoal).toBe(Math.ceil(50000 / 26));
    expect(progress.progress(p.id, { tz: 'UTC', now: new Date('2026-11-01T12:00:00.000Z') }).dailyGoal).toBe(1667);
    const st = { goal: { type: 'words' as const, target: 500, note: '' }, push };
    expect(dailyGoalOn(st, '2026-10-16')).toBe(500);
    expect(dailyGoalOn(st, '2026-11-01')).toBe(1667);
    expect(dailyGoalOn(st, '2026-12-01')).toBe(500);
    expect(dailyGoalOn({ goal: { type: 'none', target: null, note: '' }, push }, '2026-10-16')).toBeNull();
  });

  it('a lighter day she sets keeps her number, and the difference spreads over the days she did not set', () => {
    const { p, ch, progress, type } = setup();
    env.brain.updateSettings(p.id, { push: { name: 'November', start: '2026-11-01', end: '2026-11-30', words: 50000 } });
    env.brain.updateSettings(p.id, { dayGoals: { '2026-11-02': 500, '2026-11-08': 0 } });
    const s = env.ms.addScene(ch.id);
    type(s.id, 1700, '2026-11-01T15:00:00.000Z');
    type(s.id, 2200, '2026-11-02T15:00:00.000Z'); // the lighter day: 500, met
    const r = progress.progress(p.id, { tz: 'UTC', now: new Date('2026-11-03T12:00:00.000Z') });
    const day = (d: string) => r.days.find((x) => x.day === d)!;
    expect(day('2026-11-02').goal).toBe(500);
    expect(day('2026-11-02').set).toBe(true);
    expect(day('2026-11-08').goal).toBe(0);
    // 47,800 left over the 28 days from today; the rest day reserves nothing, so the other 27 share it.
    expect(r.dailyGoal).toBe(Math.ceil(47800 / 27));
    expect(r.perDayNeeded).toBe(r.dailyGoal);
    expect(day('2026-11-20').goal).toBe(r.dailyGoal);
    expect(r.setDays).toEqual([{ day: '2026-11-08', words: 0 }]);
    // Today's own goal does not move while she writes today.
    type(s.id, 3000, '2026-11-03T13:00:00.000Z');
    expect(progress.progress(p.id, { tz: 'UTC', now: new Date('2026-11-03T14:00:00.000Z') }).dailyGoal).toBe(r.dailyGoal);
  });

  it('setting today lighter takes effect at once, and a rest day never breaks the run', () => {
    const { p, ch, progress, type } = setup();
    env.brain.updateSettings(p.id, { push: { name: 'November', start: '2026-11-01', end: '2026-11-30', words: 50000 } });
    const s = env.ms.addScene(ch.id);
    type(s.id, 1700, '2026-11-01T15:00:00.000Z');
    type(s.id, 3400, '2026-11-02T15:00:00.000Z');
    env.brain.updateSettings(p.id, { dayGoals: { '2026-11-03': 0, '2026-11-04': 500 } });
    type(s.id, 3900, '2026-11-04T15:00:00.000Z');
    const r = progress.progress(p.id, { tz: 'UTC', now: new Date('2026-11-04T18:00:00.000Z') });
    expect(r.dailyGoal).toBe(500);
    expect(r.todaySet).toBe(true);
    expect(r.streak).toBe(3); // Nov 1, 2 and 4; the rest day on the 3rd is skipped over, not a break
    // Without the rest day set, the empty 3rd ends the run.
    env.brain.updateSettings(p.id, { dayGoals: { '2026-11-04': 500 } });
    expect(progress.progress(p.id, { tz: 'UTC', now: new Date('2026-11-04T18:00:00.000Z') }).streak).toBe(1);
  });

  it('says plainly when the set days leave words with nowhere to go', () => {
    const { p, progress } = setup();
    env.brain.updateSettings(p.id, { push: { name: 'Short', start: '2026-11-01', end: '2026-11-02', words: 3000 } });
    env.brain.updateSettings(p.id, { dayGoals: { '2026-11-01': 500, '2026-11-02': 500 } });
    const r = progress.progress(p.id, { tz: 'UTC', now: new Date('2026-11-01T12:00:00.000Z') });
    expect(r.perDayNeeded).toBeNull();
    expect(r.shortfall).toBe(2000);
    expect(() => env.brain.updateSettings(p.id, { dayGoals: { 'Nov 3': 5 } })).toThrow(/needs a date/);
    expect(() => env.brain.updateSettings(p.id, { dayGoals: { '2026-11-03': -5 } })).toThrow(/between 0/);
  });

  it('days set ahead of time never change how far ahead or behind she was', () => {
    const { p, ch, progress, type } = setup();
    env.brain.updateSettings(p.id, { push: { name: 'November', start: '2026-11-01', end: '2026-11-30', words: 50000 } });
    const s = env.ms.addScene(ch.id);
    for (let i = 1; i <= 9; i++) type(s.id, 1667 * i, `2026-11-0${i}T15:00:00.000Z`);
    const now = { tz: 'UTC', now: new Date('2026-11-10T12:00:00.000Z') };
    expect(progress.progress(p.id, now).behind).toBe(0);
    env.brain.updateSettings(p.id, { dayGoals: { '2026-11-20': 0, '2026-11-21': 0, '2026-11-22': 0, '2026-11-28': 10000 } });
    expect(progress.progress(p.id, now).behind).toBe(0);
    // A lighter day already gone counts as her number, so it is never held against her.
    env.brain.updateSettings(p.id, { dayGoals: { '2026-11-09': 500 } });
    expect(progress.progress(p.id, now).behind).toBe(-1167);
  });

  it('when set days cover everything left, there is nothing owed, not a shortfall', () => {
    const { p, ch, progress, type } = setup();
    env.brain.updateSettings(p.id, { push: { name: 'Short', start: '2026-11-01', end: '2026-11-03', words: 3000 } });
    const s = env.ms.addScene(ch.id);
    type(s.id, 2000, '2026-11-02T15:00:00.000Z');
    env.brain.updateSettings(p.id, { dayGoals: { '2026-11-03': 1000 } });
    const r = progress.progress(p.id, { tz: 'UTC', now: new Date('2026-11-03T12:00:00.000Z') });
    expect(r.dailyGoal).toBe(1000);
    expect(r.shortfall).toBe(0);
    expect(r.perDayNeeded).toBe(0);
  });
});
