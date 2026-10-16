// Many books at once, each at its own stage (R-B-088): the stage of a whole book, completed drafts kept whole
// so any scene can be compared across drafts, and one view across every book on her shelf.

import { Store, Row, ValidationError, NotFoundError, ConflictError, nowIso, newId } from './store.js';
import { Brain } from './brain.js';
import { Manuscript } from './manuscript.js';
import { WritingDesk } from './writing.js';
import { settingsOf } from './settings.js';

export const DEFAULT_STAGES = ['Idea', 'Plotting and planning', 'First draft', 'Second draft', 'Third draft', 'Revising', 'Editing', 'With beta readers', 'With an editor', 'Querying', 'On submission', 'Published', 'Resting'];
const ORDINAL = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'];
export const draftName = (n: number) => `${ORDINAL[n - 1] ?? `Draft ${n}:`} draft`.replace(': draft', '');

export class Books {
  constructor(private store: Store, private brain: Brain, private ms: Manuscript, private desk: WritingDesk) {}

  // ---------- stage of the whole book ----------
  stages(): string[] {
    const r = this.store.db.prepare("SELECT value_json FROM settings WHERE key='author_profile'").get() as Row | undefined;
    const custom = r ? ((JSON.parse(r.value_json as string) as Record<string, unknown>).stages as string[] | undefined) : undefined;
    return custom?.length ? custom : DEFAULT_STAGES;
  }

  setStage(projectId: string, stage: string) {
    const s = stage.trim().slice(0, 60);
    if (!s) throw new ValidationError('Name the stage.');
    const p = this.brain.project(projectId);
    this.brain.updateProject(projectId, { profile: { ...p.profile, stage: s, stage_since: nowIso() } });
    // A book that arrives already in its third draft: the draft she is in now takes that number and name,
    // as long as no draft has been kept here yet.
    const n = ORDINAL.findIndex((o) => s.toLowerCase() === `${o.toLowerCase()} draft`) + 1;
    const kept = (this.store.db.prepare('SELECT COUNT(*) AS n FROM drafts WHERE project_id=? AND completed_at IS NOT NULL').get(projectId) as { n: number }).n;
    if (n > 0 && !kept) { const cur = this.current(projectId); this.store.db.prepare('UPDATE drafts SET number=?, name=? WHERE id=?').run(n, draftName(n), cur.id); }
    return this.summary(projectId);
  }

  // ---------- drafts ----------
  /** The draft she is working on now. The first one starts on its own. */
  current(projectId: string) {
    this.brain.project(projectId);
    let d = this.store.db.prepare('SELECT * FROM drafts WHERE project_id=? AND completed_at IS NULL ORDER BY number DESC LIMIT 1').get(projectId) as Row | undefined;
    if (!d) {
      const last = this.store.db.prepare('SELECT MAX(number) AS n FROM drafts WHERE project_id=?').get(projectId) as { n: number | null };
      const n = (last.n ?? 0) + 1;
      const id = newId();
      this.store.db.prepare('INSERT INTO drafts(id,project_id,number,name,started_at) VALUES (?,?,?,?,?)').run(id, projectId, n, draftName(n), nowIso());
      d = this.store.db.prepare('SELECT * FROM drafts WHERE id=?').get(id) as Row;
    }
    return d;
  }

  drafts(projectId: string) {
    this.current(projectId);
    return (this.store.db.prepare('SELECT d.*, (SELECT COUNT(*) FROM draft_scenes s WHERE s.draft_id=d.id) AS scenes FROM drafts d WHERE project_id=? ORDER BY number').all(projectId) as Row[]);
  }

