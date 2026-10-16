// The Story Brain: projects, story elements, statements with provenance and a decision
// timeline, links, and capture (thoughts, questions, ideas).

import { settingsOf, mergeSettings, ProjectSettings } from './settings.js';
import { Store, Row, IdRow, withFields, NotFoundError, ValidationError, ConflictError, nowIso } from './store.js';

export const ELEMENT_KINDS = [
  'character', 'relationship', 'storyline', 'act', 'beat', 'sequence', 'scene_plan', 'event',
  'location', 'object', 'clue', 'reveal', 'payoff', 'theme', 'value', 'motif', 'rule', 'research',
  'question', 'idea', 'thought', 'note',
] as const;
export type ElementKind = (typeof ELEMENT_KINDS)[number];

export const STATUSES = ['established', 'developing', 'unanswered', 'illustrative', 'proposed', 'set_aside'] as const;
export type Status = (typeof STATUSES)[number];

export const LIFECYCLE: Partial<Record<ElementKind, string[]>> = {
  question: ['open', 'answered', 'not_relevant'],
  idea: ['considering', 'adopted', 'set_aside'],
  thought: ['inbox', 'filed'],
};

export const RELATIONS = [
  'contains', 'part_of', 'realizes', 'causes', 'enables', 'motivates', 'depends_on',
  'plants', 'pays_off', 'reveals', 'conceals', 'foreshadows', 'mirrors', 'contradicts',
  'appears_in', 'pov_of', 'located_at', 'knows', 'suspects', 'believes_falsely',
  'relates_to', 'answers', 'raises', 'inspired_by',
] as const;
export type Relation = (typeof RELATIONS)[number];

export interface Speaker { kind: 'author' | 'assistant' | 'source'; name?: string }

export interface StatementInput {
  elementId: string;
  field: string;
  value: unknown;
  status: Status;
  speaker: Speaker;
  sourceId?: string | null;
  excerptId?: string | null;
  madeAt?: string;
  /** Statement id(s) this one replaces. 'current' replaces the current established statement of the field. */
  supersedes?: string | string[] | 'current' | null;
  note?: string;
}

export interface FieldView {
  field: string;
  current: (IdRow & { value: unknown }) | null;          // newest active established statement
  latest: (IdRow & { value: unknown }) | null;           // newest active statement of any non-illustrative status
  possibilities: (IdRow & { value: unknown })[];         // active developing / proposed statements (competing options)
  unanswered: (IdRow & { value: unknown })[];
  illustrative: (IdRow & { value: unknown })[];
  setAside: (IdRow & { value: unknown })[];
  history: (IdRow & { value: unknown })[];               // superseded statements, newest first
}

const ACTOR_AUTHOR = 'author';

function parseStatement(r: Row): IdRow & { value: unknown } {
  return withFields(r, { value: JSON.parse(r.value_json as string) as unknown });
}

export class Brain {
  constructor(private store: Store) {}

  // ---------- projects ----------
  createProject(title: string, profile: Record<string, unknown> = {}, actor = ACTOR_AUTHOR) {
    const t = title.trim();
    if (!t) throw new ValidationError('A novel needs a title.');
    return this.store.batch({ actor, reason: `Create novel "${t}"` }, (w) => {
      const p = w.insert('projects', { title: t, profile_json: JSON.stringify(profile) });
      this.store.db.prepare('UPDATE batches SET project_id=? WHERE id=?').run(p.id, w.batchId);
      return this.project(p.id);
    });
  }

  project(id: string) {
    const p = this.store.get('projects', id);
    if (!p || p.deleted_at) throw new NotFoundError('novel');
    return withFields(p, { profile: JSON.parse(p.profile_json as string) as Record<string, any> });
  }

  listProjects() {
    return (this.store.db.prepare('SELECT * FROM projects WHERE deleted_at IS NULL ORDER BY updated_at DESC').all() as Row[])
      .map((p) => withFields(p, { profile: JSON.parse(p.profile_json as string) as Record<string, any> }));
  }

