// Manuscript: chapters contain ordered scenes. Prose is stored as a ProseMirror document plus
// plain text. Every committed save makes a revision; keystroke drafts go to an autosave journal
// so a crash never loses more than a moment of typing.

import { settingsOf } from './settings.js';
import { withoutLater, laterIn } from './later.js';
import { Store, Row, IdRow, withFields, NotFoundError, ValidationError, ConflictError, nowIso, newId, latestRevisionId, restoreSceneRevision } from './store.js';

const EMPTY_DOC = '{"type":"doc","content":[]}';
/** Keys of the default ladder. Each novel can rename, add or remove steps in its settings. */
export const SCENE_STATUSES = ['idea', 'planned', 'ready', 'drafting', 'first_draft', 'revising', 'revised', 'final'] as const;

/** Count words the way writers expect: sequences of letters/digits, joined by apostrophes or hyphens. */
export function countWords(text: string): number {
  // Notes left for later, [[like this]], are not story words.
  const m = withoutLater(text).match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu);
  return m ? m.length : 0;
}

interface PMNode { type?: string; text?: string; content?: PMNode[]; attrs?: Record<string, unknown> }

/** Plain text from a ProseMirror document. Blocks are separated by blank lines. */
export function docToText(doc: PMNode): string {
  const blocks: string[] = [];
  const inline = (n: PMNode): string => {
    if (n.type === 'text') return n.text ?? '';
    if (n.type === 'hardBreak') return '\n';
    return (n.content ?? []).map(inline).join('');
  };
  const walk = (n: PMNode) => {
    if (!n) return;
    if (['paragraph', 'heading', 'codeBlock'].includes(n.type ?? '')) { blocks.push(inline(n)); return; }
    if (n.type === 'horizontalRule') { blocks.push('* * *'); return; }
    (n.content ?? []).forEach(walk);
  };
  walk(doc);
  return blocks.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** Build a ProseMirror document from plain text (blank line = new paragraph). */
export function textToDoc(text: string): PMNode {
  const paras = text.replace(/\r\n?/g, '\n').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return {
    type: 'doc',
    content: paras.map((p) => ({ type: 'paragraph', content: p.split('\n').flatMap((line, i) => (i ? [{ type: 'hardBreak' }, { type: 'text', text: line }] : line ? [{ type: 'text', text: line }] : [])) })),
  };
}

function validateDoc(doc: unknown): PMNode {
  if (!doc || typeof doc !== 'object' || (doc as PMNode).type !== 'doc') throw new ValidationError('Prose must be a document.');
  const s = JSON.stringify(doc);
  if (s.length > 20_000_000) throw new ValidationError('This scene is too large to save in one piece. Split it into two scenes.');
  return doc as PMNode;
}

export class Manuscript {
  constructor(private store: Store) {}

  private projectOf(table: 'chapters' | 'scenes', id: string): Row {
    const r = this.store.get(table, id);
    if (!r || r.deleted_at) throw new NotFoundError(table === 'chapters' ? 'chapter' : 'scene');
    return r;
  }

  /** Status keys allowed for this novel (its own ladder). */
  ladderKeys(projectId: string): string[] {
    const p = this.store.get('projects', projectId);
    const profile = p ? JSON.parse(p.profile_json as string) as Record<string, unknown> : {};
    return settingsOf(profile).sceneLadder.map((x) => x.key);
  }

  private checkStatus(projectId: string, status: string) {
    if (!this.ladderKeys(projectId).includes(status)) throw new ValidationError('That status is not on this novel\'s scene status list.');
  }

  private nextPosition(table: 'chapters' | 'scenes', where: string, arg: string): number {
    const r = this.store.db.prepare(`SELECT MAX(position) AS m FROM ${table} WHERE ${where}=? AND deleted_at IS NULL`).get(arg) as { m: number | null };
    return (r.m ?? 0) + 1;
  }

  // ---------- chapters ----------
  addChapter(projectId: string, title?: string, after?: string | null, actor = 'author') {
    const p = this.store.get('projects', projectId);
    if (!p || p.deleted_at) throw new NotFoundError('novel');
    const count = (this.store.db.prepare('SELECT COUNT(*) AS n FROM chapters WHERE project_id=? AND deleted_at IS NULL').get(projectId) as { n: number }).n;
    const t = (title ?? '').trim() || `Chapter ${count + 1}`;
    let position = this.nextPosition('chapters', 'project_id', projectId);
    if (after) {
      const a = this.projectOf('chapters', after);
      const next = this.store.db.prepare('SELECT MIN(position) AS m FROM chapters WHERE project_id=? AND position>? AND deleted_at IS NULL').get(projectId, a.position) as { m: number | null };
      position = next.m == null ? (a.position as number) + 1 : ((a.position as number) + next.m) / 2;
    }
    return this.store.batch({ projectId, actor, reason: `Add ${t}` }, (w) => w.insert('chapters', { project_id: projectId, title: t, position }));
  }

  renameChapter(id: string, title: string, expectVersion?: number, actor = 'author') {
    const c = this.projectOf('chapters', id);
    if (!title.trim()) throw new ValidationError('Chapter title cannot be empty.');
    return this.store.batch({ projectId: c.project_id as string, actor, reason: `Rename chapter to "${title.trim()}"` }, (w) => w.update('chapters', id, { title: title.trim() }, { expectVersion }));
  }

  deleteChapter(id: string, actor = 'author') {
    const c = this.projectOf('chapters', id);
    this.store.batch({ projectId: c.project_id as string, actor, reason: `Delete ${c.title}` }, (w) => {
      w.remove('chapters', id);
      const scenes = this.store.db.prepare('SELECT id FROM scenes WHERE chapter_id=? AND deleted_at IS NULL').all(id) as Row[];
      for (const s of scenes) w.remove('scenes', s.id as string);
    });
  }

  restoreChapter(id: string, actor = 'author') {
    const c = this.store.get('chapters', id);
    if (!c) throw new NotFoundError('chapter');
    // Restore the chapter and the scenes that were deleted with it.
    const batch = this.store.db.prepare(
      "SELECT batch_id FROM journal WHERE table_name='chapters' AND record_id=? AND op='delete' ORDER BY seq DESC LIMIT 1",
    ).get(id) as { batch_id: string } | undefined;
    this.store.batch({ projectId: c.project_id as string, actor, reason: `Restore ${c.title}` }, (w) => {
      w.restore('chapters', id);
      if (batch) {
        const scenes = this.store.db.prepare("SELECT record_id FROM journal WHERE batch_id=? AND table_name='scenes' AND op='delete'").all(batch.batch_id) as Row[];
        for (const s of scenes) w.restore('scenes', s.record_id as string);
      }
    });
  }

  /** A chapter can open a new part of the book (Part One: Winter). An empty title ends the part there. */
  setPart(id: string, title: string, actor = 'author') {
    const c = this.projectOf('chapters', id);
    const t = title.trim().slice(0, 200);
    return this.store.batch({ projectId: c.project_id as string, actor, reason: t ? `Begin part "${t}" at ${c.title as string}` : `Remove the part at ${c.title as string}` }, (w) => w.update('chapters', id, { part_title: t }));
  }

  /** Reorder chapters to exactly the given order. */
  reorderChapters(projectId: string, orderedIds: string[], actor = 'author') {
    const existing = (this.store.db.prepare('SELECT id FROM chapters WHERE project_id=? AND deleted_at IS NULL').all(projectId) as Row[]).map((r) => r.id as string);
    if (existing.length !== orderedIds.length || !existing.every((id) => orderedIds.includes(id))) throw new ValidationError('The new order must include every chapter exactly once.');
    this.store.batch({ projectId, actor, reason: 'Reorder chapters' }, (w) => orderedIds.forEach((id, i) => w.update('chapters', id, { position: i + 1 })));
  }

  // ---------- scenes ----------
  addScene(chapterId: string, input: { title?: string; text?: string; doc?: unknown; afterSceneId?: string | null; status?: string } = {}, actor = 'author') {
    const c = this.projectOf('chapters', chapterId);
    const count = (this.store.db.prepare('SELECT COUNT(*) AS n FROM scenes WHERE chapter_id=? AND deleted_at IS NULL').get(chapterId) as { n: number }).n;
    const title = (input.title ?? '').trim() || `Scene ${count + 1}`;
    const doc = input.doc ? validateDoc(input.doc) : input.text ? textToDoc(input.text) : JSON.parse(EMPTY_DOC);
    const text = docToText(doc);
    if (input.status) this.checkStatus(c.project_id as string, input.status);
    let position = this.nextPosition('scenes', 'chapter_id', chapterId);
    if (input.afterSceneId) {
      const a = this.projectOf('scenes', input.afterSceneId);
      if (a.chapter_id !== chapterId) throw new ValidationError('That scene is in a different chapter.');
      const next = this.store.db.prepare('SELECT MIN(position) AS m FROM scenes WHERE chapter_id=? AND position>? AND deleted_at IS NULL').get(chapterId, a.position) as { m: number | null };
      position = next.m == null ? (a.position as number) + 1 : ((a.position as number) + next.m) / 2;
    }
    return this.store.batch({ projectId: c.project_id as string, actor, reason: `Add scene "${title}"` }, (w) => {
      const s = w.insert('scenes', {
        project_id: c.project_id, chapter_id: chapterId, title, position, doc_json: JSON.stringify(doc), text,
        word_count: countWords(text), status: input.status ?? this.defaultStatus(c.project_id as string, !!text),
      });
      if (text) {
        const revId = newId();
        this.store.db.prepare('INSERT INTO scene_revisions(id,scene_id,version,doc_json,text,word_count,reason,created_at) VALUES (?,?,?,?,?,?,?,?)')
          .run(revId, s.id, 1, s.doc_json, text, s.word_count, 'create', nowIso());
        w.note('scenes', s.id, 'revision', null, revId);
      }
      return this.scene(s.id);
    });
  }

  private profileOf(projectId: string): Record<string, unknown> {
    const p = this.store.get('projects', projectId);
    return p ? JSON.parse(p.profile_json as string) as Record<string, unknown> : {};
  }

  private defaultStatus(projectId: string, hasText: boolean): string {
    const ladder = settingsOf(this.profileOf(projectId)).sceneLadder;
    if (hasText) return (ladder.find((x) => x.drafted) ?? ladder[0]!).key;
    return ladder[0]!.key;
  }

  scene(id: string) {
    const s = this.projectOf('scenes', id);
    return withFields(s, { doc: JSON.parse(s.doc_json as string) as unknown });
  }

  /**
   * Commit prose. expectVersion protects against two windows overwriting each other.
   * Creates a revision and clears the autosave journal for the scene.
   */
  saveScene(id: string, input: { doc: unknown; expectVersion: number; reason?: string }, actor = 'author') {
    const s = this.projectOf('scenes', id);
    if (typeof input.expectVersion !== 'number') throw new ValidationError('Missing version.');
    const doc = validateDoc(input.doc);
    const text = docToText(doc);
    const docJson = JSON.stringify(doc);
    if (s.prose_version !== input.expectVersion) {
      throw new ConflictError('This scene was changed in another window since you opened it. Both versions are kept; choose which to keep.', {
        current: { version: s.prose_version, text: s.text, doc: JSON.parse(s.doc_json as string) },
      });
    }
    if (docJson === s.doc_json || sameDoc(doc, JSON.parse(s.doc_json as string))) { this.clearAutosave(id); return this.scene(id); }
    return this.store.batch({ projectId: s.project_id as string, actor, reason: input.reason ?? `Write "${s.title}"` }, (w) => {
      const prevRev = latestRevisionId(this.store, id);
      // Make sure the pre-change prose exists as a revision before it is replaced.
      let beforeRev = prevRev;
      if (!prevRev && (s.text as string).length) {
        beforeRev = newId();
        this.store.db.prepare('INSERT INTO scene_revisions(id,scene_id,version,doc_json,text,word_count,reason,created_at) VALUES (?,?,?,?,?,?,?,?)')
          .run(beforeRev, id, s.prose_version, s.doc_json, s.text, s.word_count, 'baseline', nowIso());
      }
      const words = countWords(text);
      const patch: Row = { doc_json: docJson, text, word_count: words, prose_version: (s.prose_version as number) + 1 };
      // First words move a not-yet-started scene to the first drafting step, if the novel's ladder has one.
      const ladder = settingsOf(this.profileOf(s.project_id as string)).sceneLadder;
      const cur = ladder.find((x) => x.key === s.status);
      const firstDrafted = ladder.find((x) => x.drafted);
      if (words > 0 && firstDrafted && cur && !cur.drafted && ladder.indexOf(cur) < ladder.indexOf(firstDrafted)) patch.status = firstDrafted.key;
      w.update('scenes', id, patch);
      const updated = this.store.get('scenes', id)!;
      const revId = newId();
      this.store.db.prepare('INSERT INTO scene_revisions(id,scene_id,version,doc_json,text,word_count,reason,created_at) VALUES (?,?,?,?,?,?,?,?)')
        .run(revId, id, updated.prose_version, docJson, text, words, input.reason ?? 'save', nowIso());
      w.note('scenes', id, 'revision', beforeRev, revId);
      this.store.db.prepare('DELETE FROM autosave_journal WHERE scene_id=?').run(id);
      this.trackSessionScene(s.project_id as string, id);
      return this.scene(id);
    });
  }

  updateSceneMeta(id: string, patch: { title?: string; status?: string; povElementId?: string | null; planElementId?: string | null; confirmed?: boolean; reserved?: string | null; notes?: string }, expectVersion?: number, actor = 'author') {
    const s = this.projectOf('scenes', id);
    const row: Row = {};
    if (patch.title !== undefined) { if (!patch.title.trim()) throw new ValidationError('Scene title cannot be empty.'); row.title = patch.title.trim(); }
    if (patch.status !== undefined) { this.checkStatus(s.project_id as string, patch.status); row.status = patch.status; }
    if (patch.confirmed !== undefined) row.confirmed = patch.confirmed ? 1 : 0;
    if (patch.reserved !== undefined) row.reserved = patch.reserved && patch.reserved.trim() ? patch.reserved.trim().slice(0, 120) : null;
    if (patch.notes !== undefined) row.notes = patch.notes;
    for (const [k, col] of [['povElementId', 'pov_element_id'], ['planElementId', 'plan_element_id']] as const) {
      const v = patch[k];
      if (v !== undefined) {
        if (v) { const e = this.store.get('elements', v); if (!e || e.deleted_at || e.project_id !== s.project_id) throw new ValidationError('That story element is not in this novel.'); }
        row[col] = v;
      }
    }
    return this.store.batch({ projectId: s.project_id as string, actor, reason: `Edit scene "${s.title}"` }, (w) => w.update('scenes', id, row, { expectVersion }));
  }

  /** Move a scene to a chapter at a given index (0-based) without touching its prose. */
  moveScene(id: string, toChapterId: string, index: number, actor = 'author') {
    const s = this.projectOf('scenes', id);
    const c = this.projectOf('chapters', toChapterId);
    if (c.project_id !== s.project_id) throw new ValidationError('Cannot move a scene into another novel.');
    const siblings = (this.store.db.prepare('SELECT id FROM scenes WHERE chapter_id=? AND deleted_at IS NULL AND id<>? ORDER BY position').all(toChapterId, id) as Row[]).map((r) => r.id as string);
    const i = Math.max(0, Math.min(index, siblings.length));
    siblings.splice(i, 0, id);
    this.store.batch({ projectId: s.project_id as string, actor, reason: `Move scene "${s.title}"` }, (w) => {
      if (s.chapter_id !== toChapterId) w.update('scenes', id, { chapter_id: toChapterId });
      siblings.forEach((sid, n) => w.update('scenes', sid, { position: n + 1 }));
    });
  }

  deleteScene(id: string, actor = 'author') {
    const s = this.projectOf('scenes', id);
    this.store.batch({ projectId: s.project_id as string, actor, reason: `Delete scene "${s.title}"` }, (w) => w.remove('scenes', id));
  }

  restoreScene(id: string, actor = 'author') {
    const s = this.store.get('scenes', id);
    if (!s) throw new NotFoundError('scene');
    const c = this.store.get('chapters', s.chapter_id as string)!;
    this.store.batch({ projectId: s.project_id as string, actor, reason: `Restore scene "${s.title}"` }, (w) => {
      if (c.deleted_at) w.restore('chapters', c.id as string);
      w.restore('scenes', id);
    });
  }

  deletedChapters(projectId: string) {
    return this.store.db.prepare('SELECT id, title, deleted_at FROM chapters WHERE project_id=? AND deleted_at IS NOT NULL ORDER BY deleted_at DESC').all(projectId) as Row[];
  }

  deletedScenes(projectId: string) {
    return this.store.db.prepare(
      'SELECT s.id, s.title, s.word_count, s.deleted_at, c.title AS chapter_title FROM scenes s JOIN chapters c ON c.id=s.chapter_id WHERE s.project_id=? AND s.deleted_at IS NOT NULL ORDER BY s.deleted_at DESC',
    ).all(projectId) as Row[];
  }

  // ---------- revisions ----------
  revisions(sceneId: string) {
    this.store.get('scenes', sceneId) ?? (() => { throw new NotFoundError('scene'); })();
    return this.store.db.prepare('SELECT id, scene_id, version, word_count, reason, created_at, substr(text,1,160) AS preview FROM scene_revisions WHERE scene_id=? ORDER BY created_at DESC, id DESC').all(sceneId) as Row[];
  }

  revision(id: string) {
    const r = this.store.db.prepare('SELECT * FROM scene_revisions WHERE id=?').get(id) as Row | undefined;
    if (!r) throw new NotFoundError('revision');
    return withFields(r, { doc: JSON.parse(r.doc_json as string) as unknown });
  }

  /** Restore an earlier revision as a new revision. Newer revisions remain available. */
  restoreRevision(sceneId: string, revisionId: string, actor = 'author') {
    const s = this.projectOf('scenes', sceneId);
    const r = this.revision(revisionId);
    if (r.scene_id !== sceneId) throw new ValidationError('That revision belongs to another scene.');
    return this.store.batch({ projectId: s.project_id as string, actor, reason: `Restore earlier version of "${s.title}"` }, (w) => {
      restoreSceneRevision(this.store, w, sceneId, revisionId);
      return this.scene(sceneId);
    });
  }

  // ---------- autosave journal ----------
  autosave(sceneId: string, doc: unknown, baseVersion: number) {
    const s = this.projectOf('scenes', sceneId);
    const d = validateDoc(doc);
    // Nothing typed yet: no recovery copy is needed, and none is made.
    if (sameDoc(d, JSON.parse(s.doc_json as string))) { this.clearAutosave(sceneId); return { savedAt: nowIso(), sceneVersion: s.prose_version }; }
    this.store.db.prepare(
      'INSERT INTO autosave_journal(scene_id,base_version,doc_json,text,saved_at) VALUES (?,?,?,?,?) ON CONFLICT(scene_id) DO UPDATE SET base_version=excluded.base_version, doc_json=excluded.doc_json, text=excluded.text, saved_at=excluded.saved_at',
    ).run(sceneId, baseVersion, JSON.stringify(d), docToText(d), nowIso());
    return { savedAt: nowIso(), sceneVersion: s.prose_version };
  }

  clearAutosave(sceneId: string) {
    this.store.db.prepare('DELETE FROM autosave_journal WHERE scene_id=?').run(sceneId);
  }

  /** Drafts that were typed but never committed (e.g. after a crash or power loss). */
  pendingRecoveries(projectId: string) {
    return this.store.db.prepare(
      `SELECT a.scene_id, a.base_version, a.text, a.saved_at, s.title, s.prose_version AS scene_version, s.text AS saved_text
       FROM autosave_journal a JOIN scenes s ON s.id=a.scene_id WHERE s.project_id=? AND s.deleted_at IS NULL AND a.doc_json <> s.doc_json`,
    ).all(projectId) as Row[];
  }

  recoveryDoc(sceneId: string) {
    const r = this.store.db.prepare('SELECT * FROM autosave_journal WHERE scene_id=?').get(sceneId) as Row | undefined;
    if (!r) throw new NotFoundError('recovered draft');
    return withFields(r, { doc: JSON.parse(r.doc_json as string) as unknown });
  }

  // ---------- structure ----------
  outline(projectId: string) {
    const chapters = this.store.db.prepare('SELECT * FROM chapters WHERE project_id=? AND deleted_at IS NULL ORDER BY position').all(projectId) as Row[];
    const scenes = this.store.db.prepare(
      'SELECT id, chapter_id, title, position, word_count, status, pov_element_id, plan_element_id, version, updated_at FROM scenes WHERE project_id=? AND deleted_at IS NULL ORDER BY position',
    ).all(projectId) as Row[];
    let running = 0;
    return chapters.map((c, ci) => {
      const cs = scenes.filter((s) => s.chapter_id === c.id).map((s, si) => {
        const start = running; running += s.word_count as number;
        return withFields(s, { number: si + 1, words_before: start, word_count: s.word_count as number });
      });
      return withFields(c, { number: ci + 1, scenes: cs, word_count: cs.reduce((a, s) => a + s.word_count, 0) });
    });
  }

  /** Once, after notes for later arrived: recount any text that already held double brackets, so
   *  old saved versions and new ones count the same way and no day shows words cut that never were. */
  recountLater() {
    const done = this.store.db.prepare("SELECT 1 FROM settings WHERE key='recount_later_v1'").get();
    if (done) return 0;
    let n = 0;
    this.store.db.transaction(() => {
      for (const t of ['scenes', 'scene_revisions'] as const) {
        const rows = this.store.db.prepare(`SELECT rowid AS r, text, word_count FROM ${t} WHERE text LIKE '%[[%'`).all() as { r: number; text: string; word_count: number }[];
        const up = this.store.db.prepare(`UPDATE ${t} SET word_count=? WHERE rowid=?`);
        for (const row of rows) { const w = countWords(row.text); if (w !== row.word_count) { up.run(w, row.r); n++; } }
      }
      this.store.db.prepare("INSERT INTO settings(key,value_json) VALUES ('recount_later_v1','true') ON CONFLICT(key) DO NOTHING").run();
    })();
    return n;
  }

  /** Every note left in the page for later, [[like this]], in manuscript order. */
  laterNotes(projectId: string) {
    const out: { sceneId: string; sceneTitle: string; chapterTitle: string; chapterNumber: number; note: string; raw: string; nth: number; before: string }[] = [];
    const texts = new Map((this.store.db.prepare("SELECT id, text FROM scenes WHERE project_id=? AND deleted_at IS NULL AND text LIKE '%[[%'").all(projectId) as { id: string; text: string }[]).map((r) => [r.id, r.text]));
    if (!texts.size) return out;
    for (const c of this.outline(projectId)) {
      for (const s of c.scenes as Row[]) {
        const text = texts.get(s.id as string);
        if (!text) continue;
        const seen = new Map<string, number>();
        for (const n of laterIn(text)) {
          const nth = seen.get(n.raw) ?? 0; seen.set(n.raw, nth + 1);
          // A few words before the note, so the list shows where it sits.
          const lead = text.slice(Math.max(0, n.at - 80), n.at).replace(/\s+/g, ' ');
          out.push({ sceneId: s.id as string, sceneTitle: s.title as string, chapterTitle: c.title as string, chapterNumber: c.number as number, note: n.note, raw: n.raw, nth, before: lead.length >= 80 ? '…' + lead.trimStart().replace(/^\S*\s/, '') : lead });
        }
      }
    }
    return out;
  }

  totalWords(projectId: string): number {
    return (this.store.db.prepare('SELECT COALESCE(SUM(word_count),0) AS n FROM scenes WHERE project_id=? AND deleted_at IS NULL').get(projectId) as { n: number }).n;
  }

  // ---------- writing state, trail and sessions ----------
  setWritingState(projectId: string, state: { sceneId?: string | null; cursor?: unknown; view?: unknown }) {
    if (state.sceneId) { const s = this.projectOf('scenes', state.sceneId); if (s.project_id !== projectId) throw new ValidationError('Scene is in another novel.'); }
    const cur = this.store.db.prepare('SELECT * FROM writing_state WHERE project_id=?').get(projectId) as Row | undefined;
    this.store.db.prepare(
      'INSERT INTO writing_state(project_id,scene_id,cursor_json,view_json,updated_at) VALUES (?,?,?,?,?) ON CONFLICT(project_id) DO UPDATE SET scene_id=excluded.scene_id, cursor_json=excluded.cursor_json, view_json=excluded.view_json, updated_at=excluded.updated_at',
    ).run(projectId, state.sceneId === undefined ? (cur?.scene_id ?? null) : state.sceneId,
      state.cursor === undefined ? (cur?.cursor_json ?? '{}') : JSON.stringify(state.cursor),
      state.view === undefined ? (cur?.view_json ?? '{}') : JSON.stringify(state.view), nowIso());
  }

  writingState(projectId: string) {
    const r = this.store.db.prepare('SELECT * FROM writing_state WHERE project_id=?').get(projectId) as Row | undefined;
    if (!r) return null;
    const scene = r.scene_id ? this.store.get('scenes', r.scene_id as string) : null;
    return { sceneId: scene && !scene.deleted_at ? r.scene_id : null, sceneTitle: scene?.title ?? null, cursor: JSON.parse(r.cursor_json as string), view: JSON.parse(r.view_json as string), updatedAt: r.updated_at };
  }

  /** Record a detour: leaving the writing location for another place, and why. */
  leave(projectId: string, from: unknown, to: unknown, reason = '') {
    const id = newId();
    this.store.db.prepare('INSERT INTO trail(id,project_id,from_json,to_json,reason,created_at) VALUES (?,?,?,?,?,?)').run(id, projectId, JSON.stringify(from), JSON.stringify(to), reason, nowIso());
    return { id };
  }

  /** The most recent unreturned detour, which "Return to Writing" resolves. */
  openTrail(projectId: string) {
    return (this.store.db.prepare('SELECT * FROM trail WHERE project_id=? AND returned_at IS NULL ORDER BY created_at DESC, id DESC').all(projectId) as Row[])
      .map((r) => withFields(r, { from: JSON.parse(r.from_json as string) as unknown, to: JSON.parse(r.to_json as string) as unknown }));
  }

  returnFromTrail(projectId: string) {
    this.store.db.prepare('UPDATE trail SET returned_at=? WHERE project_id=? AND returned_at IS NULL').run(nowIso(), projectId);
  }

  /** Record whether the issue that prompted a detour was resolved, and what came of it. */
  resolveTrail(trailId: string, resolved: boolean, outcome = '') {
    const r = this.store.db.prepare('SELECT id FROM trail WHERE id=?').get(trailId);
    if (!r) throw new NotFoundError('trail entry');
    this.store.db.prepare('UPDATE trail SET resolved=?, outcome=? WHERE id=?').run(resolved ? 1 : 0, outcome.slice(0, 2000), trailId);
  }

  /** The whole Writing Trail, newest first: open detours and recent returns. */
  trail(projectId: string, limit = 50) {
    return (this.store.db.prepare('SELECT * FROM trail WHERE project_id=? ORDER BY created_at DESC, id DESC LIMIT ?').all(projectId, limit) as Row[])
      .map((r) => withFields(r, { from: JSON.parse(r.from_json as string) as unknown, to: JSON.parse(r.to_json as string) as unknown }));
  }

  startSession(projectId: string) {
    const open = this.store.db.prepare('SELECT * FROM writing_sessions WHERE project_id=? AND ended_at IS NULL').get(projectId) as Row | undefined;
    if (open) return open;
    const id = newId();
    this.store.db.prepare('INSERT INTO writing_sessions(id,project_id,started_at,start_words) VALUES (?,?,?,?)').run(id, projectId, nowIso(), this.totalWords(projectId));
    return this.store.db.prepare('SELECT * FROM writing_sessions WHERE id=?').get(id) as Row;
  }

  private trackSessionScene(projectId: string, sceneId: string) {
    const open = this.store.db.prepare('SELECT * FROM writing_sessions WHERE project_id=? AND ended_at IS NULL').get(projectId) as Row | undefined;
    if (!open) return;
    const list = JSON.parse(open.scenes_json as string) as string[];
    if (!list.includes(sceneId)) { list.push(sceneId); this.store.db.prepare('UPDATE writing_sessions SET scenes_json=? WHERE id=?').run(JSON.stringify(list), open.id); }
  }

  endSession(projectId: string, note = '') {
    const open = this.store.db.prepare('SELECT * FROM writing_sessions WHERE project_id=? AND ended_at IS NULL').get(projectId) as Row | undefined;
    if (!open) return null;
    // A sit-down with no words written, no scene touched and no note is not a writing session: let it go.
    if (!note.trim() && (open.scenes_json as string) === '[]' && this.totalWords(projectId) === open.start_words) {
      this.store.db.prepare('DELETE FROM writing_sessions WHERE id=?').run(open.id);
      return null;
    }
    this.store.db.prepare('UPDATE writing_sessions SET ended_at=?, end_words=?, note=? WHERE id=?').run(nowIso(), this.totalWords(projectId), note, open.id);
    return this.store.db.prepare('SELECT * FROM writing_sessions WHERE id=?').get(open.id) as Row;
  }

  sessions(projectId: string, limit = 50) {
    return (this.store.db.prepare('SELECT * FROM writing_sessions WHERE project_id=? ORDER BY started_at DESC LIMIT ?').all(projectId, limit) as Row[])
      .map((s) => withFields(s, { scenes: JSON.parse(s.scenes_json as string) as string[], net_words: s.end_words == null ? null : (s.end_words as number) - (s.start_words as number) }));
  }
}

/** Two documents that show the same page: equal once empty wrapping (an empty paragraph, empty
 *  content lists, attributes left unset) is set aside. Formatting and words still count. */
export function sameDoc(a: unknown, b: unknown): boolean {
  const norm = (n: unknown): unknown => {
    if (Array.isArray(n)) return n.map(norm).filter((x) => x !== undefined);
    if (!n || typeof n !== 'object') return n;
    const o = n as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(o)) {
      if (v == null) continue;
      if (k === 'attrs' && typeof v === 'object' && Object.values(v as object).every((x) => x == null)) continue;
      const nv = norm(v);
      if (Array.isArray(nv) && nv.length === 0) continue;
      out[k] = nv;
    }
    // A paragraph with nothing in it, standing alone in the document, is an empty page.
    if (out.type === 'doc' && Array.isArray(out.content) && out.content.length === 1 && (out.content[0] as Record<string, unknown>).type === 'paragraph' && !(out.content[0] as Record<string, unknown>).content) delete out.content;
    return out;
  };
  return JSON.stringify(norm(a)) === JSON.stringify(norm(b));
}
