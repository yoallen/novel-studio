import { describe, it, expect, afterEach } from 'vitest';
import { freshStore } from './helpers.js';
import { Progress, dayIn } from '../src/core/progress.js';

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
    expect(r.dailyGoal).toBe(1667);
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
});