  updateProject(id: string, patch: { title?: string; profile?: Record<string, unknown> }, expectVersion?: number, actor = ACTOR_AUTHOR) {
    this.project(id);
    const row: Row = {};
    if (patch.title !== undefined) { if (!patch.title.trim()) throw new ValidationError('A novel needs a title.'); row.title = patch.title.trim(); }
    if (patch.profile !== undefined) row.profile_json = JSON.stringify(patch.profile);
    this.store.batch({ projectId: id, actor, reason: 'Update novel settings' }, (w) => w.update('projects', id, row, { expectVersion }));
    return this.project(id);
  }

  settings(id: string): ProjectSettings {
    return settingsOf(this.project(id).profile);
  }

  /** Change novel settings. A status step still used by scenes cannot be removed (rename it instead). */
  updateSettings(id: string, patch: Partial<ProjectSettings>, actor = ACTOR_AUTHOR): ProjectSettings {
    const p = this.project(id);
    const next = mergeSettings(p.profile, patch);
    if (patch.sceneLadder) {
      const keep = new Set(next.sceneLadder.map((x) => x.key));
      const used = this.store.db.prepare('SELECT status, COUNT(*) AS n FROM scenes WHERE project_id=? AND deleted_at IS NULL GROUP BY status').all(id) as { status: string; n: number }[];
      const orphan = used.filter((u) => !keep.has(u.status));
      if (orphan.length) {
        const old = settingsOf(p.profile).sceneLadder;
        const names = orphan.map((o) => `${o.n} scene${o.n === 1 ? '' : 's'} marked "${old.find((x) => x.key === o.status)?.label ?? o.status}"`).join(', ');
        throw new ValidationError(`That step is still in use: ${names}. Move those scenes to another step first, or rename the step instead.`);
      }
    }
    this.updateProject(id, { profile: { ...p.profile, settings: next } }, undefined, actor);
    return next;
  }

  archiveProject(id: string, actor = ACTOR_AUTHOR) {
    this.project(id);
    this.store.batch({ projectId: id, actor, reason: 'Archive novel' }, (w) => w.remove('projects', id));
  }

  // ---------- sources ----------
  addSource(projectId: string, src: { kind: string; name: string; madeAt?: string | null; fileHash?: string | null; notes?: string }, actor = ACTOR_AUTHOR) {
    this.project(projectId);
    return this.store.batch({ projectId, actor, reason: `Add source "${src.name}"` }, (w) =>
      w.insert('sources', { project_id: projectId, kind: src.kind, name: src.name, made_at: src.madeAt ?? null, file_hash: src.fileHash ?? null, notes: src.notes ?? '' }));
  }

  addExcerpt(sourceId: string, locator: string, text: string, actor = ACTOR_AUTHOR) {
    const src = this.store.get('sources', sourceId);
    if (!src) throw new NotFoundError('source');
    return this.store.batch({ projectId: src.project_id as string, actor, reason: 'Add excerpt' }, (w) =>
      w.insert('excerpts', { source_id: sourceId, locator, text }));
  }

  sources(projectId: string) {
    return this.store.db.prepare('SELECT * FROM sources WHERE project_id=? ORDER BY made_at, created_at').all(projectId) as Row[];
  }

  // ---------- elements ----------
  createElement(projectId: string, input: { kind: string; title: string; body?: string; state?: string; parentId?: string | null; sortKey?: number; attrs?: Record<string, unknown>; reserved?: string | null }, actor = ACTOR_AUTHOR) {
    this.project(projectId);
    const kind = input.kind as ElementKind;
    if (!ELEMENT_KINDS.includes(kind)) throw new ValidationError(`Unknown element type: ${input.kind}`);
    const title = String(input.title ?? '').trim();
    if (!title) throw new ValidationError('Give it a title, even a rough one.');
    const state = input.state ?? (LIFECYCLE[kind]?.[0] ?? '');
    if (LIFECYCLE[kind] && !LIFECYCLE[kind]!.includes(state)) throw new ValidationError(`Invalid state for ${kind}`);
    if (input.parentId) this.element(input.parentId, projectId);
    return this.store.batch({ projectId, actor, reason: `Add ${kind} "${title}"` }, (w) =>
      w.insert('elements', { project_id: projectId, kind, title, body: input.body ?? '', state, parent_id: input.parentId ?? null, sort_key: input.sortKey ?? Date.now(), attrs_json: JSON.stringify(input.attrs ?? {}), reserved: input.reserved ?? null }));
  }

