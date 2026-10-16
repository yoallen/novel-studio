// The Story Brain: projects, story elements, statements with provenance and a decision
// timeline, links, and capture (thoughts, questions, ideas).

import { settingsOf, mergeSettings, ProjectSettings } from './settings.js';
import { templateFor, FieldDef, KIND_LABELS, BEAT_BOARD_FIELDS } from './templates.js';
import { Store, Row, IdRow, withFields, NotFoundError, ValidationError, ConflictError, nowIso, newId } from './store.js';

export const ELEMENT_KINDS = [
  'character', 'relationship', 'storyline', 'act', 'beat', 'sequence', 'scene_plan', 'event',
  'location', 'object', 'clue', 'reveal', 'payoff', 'theme', 'value', 'motif', 'rule', 'research',
  'question', 'idea', 'thought', 'note', 'arc', 'guardrail', 'line',
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
  /** The conversation message this came from, so it can always be traced back (R-A-054). */
  turnId?: string | null;
  /** Extra facts about the statement: timing (backstory / in_story ...), accepted_by, layer. */
  qualifiers?: Record<string, unknown>;
}

export interface FieldView {
  field: string;
  current: (IdRow & { value: unknown }) | null;          // newest active established statement
  currentAll: (IdRow & { value: unknown })[];            // every active established statement (multi-value fields)
  latest: (IdRow & { value: unknown }) | null;           // newest active statement of any non-illustrative status
  possibilities: (IdRow & { value: unknown })[];         // active developing / proposed statements (competing options)
  unanswered: (IdRow & { value: unknown })[];
  illustrative: (IdRow & { value: unknown })[];
  setAside: (IdRow & { value: unknown })[];
  history: (IdRow & { value: unknown })[];               // superseded statements, newest first
}

const ACTOR_AUTHOR = 'author';

