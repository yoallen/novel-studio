import { describe, it, expect, afterEach } from 'vitest';
import { freshStore } from './helpers.js';
import { Progress } from '../src/core/progress.js';
import { Structure } from '../src/core/structure.js';
import { Coach, PUSH_NOTES, noteIndex, BEFORE_NOTES } from '../src/core/coach.js';

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());
const words = (n: number) => Array.from({ length: n }, (_, i) => `w${i}`).join(' ');

function setup() {
  env = freshStore();
  const p = env.brain.createProject('November Book');
  const ch = env.ms.addChapter(p.id);
  const progress = new Progress(env.store, env.ms);
  const st = new Structure(env.store, env.brain, env.ms);
  const coach = new Coach(env.store, env.brain, st, progress);
  const type = (sceneId: string, total: number, at: string) => {
    const s = env.ms.scene(sceneId);
    env.ms.saveScene(sceneId, { doc: env.doc(words(total)), expectVersion: s.prose_version as number });
    const last = env.store.db.prepare('SELECT id FROM scene_revisions WHERE scene_id=? ORDER BY rowid DESC LIMIT 1').get(sceneId) as { id: string };
    env.store.db.prepare('UPDATE scene_revisions SET created_at=? WHERE id=?').run(at, last.id);
  };
  env.brain.updateSettings(p.id as string, { push: { name: 'November', start: '2026-11-01', end: '2026-11-30', words: 50000 } });
  return { p, ch, coach, st, type, pid: p.id as string };
}
const at = (d: string) => new Date(`${d}T18:00:00Z`);

describe('the push coach', () => {
  it('maps any push length onto the thirty notes: first day first, last day last, in order', () => {
    expect(PUSH_NOTES).toHaveLength(30);
    expect(noteIndex(0, 30)).toBe(0);
    expect(noteIndex(29, 30)).toBe(29);
    expect(noteIndex(14, 30)).toBe(14);
    expect(noteIndex(0, 10)).toBe(0);
    expect(noteIndex(9, 10)).toBe(29);
    const sixty = Array.from({ length: 60 }, (_, i) => noteIndex(i, 60));
    expect(sixty.every((v, i) => i === 0 || v >= sixty[i - 1]!)).toBe(true);
    expect(noteIndex(0, 1)).toBe(29);
    // "Almost there" (tomorrow is the last day) is always the day before the last, whatever the length.
    for (const n of [3, 9, 10, 30, 31, 60]) { expect(noteIndex(n - 2, n)).toBe(28); expect(noteIndex(n - 3, n)).toBeLessThan(28); }
    // No note speaks of weeks or months, so any length reads true.
    for (const nt of PUSH_NOTES) expect(`${nt.title} ${nt.body}`).not.toMatch(/\b(week|month)\b/i);
  });

  it('speaks only around a push, and not at all once turned off', () => {
    const { coach, pid } = setup();
    expect(coach.today(pid, { tz: 'UTC', now: at('2026-09-01') }).show).toBe(false);
    const before = coach.today(pid, { tz: 'UTC', now: at('2026-10-31') }) as any;
    expect(before.phase).toBe('before');
    expect(before.daysUntil).toBe(1);
    expect(before.note.title).toBe(BEFORE_NOTES[2]!.note.title);
    expect((coach.today(pid, { tz: 'UTC', now: at('2026-10-20') }) as any).note.title).toBe(BEFORE_NOTES[0]!.note.title);
    env.brain.updateSettings(pid, { coach: false });
    expect(coach.today(pid, { tz: 'UTC', now: at('2026-11-05') }).show).toBe(false);
  });

  it('during the push: the day, its note, a milestone crossed today, the next one, and the pace in plain numbers', () => {
    const { coach, ch, type, pid } = setup();
    const s = env.ms.addScene(ch.id);
    type(s.id, 1500, '2026-11-01T15:00:00.000Z');
    type(s.id, 3000, '2026-11-02T15:00:00.000Z');
    type(s.id, 5200, '2026-11-03T15:00:00.000Z'); // crosses 5,000 (10%) on day 3
    const c = coach.today(pid, { tz: 'UTC', now: at('2026-11-03'), wpm: 20 }) as any;
    expect(c.phase).toBe('during');
    expect(c.dayNo).toBe(3);
    expect(c.note.title).toBe(PUSH_NOTES[2]!.title);
    expect(c.milestone).toMatchObject({ title: 'The first tenth', words: 5000, when: 'today' });
    expect(c.next).toMatchObject({ title: 'A quarter of the way', words: 12500, toGo: 7300 });
    expect(c.pace.kind).toBe('behind'); // 3,000 after two days against 3,334
    expect(c.pace.text).toContain('behind an even pace');
    expect(c.pace.text).not.toMatch(/—/);
    // The next day the milestone is still on the page, marked as yesterday.
    expect((coach.today(pid, { tz: 'UTC', now: at('2026-11-04') }) as any).milestone).toMatchObject({ when: 'yesterday' });
    expect((coach.today(pid, { tz: 'UTC', now: at('2026-11-06') }) as any).milestone).toBeNull();
  });

  it('when stuck: the next unwritten card in story order, with a question that fits what the card lacks', () => {
    const { coach, st, pid } = setup();
    st.applySaveTheCat(pid);
    const beat = (k: string) => st.beats(pid).find((b) => b.attrs.template_key === k)!.element.id as string;
    const late = st.addCard(pid, { title: 'The light goes dark', beatId: beat('all_is_lost') });
    const first = st.addCard(pid, { title: 'The empty boat', beatId: beat('catalyst') });
    let s = coach.stuck(pid)!;
    expect(s.title).toBe('The empty boat');
    expect(s.question).toContain('stands in the way');
    env.brain.addStatement({ elementId: first.id as string, field: 'conflict', value: 'Marisol against the harbor board', status: 'established', speaker: { kind: 'author' } });
    expect(coach.stuck(pid)!.question).toContain('What is at stake');
    env.brain.addStatement({ elementId: first.id as string, field: 'value_start', value: 'Safety +', status: 'established', speaker: { kind: 'author' } });
    env.brain.addStatement({ elementId: first.id as string, field: 'value_end', value: 'Safety -', status: 'established', speaker: { kind: 'author' } });
    s = coach.stuck(pid)!;
    expect(s.turn).toBe('Safety + to Safety -');
    expect(s.question).toContain('happens instead');
    expect(late.id).toBeTruthy();
  });

  it('after the push: a recap of what was written', () => {
    const { coach, ch, type, pid } = setup();
    const s = env.ms.addScene(ch.id);
    type(s.id, 2000, '2026-11-01T15:00:00.000Z');
    type(s.id, 6000, '2026-11-02T15:00:00.000Z');
    const c = coach.today(pid, { tz: 'UTC', now: at('2026-12-02') }) as any;
    expect(c.phase).toBe('after');
    expect(c.recap).toMatchObject({ total: 6000, goal: 50000, met: false, daysWritten: 2, daysTotal: 30, best: { day: '2026-11-02', words: 4000 } });
  });

  it('every note is plain: no em dashes, and none quotes at length', () => {
    for (const nt of PUSH_NOTES) { expect(nt.body).not.toMatch(/—/); expect(nt.title).not.toMatch(/—/); expect(nt.body.length).toBeLessThan(400); }
  });
});