  element(id: string, projectId?: string): IdRow {
    const e = this.store.get('elements', id);
    if (!e || e.deleted_at || (projectId && e.project_id !== projectId)) throw new NotFoundError('story element');
    return e as IdRow;
  }

  updateElement(id: string, patch: { title?: string; body?: string; state?: string; parentId?: string | null; sortKey?: number; attrs?: Record<string, unknown>; reserved?: string | null }, expectVersion?: number, actor = ACTOR_AUTHOR) {
    const e = this.element(id);
    const row: Row = {};
    if (patch.title !== undefined) { const t = patch.title.trim(); if (!t) throw new ValidationError('Title cannot be empty.'); row.title = t; }
    if (patch.body !== undefined) { if (typeof patch.body !== 'string') throw new ValidationError('Body must be text.'); row.body = patch.body; }
    if (patch.state !== undefined) {
      const allowed = LIFECYCLE[e.kind as ElementKind];
      if (!allowed || !allowed.includes(patch.state)) throw new ValidationError(`Invalid state for ${e.kind}`);
      row.state = patch.state;
    }
    if (patch.parentId !== undefined) { if (patch.parentId) this.element(patch.parentId, e.project_id as string); row.parent_id = patch.parentId; }
    if (patch.sortKey !== undefined) row.sort_key = patch.sortKey;
    if (patch.attrs !== undefined) row.attrs_json = JSON.stringify({ ...JSON.parse((e.attrs_json as string) ?? '{}'), ...patch.attrs });
    if (patch.reserved !== undefined) row.reserved = patch.reserved && patch.reserved.trim() ? patch.reserved.trim().slice(0, 120) : null;
    return this.store.batch({ projectId: e.project_id as string, actor, reason: `Edit ${e.kind} "${e.title}"` }, (w) => w.update('elements', id, row, { expectVersion }));
  }

  deleteElement(id: string, actor = ACTOR_AUTHOR) {
    const e = this.element(id);
    this.store.batch({ projectId: e.project_id as string, actor, reason: `Delete ${e.kind} "${e.title}"` }, (w) => {
      w.remove('elements', id);
      // Links touching a deleted element are removed in the same batch, so undo restores them together.
      const links = this.store.db.prepare('SELECT id FROM links WHERE (from_id=? OR to_id=?) AND deleted_at IS NULL').all(id, id) as Row[];
      for (const l of links) w.remove('links', l.id as string);
    });
  }

  restoreElement(id: string, actor = ACTOR_AUTHOR) {
    const e = this.store.get('elements', id);
    if (!e) throw new NotFoundError('story element');
    this.store.batch({ projectId: e.project_id as string, actor, reason: `Restore ${e.kind} "${e.title}"` }, (w) => w.restore('elements', id));
  }

  elements(projectId: string, filter: { kind?: string; includeDeleted?: boolean } = {}) {
    let sql = 'SELECT * FROM elements WHERE project_id=?';
    const args: unknown[] = [projectId];
    if (!filter.includeDeleted) sql += ' AND deleted_at IS NULL';
    if (filter.kind) { sql += ' AND kind=?'; args.push(filter.kind); }
    sql += ' ORDER BY sort_key, created_at';
    return this.store.db.prepare(sql).all(...(args as never[])) as Row[];
  }

  deletedElements(projectId: string) {
    return this.store.db.prepare('SELECT * FROM elements WHERE project_id=? AND deleted_at IS NOT NULL ORDER BY deleted_at DESC').all(projectId) as Row[];
  }

