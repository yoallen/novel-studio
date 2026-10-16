// The writing desk: what the author needs around the page. Scene plans, Drafting Readiness
// (informational only, never a gate), quiet resurfacing of linked questions and ideas, the
// "Where was I?" view, the Next Writing Action, and this week's accomplishments.
// Requirements: R-B-013 to R-B-022, R-B-028, R-B-030, R-B-034.

import { Store, Row, NotFoundError, nowIso } from './store.js';
import { Brain } from './brain.js';
import { Manuscript } from './manuscript.js';
import { settingsOf } from './settings.js';

/** Scene-plan fields shown beside the page (R-B-001). Stored as statements, so each keeps status and history. */
export const PLAN_FIELDS = [
  { field: 'purpose', label: 'What this scene must do' },
  { field: 'objective', label: "The viewpoint character's objective" },
  { field: 'conflict', label: 'Central conflict' },
  { field: 'outcome', label: 'Intended outcome or change' },
  { field: 'value_start', label: 'Value at the start' },
  { field: 'value_end', label: 'Value at the end' },
  { field: 'how_we_got_here', label: 'How we got here' },
  { field: 'what_must_follow', label: 'What must follow' },
  { field: 'story_time', label: 'When (story time)' },
  { field: 'location', label: 'Where' },
] as const;

const OPEN_STATES = new Set(['open', 'considering', 'inbox', '']);

export class WritingDesk {
  constructor(private store: Store, private brain: Brain, private ms: Manuscript) {}

  /** Make sure a scene has its plan element (created on first use). */
  ensurePlan(sceneId: string): string {
    const s = this.ms.scene(sceneId);
    if (s.plan_element_id) return s.plan_element_id as string;
    const el = this.brain.createElement(s.project_id as string, { kind: 'scene_plan', title: s.title as string });
    this.ms.updateSceneMeta(sceneId, { planElementId: el.id });
    return el.id;
  }

  /** Everything the side panel shows for one scene. Reading never creates records. */
  sceneContext(sceneId: string) {
    const s = this.ms.scene(sceneId);
    const pid = s.project_id as string;
    const planId = (s.plan_element_id as string | null) ?? null;
    const fields = PLAN_FIELDS.map((f) => {
      const view = planId ? this.brain.field(planId, f.field) : null;
      return { ...f, current: view?.current ?? null, latest: view?.latest ?? null, possibilities: view?.possibilities ?? [] };
    });
    const links = planId ? this.brain.linksOf(planId) : [];
    const linked = links.map((l) => (l.from_id === planId ? { id: l.to_id, title: l.to_title, kind: l.to_kind, relation: l.relation, link_id: l.id }
      : { id: l.from_id, title: l.from_title, kind: l.from_kind, relation: l.relation, link_id: l.id }));
    const ids = linked.map((x) => x.id as string);
    const notes = ids.length
      ? (this.store.db.prepare(`SELECT id, kind, title, body, state, attrs_json, created_at FROM elements WHERE id IN (${ids.map(() => '?').join(',')}) AND deleted_at IS NULL AND kind IN ('question','idea','thought','note')`).all(...ids) as Row[])
        .map((r) => ({ ...r, state: r.state as string, attrs: JSON.parse((r.attrs_json as string) || '{}') as Record<string, unknown> }))
      : [];
    const valueOf = (f: string) => fields.find((x) => x.field === f)?.latest?.value;
    const has = (v: unknown) => v !== undefined && v !== null && String(v).trim() !== '';
    const readiness = [
      { item: 'Viewpoint character', ok: !!s.pov_element_id },
      { item: 'Purpose', ok: has(valueOf('purpose')) },
      { item: "Character's objective", ok: has(valueOf('objective')) },
      { item: 'Central conflict', ok: has(valueOf('conflict')) },
      { item: 'Intended outcome or change', ok: has(valueOf('outcome')) },
      { item: 'Relationship to the surrounding story', ok: has(valueOf('how_we_got_here')) || has(valueOf('what_must_follow')) || linked.some((l) => !['question', 'idea', 'thought', 'note'].includes(l.kind as string)) },
    ];
    const pov = s.pov_element_id ? this.store.get('elements', s.pov_element_id as string) : null;
    return {
      scene: { id: s.id, title: s.title, status: s.status, confirmed: s.confirmed, reserved: s.reserved, notes: s.notes, word_count: s.word_count, version: s.version, chapter_id: s.chapter_id, pov_element_id: s.pov_element_id, plan_element_id: planId },
      pov: pov && !pov.deleted_at ? { id: pov.id, title: pov.title } : null,
      fields,
      linked,
      openNotes: notes.filter((n) => OPEN_STATES.has(n.state as string)),
      readiness: { ready: readiness.every((r) => r.ok), items: readiness, open: readiness.filter((r) => !r.ok).map((r) => r.item) },
    };
  }

  /** Set a plan field. The newest author statement becomes current; the earlier one stays in history. */
  setPlanField(sceneId: string, field: string, value: string, status: 'established' | 'developing' | 'unanswered' = 'developing') {
    if (!PLAN_FIELDS.some((f) => f.field === field)) throw new NotFoundError('scene plan field');
    const planId = this.ensurePlan(sceneId);
    const cur = this.brain.field(planId, field);
    const supersedes = cur.latest ? cur.latest.id : null;
    return this.brain.addStatement({ elementId: planId, field, value, status, speaker: { kind: 'author' }, supersedes });
  }

