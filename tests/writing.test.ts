import { describe, it, expect, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import { freshStore } from './helpers.js';
import { Store } from '../src/core/store.js';
import { Brain } from '../src/core/brain.js';
import { Manuscript } from '../src/core/manuscript.js';
import { MIGRATIONS } from '../src/core/schema.js';
import { statusLabel, ownedLabel } from '../src/core/labels.js';

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());

describe('upgrading existing data', () => {
  it('upgrades a version 1 library to the current schema with every scene, revision and link intact', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ns-up-'));
    const file = join(dir, 'old.sqlite3');
    try {
      // Build a genuine version 1 database by hand.
      const db = new Database(file);
      db.pragma('foreign_keys = ON');
      db.exec('CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
      db.exec(MIGRATIONS[0]!.sql);
      db.prepare("INSERT INTO meta VALUES('schema_version','1')").run();
      const t = '2026-10-14T13:34:00.000Z';
      db.prepare("INSERT INTO projects(id,title,created_at,updated_at) VALUES('p1','Old Novel',?,?)").run(t, t);
      db.prepare("INSERT INTO chapters(id,project_id,title,position,created_at,updated_at) VALUES('c1','p1','One',1,?,?)").run(t, t);
      db.prepare("INSERT INTO elements(id,project_id,kind,title,created_at,updated_at) VALUES('e1','p1','character','Kevin',?,?)").run(t, t);
      db.prepare("INSERT INTO scenes(id,project_id,chapter_id,title,position,text,word_count,status,pov_element_id,created_at,updated_at) VALUES('s1','p1','c1','Driveway',1,'hello there',2,'drafting','e1',?,?)").run(t, t);
      db.prepare("INSERT INTO scene_revisions(id,scene_id,version,doc_json,text,word_count,reason,created_at) VALUES('r1','s1',1,'{}','hello there',2,'save',?)").run(t);
      db.close();

      const store = new Store(file);
      expect(store.schemaVersion()).toBe(MIGRATIONS[MIGRATIONS.length - 1]!.version);
      const ms = new Manuscript(store);
      const s = ms.scene('s1');
      expect(s.text).toBe('hello there');
      expect(s.pov_element_id).toBe('e1');
      expect(s.confirmed).toBe(0);
      expect(ms.revisions('s1')).toHaveLength(1);
      expect((store.db.pragma('foreign_key_check') as unknown[]).length).toBe(0);
      expect(store.db.pragma('foreign_keys', { simple: true })).toBe(1);
      store.close();
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
});

describe('scene status ladder is the author\'s (R-B-026)', () => {
  it('uses the default ladder, accepts renamed and added steps, and refuses removing a step in use', () => {
    env = freshStore();
    const p = env.brain.createProject('Any Novel');
    const pid = p.id as string;
    const ch = env.ms.addChapter(pid);
    const s = env.ms.addScene(ch.id, { title: 'Opening' });
    expect(s.status).toBe('idea');
    expect(env.brain.settings(pid).sceneLadder.map((x) => x.label)).toContain('First Draft Complete');

    const ladder = env.brain.settings(pid).sceneLadder.map((x) => (x.key === 'revised' ? { ...x, label: 'Polished' } : x));
    ladder.splice(ladder.length - 1, 0, { key: 'beta_read', label: 'Beta-read', drafted: true });
    env.brain.updateSettings(pid, { sceneLadder: ladder });
    env.ms.updateSceneMeta(s.id as string, { status: 'beta_read' });
    expect(env.ms.scene(s.id as string).status).toBe('beta_read');
    expect(() => env.ms.updateSceneMeta(s.id as string, { status: 'nonsense' })).toThrow(/not on this novel/);

    expect(() => env.brain.updateSettings(pid, { sceneLadder: ladder.filter((x) => x.key !== 'beta_read') })).toThrow(/1 scene marked "Beta-read"/);
    // Settings survive reopening the library.
    env.store.close();
    env.store = new Store(env.store.path);
    expect(new Brain(env.store).settings(pid).sceneLadder.find((x) => x.key === 'revised')!.label).toBe('Polished');
  });

  it('first words move a not-started scene to the first drafting step of that novel\'s ladder', () => {
    env = freshStore();
    const pid = env.brain.createProject('Any Novel').id as string;
    env.brain.updateSettings(pid, { sceneLadder: [{ key: 'seed', label: 'Seed' }, { key: 'growing', label: 'Growing', drafted: true }, { key: 'done', label: 'Done', drafted: true }] });
    const ch = env.ms.addChapter(pid);
    const s = env.ms.addScene(ch.id);
    expect(s.status).toBe('seed');
    const saved = env.ms.saveScene(s.id as string, { doc: env.doc('First line.'), expectVersion: s.version as number });
    expect(saved.status).toBe('growing');
  });
});

describe('author-reserved work and confirmed drafts (R-B-012, R-B-037)', () => {
  it('marks a scene as hers and as drafted-and-confirmed, journaled and undoable', () => {
    env = freshStore();
    const pid = env.brain.createProject('Any Novel').id as string;
    const ch = env.ms.addChapter(pid);
    const s = env.ms.addScene(ch.id, { text: 'The Confession.' });
    env.ms.updateSceneMeta(s.id as string, { reserved: 'Mine to write', confirmed: true });
    const after = env.ms.scene(s.id as string);
    expect(after.reserved).toBe('Mine to write');
    expect(after.confirmed).toBe(1);
    const last = env.store.history(pid)[0]!;
    env.store.revert(last.id as string, 'author');
    expect(env.ms.scene(s.id as string).reserved).toBeNull();
  });
});

describe('labels', () => {
  it('shows the author\'s chosen words and personalizes the owned marker for any author', () => {
    expect(statusLabel('established')).toBe('Decided');
    expect(statusLabel('unanswered')).toBe('Still open');
    expect(statusLabel('illustrative')).toBe('One way it could be done');
    expect(statusLabel('proposed')).toBe("Here's a suggestion");
    expect(ownedLabel(undefined, 'Yolanda')).toBe("Yolanda, it's on you now");
    expect(ownedLabel(undefined, 'Sam')).toBe("Sam, it's on you now");
    expect(ownedLabel(undefined, '')).toBe("It's on you now");
  });
});