  // ---------- statements ----------
  addStatement(input: StatementInput, actor?: string) {
    const el = this.element(input.elementId);
    const projectId = el.project_id as string;
    const field = String(input.field ?? '').trim();
    if (!/^[a-z][a-z0-9_]{0,63}$/.test(field)) throw new ValidationError('Field names are lowercase words joined by underscores.');
    if (!STATUSES.includes(input.status)) throw new ValidationError(`Invalid status: ${input.status}`);
    if (input.value === undefined || input.value === null || (typeof input.value === 'string' && !input.value.trim())) {
      if (input.status !== 'unanswered') throw new ValidationError('A statement needs content.');
    }
    // Author sovereignty: assistants can only propose or illustrate; only the author or her own documents establish.
    if (input.speaker.kind === 'assistant' && !['proposed', 'illustrative'].includes(input.status)) {
      throw new ValidationError('Assistant statements can only be proposals or illustrations. The author decides.');
    }
    if (input.sourceId) {
      const s = this.store.get('sources', input.sourceId);
      if (!s || s.project_id !== projectId) throw new ValidationError('Source belongs to another novel.');
    }
    if (input.excerptId) {
      const x = this.store.get('excerpts', input.excerptId);
      if (!x || (input.sourceId && x.source_id !== input.sourceId)) throw new ValidationError('Excerpt does not belong to that source.');
    }
    let toSupersede: string[] = [];
    if (input.supersedes === 'current') {
      const v = this.field(input.elementId, field);
      if (v.current) toSupersede = [v.current.id as string];
    } else if (typeof input.supersedes === 'string') toSupersede = [input.supersedes];
    else if (Array.isArray(input.supersedes)) toSupersede = input.supersedes;
    for (const sid of toSupersede) {
      const old = this.store.get('statements', sid);
      if (!old || old.deleted_at || old.element_id !== input.elementId) throw new ValidationError('Can only replace a statement about the same element.');
      if (old.superseded_by_id) throw new ConflictError('That statement was already replaced.');
    }
    const who = actor ?? (input.speaker.kind === 'assistant' ? `assistant:${input.speaker.name ?? ''}` : ACTOR_AUTHOR);
    return this.store.batch({ projectId, actor: who, reason: `${el.title}: ${field}` }, (w) => {
      const st = w.insert('statements', {
        project_id: projectId, element_id: input.elementId, field,
        value_json: JSON.stringify(input.value ?? null), status: input.status,
        speaker_kind: input.speaker.kind, speaker_name: input.speaker.name ?? '',
        source_id: input.sourceId ?? null, excerpt_id: input.excerptId ?? null,
        made_at: input.madeAt ?? nowIso(), supersedes_id: toSupersede[0] ?? null, note: input.note ?? '',
      });
      for (const sid of toSupersede) w.update('statements', sid, { superseded_by_id: st.id });
      return parseStatement(this.store.get('statements', st.id)!);
    });
  }

  /** Change a statement's status (e.g. the author establishes one possibility or sets it aside). */
  setStatementStatus(statementId: string, status: Status, opts: { replaceCurrent?: boolean } = {}, actor = ACTOR_AUTHOR) {
    const st = this.store.get('statements', statementId);
    if (!st || st.deleted_at) throw new NotFoundError('statement');
    if (!STATUSES.includes(status)) throw new ValidationError(`Invalid status: ${status}`);
    if (st.status === 'illustrative' && status === 'established') {
      throw new ValidationError('An illustration cannot be promoted directly. Write it as your own decision instead.');
    }
    if (actor.startsWith('assistant') && !['proposed', 'illustrative'].includes(status)) {
      throw new ValidationError('Only the author can decide.');
    }
    const el = this.element(st.element_id as string);
    return this.store.batch({ projectId: el.project_id as string, actor, reason: `${el.title}: ${st.field} marked ${status}` }, (w) => {
      if (status === 'established' && opts.replaceCurrent !== false) {
        const v = this.field(st.element_id as string, st.field as string);
        if (v.current && v.current.id !== statementId) w.update('statements', v.current.id as string, { superseded_by_id: statementId });
      }
      w.update('statements', statementId, { status });
      return parseStatement(this.store.get('statements', statementId)!);
    });
  }

  retractStatement(statementId: string, actor = ACTOR_AUTHOR) {
    const st = this.store.get('statements', statementId);
    if (!st || st.deleted_at) throw new NotFoundError('statement');
    const el = this.element(st.element_id as string);
    this.store.batch({ projectId: el.project_id as string, actor, reason: `${el.title}: remove ${st.field} statement` }, (w) => w.remove('statements', statementId));
  }

