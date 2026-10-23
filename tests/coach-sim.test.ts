import { it, expect, afterEach } from 'vitest';
import { freshStore } from './helpers.js';
import { Progress } from '../src/core/progress.js';
import { Structure } from '../src/core/structure.js';
import { Coach } from '../src/core/coach.js';

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());

it('a hundred-day push with the real library: no note or line repeats, and every phase is reached', () => {
  env = freshStore();
  const pid = env.brain.createProject('Long Book').id as string;
  const coach = new Coach(env.store, env.brain, new Structure(env.store, env.brain, env.ms), new Progress(env.store, env.ms));
  env.brain.updateSettings(pid, { push: { name: 'The long push', start: '2027-01-01', end: '2027-04-10', words: 100000 } });
  const notes: string[] = [], spots: string[] = [], kinds = new Set<string>();
  const ch = env.ms.addChapter(pid); const s = env.ms.addScene(ch.id);
  const w = (n: number) => Array.from({ length: n }, (_, i) => `w${i}`).join(' ');
  for (let i = 0; i < 100; i++) {
    const d = new Date(Date.UTC(2027, 0, 1 + i, 18));
    const c = coach.today(pid, { tz: 'UTC', now: d }) as any;
    // She writes most days, at about the pace, and skips one day in nine.
    if (i % 9 !== 4) {
      const sc = env.ms.scene(s.id);
      env.ms.saveScene(s.id, { doc: env.doc(w(Math.round((i + 1) * 1000))), expectVersion: sc.prose_version as number });
      const last = env.store.db.prepare('SELECT id FROM scene_revisions WHERE scene_id=? ORDER BY rowid DESC LIMIT 1').get(s.id) as { id: string };
      env.store.db.prepare('UPDATE scene_revisions SET created_at=? WHERE id=?').run(new Date(Date.UTC(2027, 0, 1 + i, 20)).toISOString(), last.id);
    }
    notes.push(c.note.id); spots.push(c.spotlight.id); kinds.add(c.kind);
  }
  // Even with the comebacks after skipped days, nothing repeats in a hundred days.
  expect(new Set(notes).size).toBe(100);

  expect(new Set(spots).size).toBe(100);
  for (const k of ['start', 'early', 'slump', 'middle', 'pressure', 'dark', 'home', 'almost', 'last']) expect(kinds.has(k), k).toBe(true);
});
