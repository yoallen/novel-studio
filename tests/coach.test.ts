import { describe, it, expect, afterEach } from 'vitest';
import { freshStore } from './helpers.js';
import { Progress } from '../src/core/progress.js';
import { Structure } from '../src/core/structure.js';
import { Coach, NOTES, SPOTLIGHTS, PHASES, EVENTS, phaseOf, type CoachNote, type Spotlight } from '../src/core/coach.js';

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());
const words = (n: number) => Array.from({ length: n }, (_, i) => `w${i}`).join(' ');

// A small library, so these tests are about how the coach chooses, not about the words.
const KINDS = [...PHASES, ...EVENTS];
const LIB = {
  notes: KINDS.flatMap((k) => [1, 2, 3].map((i) => ({ id: `${k}-${i}`, kind: k, title: `${k} ${i}`, body: `A note for ${k}.` }))) as CoachNote[],
  spotlights: (['writer', 'writing', 'fun'] as const).flatMap((k) => [1, 2, 3, 4].map((i) => ({ id: `${k}-${i}`, kind: k, text: `${k} fact ${i}` }))) as Spotlight[],
};

function setup(push = { name: 'November', start: '2026-11-01', end: '2026-11-30', words: 50000 }, lib = LIB) {
  env = freshStore();
  const p = env.brain.createProject('November Book');
  const ch = env.ms.addChapter(p.id);
  const progress = new Progress(env.store, env.ms);
  const st = new Structure(env.store, env.brain, env.ms);
  const coach = new Coach(env.store, env.brain, st, progress, lib);
  const type = (sceneId: string, total: number, at: string) => {
    const s = env.ms.scene(sceneId);
    env.ms.saveScene(sceneId, { doc: env.doc(words(total)), expectVersion: s.prose_version as number });
    const last = env.store.db.prepare('SELECT id FROM scene_revisions WHERE scene_id=? ORDER BY rowid DESC LIMIT 1').get(sceneId) as { id: string };
    env.store.db.prepare('UPDATE scene_revisions SET created_at=? WHERE id=?').run(at, last.id);
  };
  env.brain.updateSettings(p.id as string, { push });
  return { p, ch, coach, st, type, pid: p.id as string };
}
const at = (d: string) => new Date(`${d}T18:00:00Z`);
const day = (start: string, n: number) => { const d = new Date(`${start}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

describe('the push coach', () => {
  it('moves through every phase for any push length, from a few days to a hundred and more', () => {
    for (const n of [3, 9, 10, 30, 60, 90, 100, 365]) {
      const seq = Array.from({ length: n }, (_, i) => phaseOf(i, n));
      expect(seq[0]).toBe('start');
      expect(seq[n - 1]).toBe('last');
      expect(seq[n - 2]).toBe(n >= 3 ? 'almost' : seq[n - 2]);
      const order = ['start', 'early', 'slump', 'middle', 'pressure', 'dark', 'home', 'almost', 'last'];
      const ranks = seq.map((s) => order.indexOf(s));
      expect(ranks.every((r, i) => i === 0 || r >= ranks[i - 1]!)).toBe(true);
      if (n >= 30) for (const k of order) expect(seq).toContain(k);
    }
  });

  it('never repeats a note until every note of its kind has been seen, across pushes and novels', () => {
    const { coach, pid } = setup({ name: 'Long push', start: '2026-01-01', end: '2026-12-31', words: null as never });
    const seen: string[] = [];
    for (let i = 1; i <= 120; i++) { const c = coach.today(pid, { tz: 'UTC', now: at(day('2026-01-01', i)) }) as any; seen.push(`${c.kind}:${c.note.id}`); }
    const byKind = new Map<string, string[]>();
    for (const s of seen) { const [k, id] = s.split(':'); byKind.set(k!, [...(byKind.get(k!) ?? []), id!]); }
    for (const ids of byKind.values()) for (let i = 0; i + 2 < ids.length; i += 3) expect(new Set(ids.slice(i, i + 3)).size).toBe(Math.min(3, ids.slice(i, i + 3).length));
    // A second novel's push starts with notes this computer has not shown yet.
    const p2 = env.brain.createProject('Second Book').id as string;
    env.brain.updateSettings(p2, { push: { name: 'Again', start: '2026-01-01', end: '2026-01-30', words: 50000 } });
    const first = (coach.today(p2, { tz: 'UTC', now: at('2026-01-01') }) as any).note.id;
    const startSeen = byKind.get('start') ?? [];
    if (startSeen.length < 3) expect(startSeen).not.toContain(first);
  });

  it('chooses once a day and keeps it, so the page says the same thing all day', () => {
    const { coach, pid } = setup();
    const a = coach.today(pid, { tz: 'UTC', now: at('2026-11-05') }) as any;
    const b = coach.today(pid, { tz: 'UTC', now: new Date('2026-11-05T23:00:00Z') }) as any;
    expect(b.note.id).toBe(a.note.id);
    expect(b.spotlight?.id).toBe(a.spotlight?.id);
  });

  it('what happened takes the day: a comeback, a big day, a rest day she set', () => {
    const { coach, ch, type, pid } = setup();
    const s = env.ms.addScene(ch.id);
    type(s.id, 1000, '2026-11-01T15:00:00.000Z');
    type(s.id, 1500, '2026-11-02T15:00:00.000Z');
    expect((coach.today(pid, { tz: 'UTC', now: at('2026-11-04') }) as any).kind).toBe('comeback'); // nothing on Nov 3
    type(s.id, 5000, '2026-11-04T15:00:00.000Z');
    expect((coach.today(pid, { tz: 'UTC', now: at('2026-11-05') }) as any).kind).toBe('bigday');
    expect((coach.today(pid, { tz: 'UTC', now: at('2026-11-05') }) as any).spotlight.kind).toBe('fun');
    env.brain.updateSettings(pid, { dayGoals: { '2026-11-06': 0 } });
    expect((coach.today(pid, { tz: 'UTC', now: at('2026-11-06') }) as any).kind).toBe('restday');
    // The first day always gets its own note.
    expect((coach.today(pid, { tz: 'UTC', now: at('2026-11-01') }) as any).kind).toBe('start');
  });

  it('a line about a writer, about writing, or just for fun, every day, without repeats', () => {
    const { coach, pid } = setup();
    const lines = Array.from({ length: 9 }, (_, i) => (coach.today(pid, { tz: 'UTC', now: at(day('2026-11-01', i)) }) as any).spotlight);
    expect(lines.every(Boolean)).toBe(true);
    expect(new Set(lines.map((l) => l.kind))).toEqual(new Set(['writer', 'writing', 'fun']));
    expect(new Set(lines.map((l) => l.id)).size).toBe(9);
  });

  it('her own notes mix in on ordinary days, and travel with the novel', () => {
    const { coach, pid } = setup();
    expect(coach.setOwnNotes(pid, ['Finish the draft. Fix it later.', ' ', 'Finish the draft. Fix it later.'])).toEqual(['Finish the draft. Fix it later.']);
    expect(env.brain.settings(pid).coachOwn).toEqual(['Finish the draft. Fix it later.']);
    const kinds = Array.from({ length: 12 }, (_, i) => (coach.today(pid, { tz: 'UTC', now: at(day('2026-11-08', i)) }) as any).note);
    expect(kinds.some((n) => n.kind === 'own' && n.body === 'Finish the draft. Fix it later.')).toBe(true);
    // Far behind every day: the behind note takes only about one day in three.
    expect(kinds.filter((n) => n.kind === 'behind').length).toBeLessThanOrEqual(4);
    // On another computer, the novel brings them.
    env.store.db.prepare("DELETE FROM settings WHERE key='coach_own'").run();
    expect(coach.ownNotes(pid)).toEqual(['Finish the draft. Fix it later.']);
  });

  it('milestones, pace and the stuck helper still work, and it speaks only around a push', () => {
    const { coach, ch, type, pid, st } = setup();
    expect(coach.today(pid, { tz: 'UTC', now: at('2026-09-01') }).show).toBe(false);
    expect((coach.today(pid, { tz: 'UTC', now: at('2026-10-30') }) as any)).toMatchObject({ phase: 'before', kind: 'before', daysUntil: 2 });
    const s = env.ms.addScene(ch.id);
    type(s.id, 1500, '2026-11-01T15:00:00.000Z');
    type(s.id, 3000, '2026-11-02T15:00:00.000Z');
    type(s.id, 5200, '2026-11-03T15:00:00.000Z');
    const c = coach.today(pid, { tz: 'UTC', now: at('2026-11-03'), wpm: 20 }) as any;
    expect(c).toMatchObject({ phase: 'during', dayNo: 3 });
    expect(c.milestone).toMatchObject({ title: 'The first tenth', words: 5000, when: 'today' });
    expect(c.next).toMatchObject({ words: 12500, toGo: 7300 });
    expect(c.pace.text).toContain('behind an even pace');
    st.applySaveTheCat(pid);
    const beat = (k: string) => st.beats(pid).find((b) => b.attrs.template_key === k)!.element.id as string;
    st.addCard(pid, { title: 'The empty boat', beatId: beat('catalyst') });
    const stuck = coach.stuck(pid)!;
    expect(stuck.title).toBe('The empty boat');
    expect(stuck.question).toContain('stands in the way');
    expect((coach.today(pid, { tz: 'UTC', now: at('2026-11-07') }) as any).where).toMatchObject({ beat: 'Catalyst' });
    env.brain.updateSettings(pid, { coach: false });
    expect(coach.today(pid, { tz: 'UTC', now: at('2026-11-05') }).show).toBe(false);
    expect((coach.today(pid, { tz: 'UTC', now: at('2026-12-02') }) as any).show).toBe(false);
  });
});

describe('the coach library', () => {
  it('has notes for every phase and event, enough that a hundred-day push sees no repeats', () => {
    for (const k of KINDS) expect(NOTES.filter((n) => n.kind === k).length, k).toBeGreaterThanOrEqual(5);
    const daily = ['early', 'slump', 'middle', 'pressure', 'dark', 'home'].reduce((a, k) => a + NOTES.filter((n) => n.kind === k).length, 0);
    expect(daily).toBeGreaterThanOrEqual(96);
    expect(new Set(NOTES.map((n) => n.id)).size).toBe(NOTES.length);
  });

  it('every note reads true for any push length, plainly, and quotes nobody at length', () => {
    for (const n of NOTES) {
      const t = `${n.title} ${n.body}`;
      expect(t, n.id).not.toMatch(/—/);
      expect(t, n.id).not.toMatch(/\b(week|weeks|month|months|November)\b/i);
      expect(n.body.length, n.id).toBeLessThanOrEqual(400);
    }
  });

  it('every fact has a source, and none is long', () => {
    expect(SPOTLIGHTS.filter((s) => s.kind === 'writer').length).toBeGreaterThanOrEqual(30);
    expect(SPOTLIGHTS.filter((s) => s.kind === 'writing').length).toBeGreaterThanOrEqual(15);
    expect(SPOTLIGHTS.filter((s) => s.kind === 'fun').length).toBeGreaterThanOrEqual(25);
    for (const s of SPOTLIGHTS) {
      expect(s.source, s.id).toMatch(/^https?:\/\//);
      expect(s.text, s.id).not.toMatch(/—/);
      expect(s.text.length, s.id).toBeLessThanOrEqual(320);
    }
    expect(new Set(SPOTLIGHTS.map((s) => s.id)).size).toBe(SPOTLIGHTS.length);
  });
});
