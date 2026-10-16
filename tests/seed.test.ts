import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { readRegister, statusOf } from '../scripts/build-idw.js';
import { importArchive } from '../src/core/backup.js';
import { Brain } from '../src/core/brain.js';
import { freshStore } from './helpers.js';

describe('I Declare War, built from her planning', () => {
  it('reads every row of the story data register', () => {
    const tables = readRegister(readFileSync('docs/requirements/IDW-story-data.md', 'utf8'));
    expect(tables.reduce((a, t) => a + t.rows.length, 0)).toBe(459);
    expect(tables.every((t) => t.rows.every((r) => /^[A-Z]{2}-\d+[a-z]?$/.test(r.ID!)))).toBe(true);
  });

  it('a compound status takes its first word', () => {
    expect(statusOf('Established (the pairing); Proposed (as the book\'s genre label)')).toBe('established');
    expect(statusOf('Developing (her current working version; not locked)')).toBe('developing');
    expect(statusOf('Set aside')).toBe('set_aside');
    expect(statusOf('Unanswered; Illustrative (the tag)')).toBe('unanswered');
  });

  it('the shipped archive restores whole, and keeps her decisions apart from suggestions', () => {
    const env = freshStore();
    const archive = JSON.parse(readFileSync('seed/I Declare War.storycanon.json', 'utf8'));
    const r = importArchive(env.store, archive);
    expect(r.imported).toBe(true);
    const brain = new Brain(env.store);
    const kevin = brain.elements(r.projectId, { kind: 'character' }).find((e) => e.title === 'Kevin Wickley')!;
    const arc = env.store.db.prepare("SELECT id FROM elements WHERE parent_id=? AND kind='arc'").get(kevin.id) as { id: string };
    const lie = brain.field(arc.id, 'lie');
    expect(lie.current).toBeNull(); // nothing about his Lie is decided yet
    expect(lie.possibilities.map((p) => p.value)).toContain('"If I let my guard down, I could lose everything again."');
    expect(lie.setAside.some((s) => String(s.value).includes('catch me off guard'))).toBe(true);
    // Only she or her own documents establish; every suggestion is marked as ChatGPT's.
    const bad = env.store.db.prepare("SELECT COUNT(*) AS n FROM statements WHERE project_id=? AND speaker_kind='assistant' AND status NOT IN ('proposed','illustrative')").get(r.projectId) as { n: number };
    expect(bad.n).toBe(0);
    // Genres and story types stay unset: she never confirmed them.
    const setup = JSON.parse(env.store.get('projects', r.projectId)!.profile_json as string).setup;
    expect(setup.genres).toEqual([]);
    expect(setup.storyTypes).toEqual([]);
    env.cleanup();
  });
});