  /** Capture a thought while writing, attached to the scene (R-B-019: need it now / resolve later). */
  captureForScene(sceneId: string, text: string, opts: { kind?: 'thought' | 'question' | 'idea'; urgency?: 'now' | 'later' } = {}) {
    const s = this.ms.scene(sceneId);
    const planId = this.ensurePlan(sceneId);
    return this.brain.capture(s.project_id as string, text, { kind: opts.kind, urgency: opts.urgency ?? 'later', linkTo: [planId] });
  }

  /** The concrete next step (R-B-015): the author's own words if she set them, otherwise derived. */
  nextWritingAction(projectId: string) {
    const settings = settingsOf(this.brain.project(projectId).profile);
    const outline = this.ms.outline(projectId);
    const ladder = settings.sceneLadder;
    const label = (k: string) => ladder.find((x) => x.key === k)?.label ?? k;
    const ws = this.ms.writingState(projectId);
    if (settings.nextWritingAction.trim()) {
      return { text: settings.nextWritingAction.trim(), sceneId: ws?.sceneId ?? null, source: 'author' as const };
    }
    if (ws?.sceneId) {
      const sc = this.ms.scene(ws.sceneId as string);
      return { text: `Keep writing "${sc.title}"`, sceneId: sc.id as string, detail: `${label(sc.status as string)}, ${sc.word_count} words`, source: 'derived' as const };
    }
    const firstDraftedKey = ladder.find((x) => x.drafted)?.key;
    const notStarted = new Set(ladder.slice(0, Math.max(0, ladder.findIndex((x) => x.key === firstDraftedKey))).map((x) => x.key));
    for (const ch of outline) for (const sc of ch.scenes) {
      if (notStarted.has(sc.status as string)) return { text: `Draft "${sc.title}" in ${ch.title}`, sceneId: sc.id as string, source: 'derived' as const };
    }
    if (!outline.length) return { text: 'Write the first line of your first scene', sceneId: null, source: 'derived' as const };
    const last = outline[outline.length - 1]!;
    return { text: `Start the next scene after "${last.scenes[last.scenes.length - 1]?.title ?? last.title}"`, sceneId: null, source: 'derived' as const };
  }

  /** "Where was I?" (R-B-018). Never mentions how long she has been away. */
  whereWasI(projectId: string) {
    this.brain.project(projectId);
    const ws = this.ms.writingState(projectId);
    let lastScene: { id: string; title: string; tail: string; chapter: string } | null = null;
    if (ws?.sceneId) {
      const sc = this.ms.scene(ws.sceneId as string);
      const ch = this.store.get('chapters', sc.chapter_id as string);
      const text = (sc.text as string).trim();
      lastScene = { id: sc.id as string, title: sc.title as string, chapter: (ch?.title as string) ?? '', tail: text.length > 400 ? '…' + text.slice(-400).replace(/^\S*\s/, '') : text };
    }
    const decisions = this.store.db.prepare(
      `SELECT s.id, s.field, s.value_json, s.made_at, e.title AS element_title, e.id AS element_id FROM statements s JOIN elements e ON e.id=s.element_id
       WHERE s.project_id=? AND s.status='established' AND s.speaker_kind='author' AND s.deleted_at IS NULL AND e.deleted_at IS NULL ORDER BY s.made_at DESC, s.created_at DESC LIMIT 5`,
    ).all(projectId) as Row[];
    const openQuestions = this.store.db.prepare(
      "SELECT id, title, body, state, attrs_json, created_at FROM elements WHERE project_id=? AND kind='question' AND state='open' AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 8",
    ).all(projectId) as Row[];
    const recentCaptures = this.store.db.prepare(
      "SELECT id, kind, title, state, created_at FROM elements WHERE project_id=? AND kind IN ('thought','idea') AND state IN ('inbox','considering') AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 8",
    ).all(projectId) as Row[];
    return {
      lastScene,
      nextAction: this.nextWritingAction(projectId),
      decisions: decisions.map((d) => ({ ...d, value: JSON.parse(d.value_json as string) as unknown })),
      openQuestions,
      recentCaptures,
      openTrail: this.ms.openTrail(projectId),
      recoveries: this.ms.pendingRecoveries(projectId),
    };
  }

  /** "This week" (R-B-030): what was done, including thinking work, in neutral words. */
  thisWeek(projectId: string, now = new Date()) {
    this.brain.project(projectId);
    const since = new Date(now.getTime() - 7 * 86400_000).toISOString();
    const sessions = this.ms.sessions(projectId, 200).filter((x) => (x.started_at as string) >= since);
    const netWords = sessions.reduce((a, x) => a + (x.net_words ?? 0), 0);
    const scenesTouched = new Set(sessions.flatMap((x) => x.scenes));
    const count = (sql: string) => (this.store.db.prepare(sql).get(projectId, since) as { n: number }).n;
    return {
      since,
      sessions: sessions.length,
      netWords,
      scenesTouched: scenesTouched.size,
      decisionsMade: count("SELECT COUNT(*) AS n FROM statements WHERE project_id=? AND status='established' AND speaker_kind='author' AND created_at>=? AND deleted_at IS NULL"),
      questionsAnswered: count("SELECT COUNT(*) AS n FROM elements WHERE project_id=? AND kind='question' AND state='answered' AND updated_at>=? AND deleted_at IS NULL"),
      ideasCaptured: count("SELECT COUNT(*) AS n FROM elements WHERE project_id=? AND kind IN ('thought','idea','question') AND created_at>=? AND deleted_at IS NULL"),
      connectionsMade: count('SELECT COUNT(*) AS n FROM links WHERE project_id=? AND created_at>=? AND deleted_at IS NULL'),
      generatedAt: nowIso(),
    };
  }
}