function parseStatement(r: Row): IdRow & { value: unknown } {
  return withFields(r, { value: JSON.parse(r.value_json as string) as unknown, qualifiers: JSON.parse((r.qualifiers_json as string) ?? '{}') as Record<string, unknown> });
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
    if (!ELEMENT_KINDS.includes(kind) && !this.customKind(projectId, input.kind)) throw new ValidationError(`Unknown element type: ${input.kind}`);
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
        turn_id: input.turnId ?? null, qualifiers_json: JSON.stringify(input.qualifiers ?? {}),
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
      'SELECT * FROM statements WHERE element_id=? AND field=? AND deleted_at IS NULL ORDER BY made_at DESC, created_at DESC, rowid DESC',
    ).all(elementId, field) as Row[]).map(parseStatement);
    const active = rows.filter((r) => !r.superseded_by_id);
    return {
      field,
      current: active.find((r) => r.status === 'established') ?? null,
      currentAll: active.filter((r) => r.status === 'established'),
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

  // ---------- kinds and fields the author defines (R-A-109) ----------
  customKind(projectId: string, key: string): Row | undefined {
    return this.store.db.prepare('SELECT * FROM kinds WHERE project_id=? AND key=? AND deleted_at IS NULL').get(projectId, key) as Row | undefined;
  }

  defineKind(projectId: string, input: { label: string; plural?: string; description?: string }, actor = ACTOR_AUTHOR) {
    this.project(projectId);
    const label = String(input.label ?? '').trim();
    if (!label) throw new ValidationError('Give the new kind a name.');
    let key = 'x_' + label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40);
    if (key === 'x_') key = 'x_kind';
    if ((ELEMENT_KINDS as readonly string[]).includes(key) || this.customKind(projectId, key)) throw new ConflictError(`There is already a kind called "${label}".`);
    return this.store.batch({ projectId, actor, reason: `New kind of story element: ${label}` }, (w) =>
      w.insert('kinds', { project_id: projectId, key, label, plural: (input.plural ?? '').trim() || label + 's', description: input.description ?? '' }));
  }

  kinds(projectId: string) {
    this.project(projectId);
    const builtIn = (ELEMENT_KINDS as readonly string[]).map((k) => ({ key: k, label: KIND_LABELS[k]?.label ?? k, plural: KIND_LABELS[k]?.plural ?? k, custom: false }));
    const custom = (this.store.db.prepare('SELECT * FROM kinds WHERE project_id=? AND deleted_at IS NULL ORDER BY created_at').all(projectId) as Row[])
      .map((k) => ({ key: k.key as string, label: k.label as string, plural: k.plural as string, custom: true, id: k.id as string, description: k.description as string }));
    return [...builtIn, ...custom];
  }

  defineField(projectId: string, input: { kind: string; label: string; group?: string; prompt?: string; multi?: boolean; private?: boolean }, actor = ACTOR_AUTHOR) {
    this.project(projectId);
    if (!(ELEMENT_KINDS as readonly string[]).includes(input.kind) && !this.customKind(projectId, input.kind)) throw new ValidationError('Unknown kind of story element.');
    const label = String(input.label ?? '').trim();
    if (!label) throw new ValidationError('Give the new field a name.');
    let field = 'x_' + label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40);
    if (field === 'x_') field = 'x_field';
    const taken = new Set(this.fieldsFor(projectId, input.kind).map((d) => d.field));
    let n = 2; const base = field; while (taken.has(field)) field = `${base}_${n++}`;
    return this.store.batch({ projectId, actor, reason: `New field "${label}" for ${input.kind}` }, (w) =>
      w.insert('field_defs', { project_id: projectId, kind: input.kind, field, label, group_name: (input.group ?? '').trim() || 'My fields', prompt: input.prompt ?? '', multi: input.multi ? 1 : 0, private: input.private ? 1 : 0, sort: Date.now() }));
  }

  removeField(fieldDefId: string, actor = ACTOR_AUTHOR) {
    const d = this.store.get('field_defs', fieldDefId);
    if (!d || d.deleted_at) throw new NotFoundError('field');
    // Removing a field definition hides it from forms; anything written in it stays in history and search.
    this.store.batch({ projectId: d.project_id as string, actor, reason: `Remove field "${d.label}"` }, (w) => w.remove('field_defs', fieldDefId));
  }

  /** Built-in template plus her own fields for this kind in this novel. */
  fieldsFor(projectId: string, kind: string): FieldDef[] {
    const custom = (this.store.db.prepare('SELECT * FROM field_defs WHERE project_id=? AND kind=? AND deleted_at IS NULL ORDER BY sort').all(projectId, kind) as Row[])
      .map((d) => ({ field: d.field as string, label: d.label as string, group: d.group_name as string, prompt: d.prompt as string, multi: !!d.multi, private: !!d.private, custom: true, id: d.id as string }));
    const builtIn = (ELEMENT_KINDS as readonly string[]).includes(kind) ? templateFor(kind) : [];
    return [...builtIn, ...custom];
  }

  /** Everything the element page shows: fields with their status layers, children (such as arcs), links. */
  elementPage(elementId: string) {
    const el = this.element(elementId);
    const pid = el.project_id as string;
    let defs = this.fieldsFor(pid, el.kind as string);
    if (el.kind === 'beat') {
      // Each beat shows only its own board fields (Want at Break into Two, Need at Break into Three, and so on).
      const key = (JSON.parse((el.attrs_json as string) || '{}') as Record<string, unknown>).template_key as string | undefined;
      const mine = new Set(key ? BEAT_BOARD_FIELDS[key] ?? [] : []);
      defs = defs.filter((d) => d.group !== 'On the board' || mine.has(d.field));
    }
    const used = (this.store.db.prepare('SELECT DISTINCT field FROM statements WHERE element_id=? AND deleted_at IS NULL').all(elementId) as Row[]).map((r) => r.field as string);
    // 'beat' holds a card's placement; it is shown by Narrative Zoom, not as a text field.
    const extra = used.filter((u) => u !== 'beat' && !defs.some((d) => d.field === u)).map((u) => ({ field: u, label: u.replace(/^x_/, '').replace(/_/g, ' '), group: 'Other' } as FieldDef));
    const fields = [...defs, ...extra].map((d) => ({ def: d, view: this.field(elementId, d.field) }));
    const children = (this.store.db.prepare('SELECT * FROM elements WHERE parent_id=? AND deleted_at IS NULL ORDER BY sort_key, created_at').all(elementId) as Row[])
      .map((c) => ({ element: c, fields: this.fieldsFor(pid, c.kind as string).map((d) => ({ def: d, view: this.field(c.id as string, d.field) })) }));
    const links = this.linksOf(elementId);
    const guardrails = (this.store.db.prepare("SELECT * FROM elements WHERE kind='guardrail' AND parent_id=? AND deleted_at IS NULL ORDER BY created_at").all(elementId) as Row[]);
    // Suggestions she said "not yet" to come back when she opens the record again (R-A-028).
    const pending = [...this.proposals(pid, 'pending'), ...this.proposals(pid, 'deferred')].filter((p) => (p.target as Record<string, unknown>).elementId === elementId);
    return { element: withFields(el, { attrs: JSON.parse((el.attrs_json as string) || '{}') as Record<string, unknown> }), fields, children: children.filter((c) => c.element.kind !== 'guardrail'), guardrails, links, pending, parent: el.parent_id ? this.store.get('elements', el.parent_id as string) ?? null : null };
  }

  // ---------- proposals: suggestions wait for her (R-A-024, R-A-060, R-A-097) ----------
  propose(projectId: string, input: { origin: string; kind: 'statement' | 'element' | 'link'; target: Record<string, unknown>; after: unknown; before?: unknown; rationale?: string; conversationId?: string | null; turnId?: string | null }) {
    this.project(projectId);
    const id = newId();
    this.store.db.prepare('INSERT INTO proposals(id,project_id,origin,kind,target_json,before_json,after_json,rationale,status,created_at,conversation_id,turn_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
      .run(id, projectId, input.origin, input.kind, JSON.stringify(input.target), input.before === undefined ? null : JSON.stringify(input.before), JSON.stringify(input.after ?? null), input.rationale ?? '', 'pending', nowIso(), input.conversationId ?? null, input.turnId ?? null);
    return this.proposal(id);
  }

  proposal(id: string) {
    const r = this.store.db.prepare('SELECT * FROM proposals WHERE id=?').get(id) as Row | undefined;
    if (!r) throw new NotFoundError('suggestion');
    return withFields(r, { target: JSON.parse(r.target_json as string) as Record<string, unknown>, after: r.after_json ? JSON.parse(r.after_json as string) as unknown : null, before: r.before_json ? JSON.parse(r.before_json as string) as unknown : null });
  }

  proposals(projectId: string, status?: string) {
    const rows = (status
      ? this.store.db.prepare('SELECT id FROM proposals WHERE project_id=? AND status=? ORDER BY created_at DESC').all(projectId, status)
      : this.store.db.prepare('SELECT id FROM proposals WHERE project_id=? ORDER BY created_at DESC').all(projectId)) as Row[];
    return rows.map((r) => this.proposal(r.id as string));
  }

  /** Accept a suggestion. It is recorded as assistant-written and author-accepted, with the status she chooses. */
  acceptProposal(id: string, opts: { status?: 'established' | 'developing'; value?: unknown } = {}, actor = ACTOR_AUTHOR) {
    const p = this.proposal(id);
    if (p.status === 'accepted') throw new ConflictError('That suggestion was already accepted.');
    const pid = p.project_id as string;
    const t = p.target;
    const after = (opts.value !== undefined ? opts.value : p.after) as Record<string, unknown> | string;
    return this.store.batch({ projectId: pid, actor, reason: `Accept suggestion${t.field ? ` for ${String(t.field).replace(/_/g, ' ')}` : ''}` }, () => {
    let result: unknown = null;
    if (p.kind === 'statement') {
      const value = typeof after === 'object' && after && 'value' in after ? (after as Record<string, unknown>).value : after;
      const st = this.addStatement({ elementId: t.elementId as string, field: t.field as string, value, status: 'proposed', speaker: { kind: 'assistant', name: String(p.origin) }, turnId: (p.turn_id as string) ?? null, note: p.rationale as string });
      result = this.setStatementStatus(st.id, opts.status ?? 'developing', {}, actor);
      this.store.db.prepare('UPDATE statements SET qualifiers_json=? WHERE id=?').run(JSON.stringify({ accepted_by: 'author', accepted_at: nowIso(), proposal_id: id }), st.id);
    } else if (p.kind === 'element') {
      const a = after as Record<string, unknown>;
      result = this.createElement(pid, { kind: String(a.kind), title: String(a.title), body: String(a.body ?? ''), attrs: { origin: 'assistant', accepted_by: 'author', proposal_id: id } }, actor);
    } else if (p.kind === 'link') {
      result = this.link(pid, { fromId: t.fromId as string, toId: t.toId as string, relation: t.relation as Relation, strength: 'inferred', note: p.rationale as string }, actor);
    }
    this.store.db.prepare("UPDATE proposals SET status='accepted', decided_at=? WHERE id=?").run(nowIso(), id);
    return { proposal: this.proposal(id), result };
    });
  }

  decideProposal(id: string, status: 'rejected' | 'deferred' | 'pending') {
    const p = this.proposal(id);
    if (p.status === 'accepted') throw new ConflictError('That suggestion was already accepted. Undo it from History instead.');
    this.store.db.prepare('UPDATE proposals SET status=?, decided_at=? WHERE id=?').run(status, status === 'pending' ? null : nowIso(), id);
    return this.proposal(id);
  }

  // ---------- open decisions: a map of the choices ahead, never a to-do list (R-A-042) ----------
  openDecisions(projectId: string) {
    this.project(projectId);
    const stillOpen = (this.store.db.prepare(
      `SELECT s.id, s.field, s.value_json, s.made_at, e.id AS element_id, e.title AS element_title, e.kind AS element_kind FROM statements s JOIN elements e ON e.id=s.element_id
       WHERE s.project_id=? AND s.status='unanswered' AND s.superseded_by_id IS NULL AND s.deleted_at IS NULL AND e.deleted_at IS NULL ORDER BY e.kind, e.title`,
    ).all(projectId) as Row[]).map(parseStatement);
    // Fields with possibilities but no decision yet.
    const choosing = this.store.db.prepare(
      `SELECT e.id AS element_id, e.title AS element_title, e.kind AS element_kind, s.field, COUNT(*) AS options FROM statements s JOIN elements e ON e.id=s.element_id
       WHERE s.project_id=? AND s.status IN ('developing','proposed') AND s.superseded_by_id IS NULL AND s.deleted_at IS NULL AND e.deleted_at IS NULL
         AND NOT EXISTS (SELECT 1 FROM statements x WHERE x.element_id=s.element_id AND x.field=s.field AND x.status='established' AND x.superseded_by_id IS NULL AND x.deleted_at IS NULL)
       GROUP BY e.id, s.field ORDER BY e.kind, e.title, s.field`,
    ).all(projectId) as Row[];
    const questions = this.store.db.prepare("SELECT id, title, body, attrs_json, created_at FROM elements WHERE project_id=? AND kind='question' AND state='open' AND deleted_at IS NULL ORDER BY created_at").all(projectId) as Row[];
    const reserved = this.store.db.prepare(
      "SELECT 'element' AS what, id, title, kind, reserved FROM elements WHERE project_id=? AND reserved IS NOT NULL AND deleted_at IS NULL UNION ALL SELECT 'scene' AS what, id, title, 'scene' AS kind, reserved FROM scenes WHERE project_id=? AND reserved IS NOT NULL AND deleted_at IS NULL",
    ).all(projectId, projectId) as Row[];
    const pending = [...this.proposals(projectId, 'pending'), ...this.proposals(projectId, 'deferred')];
    return { stillOpen, choosing, questions, reserved, pending };
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