  /**
   * Finish the current draft: every scene is kept exactly as it stands, and the next draft begins.
   * Nothing in the manuscript changes; she simply keeps writing, and can compare against this draft at any time.
   */
  complete(projectId: string, input: { note?: string; nextName?: string } = {}) {
    const d = this.current(projectId);
    const outline = this.ms.outline(projectId);
    if (!outline.some((c) => c.scenes.length)) throw new ValidationError('There is nothing written to keep as a draft yet.');
    const now = nowIso();
    let words = 0;
    this.store.db.transaction(() => {
      let pos = 0;
      for (const c of outline) for (const s of c.scenes) {
        const full = this.store.get('scenes', s.id as string)!;
        words += full.word_count as number;
        this.store.db.prepare('INSERT OR REPLACE INTO draft_scenes(draft_id,scene_id,chapter_id,chapter_title,chapter_number,position,title,status,word_count,doc_json,text) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
          .run(d.id, s.id, c.id, c.title, c.number, ++pos, full.title, full.status, full.word_count, full.doc_json, full.text);
      }
      this.store.db.prepare('UPDATE drafts SET completed_at=?, note=?, words=? WHERE id=?').run(now, (input.note ?? '').slice(0, 2000), words, d.id);
      const n = (d.number as number) + 1;
      this.store.db.prepare('INSERT INTO drafts(id,project_id,number,name,started_at) VALUES (?,?,?,?,?)').run(newId(), projectId, n, (input.nextName ?? '').trim().slice(0, 60) || draftName(n), now);
    })();
    // A book whose stage was a draft moves to the next draft's name.
    const p = this.brain.project(projectId);
    const stage = (p.profile.stage as string | undefined) ?? '';
    if (!stage || /draft$/i.test(stage)) this.setStage(projectId, (this.current(projectId).name as string));
    return { completed: this.store.db.prepare('SELECT * FROM drafts WHERE id=?').get(d.id) as Row, now: this.current(projectId) };
  }

  /** Reopen the most recent completed draft (if she finished it by mistake). Its kept copy is released. */
  reopenLast(projectId: string) {
    const cur = this.current(projectId);
    const prev = this.store.db.prepare('SELECT * FROM drafts WHERE project_id=? AND completed_at IS NOT NULL ORDER BY number DESC LIMIT 1').get(projectId) as Row | undefined;
    if (!prev) throw new ConflictError('No draft has been finished yet.');
    this.store.db.transaction(() => {
      this.store.db.prepare('DELETE FROM drafts WHERE id=?').run(cur.id);
      this.store.db.prepare('DELETE FROM draft_scenes WHERE draft_id=?').run(prev.id);
      this.store.db.prepare('UPDATE drafts SET completed_at=NULL, words=NULL WHERE id=?').run(prev.id);
    })();
    return this.current(projectId);
  }

  /** One scene across every kept draft and now. */
  sceneAcross(sceneId: string) {
    const sc = this.ms.scene(sceneId);
    const versions = this.store.db.prepare('SELECT d.id AS draft_id, d.number, d.name, d.completed_at, s.title, s.text, s.word_count FROM draft_scenes s JOIN drafts d ON d.id=s.draft_id WHERE s.scene_id=? ORDER BY d.number').all(sceneId) as Row[];
    return { scene: { id: sc.id, title: sc.title, text: sc.text, word_count: sc.word_count }, drafts: versions };
  }

  /** The whole book now against a kept draft: chapter by chapter, scenes added, removed and changed. */
  compare(projectId: string, draftId: string) {
    const d = this.store.db.prepare('SELECT * FROM drafts WHERE id=? AND project_id=?').get(draftId, projectId) as Row | undefined;
    if (!d || !d.completed_at) throw new NotFoundError('finished draft');
    const then = this.store.db.prepare('SELECT scene_id, chapter_id, chapter_title, chapter_number, title, word_count, text FROM draft_scenes WHERE draft_id=? ORDER BY position').all(draftId) as Row[];
    const nowScenes = this.ms.outline(projectId).flatMap((c) => c.scenes.map((s) => ({ c, s })));
    const thenIds = new Set(then.map((t) => t.scene_id as string));
    const nowIds = new Set(nowScenes.map((x) => x.s.id as string));
    const changed = nowScenes.filter((x) => thenIds.has(x.s.id as string)).map((x) => {
      const t = then.find((y) => y.scene_id === x.s.id)!;
      const text = (this.store.db.prepare('SELECT text FROM scenes WHERE id=?').get(x.s.id) as Row).text as string;
      return { id: x.s.id as string, title: x.s.title as string, chapter: x.c.title as string, before: t.word_count as number, after: x.s.word_count as number, changed: text !== t.text };
    });
    return {
      draft: d,
      wordsThen: d.words as number, wordsNow: this.ms.totalWords(projectId),
      added: nowScenes.filter((x) => !thenIds.has(x.s.id as string)).map((x) => ({ id: x.s.id as string, title: x.s.title as string, chapter: x.c.title as string, words: x.s.word_count as number })),
      removed: then.filter((t) => !nowIds.has(t.scene_id as string)).map((t) => ({ id: t.scene_id as string, title: t.title as string, chapter: t.chapter_title as string, words: t.word_count as number })),
      changed: changed.filter((c) => c.changed),
      unchanged: changed.filter((c) => !c.changed).length,
    };
  }

  /** A kept draft's text, for export: the book exactly as it stood. */
  draftScenes(draftId: string) {
    return this.store.db.prepare('SELECT * FROM draft_scenes WHERE draft_id=? ORDER BY position').all(draftId) as Row[];
  }

  // ---------- the shelf: every book at a glance ----------
  summary(projectId: string) {
    const p = this.brain.project(projectId);
    const st = settingsOf(p.profile);
    const words = this.ms.totalWords(projectId);
    const last = this.store.db.prepare(`SELECT MAX(t) AS t FROM (
      SELECT MAX(COALESCE(ended_at, started_at)) AS t FROM writing_sessions WHERE project_id=?
      UNION ALL SELECT MAX(updated_at) FROM scenes WHERE project_id=?
      UNION ALL SELECT MAX(updated_at) FROM elements WHERE project_id=?)`).get(projectId, projectId, projectId) as { t: string | null };
    const draft = this.current(projectId);
    const next = this.desk.nextWritingAction(projectId);
    const setup = (p.profile.setup ?? {}) as { genres?: { name: string; role: string }[] };
    const openQuestions = (this.store.db.prepare("SELECT COUNT(*) AS n FROM elements WHERE project_id=? AND kind='question' AND state='open' AND deleted_at IS NULL").get(projectId) as { n: number }).n;
    const week = this.desk.thisWeek(projectId);
    return {
      id: p.id as string, title: p.title as string, stage: (p.profile.stage as string | undefined) ?? null, stageSince: (p.profile.stage_since as string | undefined) ?? null,
      draft: { name: draft.name as string, number: draft.number as number }, words, targetWords: st.targetWords,
      lastWorked: last.t ?? (p.updated_at as string), next: next.text, nextSceneId: next.sceneId ?? null,
      genres: (setup.genres ?? []).filter((g) => g.role === 'primary').map((g) => g.name),
      openQuestions, wordsThisWeek: week.netWords,
    };
  }

  shelf() {
    return this.brain.listProjects().map((p) => this.summary(p.id as string)).sort((a, b) => (b.lastWorked ?? '').localeCompare(a.lastWorked ?? ''));
  }
}