  field(elementId: string, field: string): FieldView {
    const rows = (this.store.db.prepare(
      'SELECT * FROM statements WHERE element_id=? AND field=? AND deleted_at IS NULL ORDER BY made_at DESC, created_at DESC',
    ).all(elementId, field) as Row[]).map(parseStatement);
    const active = rows.filter((r) => !r.superseded_by_id);
    return {
      field,
      current: active.find((r) => r.status === 'established') ?? null,
      latest: active.find((r) => r.status !== 'illustrative' && r.status !== 'set_aside') ?? null,
      possibilities: active.filter((r) => r.status === 'developing' || r.status === 'proposed'),
      unanswered: active.filter((r) => r.status === 'unanswered'),
      illustrative: active.filter((r) => r.status === 'illustrative'),
      setAside: active.filter((r) => r.status === 'set_aside'),
      history: rows.filter((r) => r.superseded_by_id),
    };
  }

  elementView(elementId: string) {
    const el = this.element(elementId);
    const fields = (this.store.db.prepare('SELECT DISTINCT field FROM statements WHERE element_id=? AND deleted_at IS NULL').all(elementId) as Row[]).map((r) => r.field as string);
    return { element: el, fields: fields.map((f) => this.field(elementId, f)), links: this.linksOf(elementId) };
  }

  statementProvenance(statementId: string) {
    const st = this.store.get('statements', statementId);
    if (!st) throw new NotFoundError('statement');
    const source = st.source_id ? this.store.get('sources', st.source_id as string) : null;
    const excerpt = st.excerpt_id ? this.store.get('excerpts', st.excerpt_id as string) : null;
    const chain: (IdRow & { value: unknown })[] = [];
    let cur: Row | undefined = st;
    const seen = new Set<string>();
    while (cur?.supersedes_id && !seen.has(cur.supersedes_id as string)) {
      seen.add(cur.supersedes_id as string);
      cur = this.store.get('statements', cur.supersedes_id as string);
      if (cur) chain.push(parseStatement(cur));
    }
    return { statement: parseStatement(st), source, excerpt, replaces: chain };
  }

  // ---------- links ----------
  link(projectId: string, input: { fromId: string; toId: string; relation: string; strength?: 'direct' | 'inferred'; note?: string; sourceId?: string | null; excerptId?: string | null }, actor = ACTOR_AUTHOR) {
    if (!RELATIONS.includes(input.relation as Relation)) throw new ValidationError(`Unknown relationship: ${input.relation}`);
    if (input.fromId === input.toId) throw new ValidationError('An element cannot link to itself.');
    const a = this.element(input.fromId, projectId), b = this.element(input.toId, projectId);
    const dup = this.store.db.prepare('SELECT id FROM links WHERE from_id=? AND to_id=? AND relation=? AND deleted_at IS NULL').get(a.id, b.id, input.relation);
    if (dup) throw new ConflictError('Those two are already connected that way.');
    return this.store.batch({ projectId, actor, reason: `Link ${a.title} ${input.relation} ${b.title}` }, (w) =>
      w.insert('links', { project_id: projectId, from_id: a.id, to_id: b.id, relation: input.relation, strength: input.strength ?? 'direct', note: input.note ?? '', source_id: input.sourceId ?? null, excerpt_id: input.excerptId ?? null }));
  }

  unlink(linkId: string, actor = ACTOR_AUTHOR) {
    const l = this.store.get('links', linkId);
    if (!l || l.deleted_at) throw new NotFoundError('connection');
    this.store.batch({ projectId: l.project_id as string, actor, reason: 'Remove connection' }, (w) => w.remove('links', linkId));
  }

  linksOf(elementId: string) {
    return this.store.db.prepare(
      `SELECT l.*, f.title AS from_title, f.kind AS from_kind, t.title AS to_title, t.kind AS to_kind
       FROM links l JOIN elements f ON f.id=l.from_id JOIN elements t ON t.id=l.to_id
       WHERE (l.from_id=? OR l.to_id=?) AND l.deleted_at IS NULL AND f.deleted_at IS NULL AND t.deleted_at IS NULL`,
    ).all(elementId, elementId) as Row[];
  }

  links(projectId: string) {
    return this.store.db.prepare('SELECT * FROM links WHERE project_id=? AND deleted_at IS NULL').all(projectId) as Row[];
  }

  // ---------- capture ----------
  /** Capture a thought exactly as typed, with no category required. */
  capture(projectId: string, text: string, opts: { kind?: 'thought' | 'question' | 'idea'; linkTo?: string[]; urgency?: 'now' | 'later' } = {}, actor = ACTOR_AUTHOR) {
    if (typeof text !== 'string' || !text.trim()) throw new ValidationError('Nothing to capture yet.');
    const kind = opts.kind ?? 'thought';
    const firstLine = text.trim().split(/\n/)[0]!;
    const title = firstLine.length > 80 ? firstLine.slice(0, 77).trimEnd() + '…' : firstLine;
    // The body keeps exactly what was typed or dictated; nothing is corrected (R-B-044).
    const el = this.createElement(projectId, { kind, title, body: text, attrs: opts.urgency ? { urgency: opts.urgency } : {} }, actor);
    for (const to of opts.linkTo ?? []) this.link(projectId, { fromId: el.id, toId: to, relation: 'relates_to' }, actor);
    return el;
  }

  /** File a captured thought as a question or idea, keeping its text and history. */
  refile(elementId: string, kind: 'question' | 'idea' | 'note', actor = ACTOR_AUTHOR) {
    const e = this.element(elementId);
    if (!['thought', 'question', 'idea', 'note'].includes(e.kind as string)) throw new ValidationError('Only captured thoughts, questions, ideas and notes can be refiled.');
    return this.store.batch({ projectId: e.project_id as string, actor, reason: `File "${e.title}" as ${kind}` }, (w) =>
      w.update('elements', elementId, { kind, state: LIFECYCLE[kind as ElementKind]?.[0] ?? '' }));
  }

  // ---------- search ----------
  search(projectId: string | null, term: string, limit = 100) {
    const t = term.trim();
    if (!t) return [];
    const like = '%' + t.replace(/[\\%_]/g, (c) => '\\' + c) + '%';
    const scope = projectId ? 'AND project_id=?' : '';
    const args = (n: number) => (projectId ? [...Array(n).fill(like), projectId] : Array(n).fill(like));
    const els = this.store.db.prepare(`SELECT id, project_id, kind, title, body, state, 'element' AS hit FROM elements WHERE deleted_at IS NULL AND (title LIKE ? ESCAPE '\\' OR body LIKE ? ESCAPE '\\') ${scope} LIMIT ${limit}`).all(...args(2)) as Row[];
    const sts = this.store.db.prepare(
      `SELECT s.id, s.project_id, s.element_id, s.field, s.value_json, s.status, s.speaker_kind, s.speaker_name, s.made_at, s.superseded_by_id, e.title AS element_title, 'statement' AS hit
       FROM statements s JOIN elements e ON e.id=s.element_id
       WHERE s.deleted_at IS NULL AND e.deleted_at IS NULL AND s.value_json LIKE ? ESCAPE '\\' ${projectId ? 'AND s.project_id=?' : ''} LIMIT ${limit}`,
    ).all(...args(1)) as Row[];
    const scenes = this.store.db.prepare(`SELECT id, project_id, title, substr(text, max(1, instr(lower(text), lower(?)) - 60), 200) AS snippet, 'scene' AS hit FROM scenes WHERE deleted_at IS NULL AND (title LIKE ? ESCAPE '\\' OR text LIKE ? ESCAPE '\\') ${scope} LIMIT ${limit}`)
      .all(t, ...args(2)) as Row[];
    const turns = this.store.db.prepare(
      `SELECT t.id, c.project_id, t.conversation_id, t.speaker_kind, t.speaker_name, t.said_at, substr(t.text, max(1, instr(lower(t.text), lower(?)) - 80), 240) AS snippet, c.title AS conversation_title, 'turn' AS hit
       FROM turns t JOIN conversations c ON c.id=t.conversation_id WHERE c.deleted_at IS NULL AND t.text LIKE ? ESCAPE '\\' ${projectId ? 'AND c.project_id=?' : ''} LIMIT ${limit}`,
    ).all(t, ...args(1)) as Row[];
    return [...els, ...sts.map(parseStatement), ...scenes, ...turns];
  }
}
