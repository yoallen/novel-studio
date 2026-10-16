// The import desk: files come in, the program proposes where things go, she approves, and the result is checked.

import { Store, Row, NotFoundError, ValidationError, ConflictError, nowIso, newId } from '../store.js';
import { Brain } from '../brain.js';
import { Manuscript, docToText } from '../manuscript.js';
import { Structure, SAVE_THE_CAT } from '../structure.js';
import { settingsOf } from '../settings.js';
import { blocksToDoc } from './blocks.js';
import { readBlocks } from './readers.js';
import { planManuscript, finalShape, expectedText, ManuscriptPlan } from './manuscript-import.js';
import { readPassages, splitByFields, dateFromName, Passage, ImportStatus } from './document-import.js';
import { readBeatSheet, profileFromSheet, SheetRead } from './spreadsheet.js';

export interface SheetPlan { read: SheetRead; density: number; useCorrections: boolean; corrections: Record<string, [number, number]>; profileName: string; keepGuidance: boolean }

export interface ImportItem {
  id: string;
  passage: string;            // passage key
  excerptId: string;
  path: string[];
  label: string | null;
  status: ImportStatus;
  text: string;
  /** Where the program thinks it belongs. Any of these can be changed before applying. */
  elementId: string | null;
  newElement: { key: string; kind: string; title: string } | null;
  beatKey: string | null;
  arc: boolean;               // goes on the character's arc rather than the character
  field: string | null;
  include: boolean;
  already: boolean;
  note: string;
}

export interface ImportEdits {
  chapters?: Record<string, { title?: string; include?: boolean; joinPrevious?: boolean }>;
  scenes?: Record<string, { title?: string; include?: boolean; joinPrevious?: boolean }>;
  docDate?: string | null;
  items?: Record<string, { include?: boolean; elementId?: string | null; field?: string | null; status?: ImportStatus; arc?: boolean }>;
  newElements?: Record<string, { title?: string; kind?: string }>;
  density?: number; useCorrections?: boolean; profileName?: string; keepGuidance?: boolean;
}

export interface DocumentPlan {
  sourceId: string;
  docDate: string | null;
  dateFrom: 'file name' | 'file properties' | 'you' | null;
  items: ImportItem[];
  newElements: { key: string; kind: string; title: string }[];
  findings: string[];
}

const nameLike = (s: string) => {
  const w = s.trim().split(/\s+/);
  return w.length >= 1 && w.length <= 4 && !/[:?!]/.test(s) && w.every((x) => /^(Miss|Mr\.?|Mrs\.?|Ms\.?|Dr\.?|[A-Z][\p{L}'’-]+)$/u.test(x));
};
const low = (s: string) => s.toLowerCase().replace(/[’]/g, "'");

export class Importer {
  constructor(private store: Store, private brain: Brain, private ms: Manuscript, private structure: Structure) {}

  private save(projectId: string, kind: string, name: string, sourceId: string | null, plan: unknown, report: unknown) {
    const id = newId();
    this.store.db.prepare('INSERT INTO imports(id,project_id,kind,source_id,name,plan_json,report_json,status,created_at) VALUES (?,?,?,?,?,?,?,?,?)')
      .run(id, projectId, kind, sourceId, name, JSON.stringify(plan), JSON.stringify(report), 'pending', nowIso());
    return this.get(id);
  }

  get(id: string) {
    const r = this.store.db.prepare('SELECT * FROM imports WHERE id=?').get(id) as Row | undefined;
    if (!r) throw new NotFoundError('import');
    return { id: r.id as string, project_id: r.project_id as string, kind: r.kind as string, source_id: r.source_id as string | null, name: r.name as string, status: r.status as string, version: r.version as number, created_at: r.created_at as string, applied_at: r.applied_at as string | null, plan: JSON.parse(r.plan_json as string) as unknown, report: JSON.parse(r.report_json as string) as Record<string, unknown> };
  }

  list(projectId: string) {
    return (this.store.db.prepare('SELECT id, kind, name, status, created_at, applied_at, report_json FROM imports WHERE project_id=? ORDER BY created_at DESC').all(projectId) as Row[])
      .map((r) => ({ ...r, report: JSON.parse(r.report_json as string) as unknown }));
  }

  discard(id: string) {
    const r = this.get(id);
    if (r.status !== 'pending') throw new ConflictError('That import was already finished.');
    this.store.db.prepare("UPDATE imports SET status='discarded', applied_at=? WHERE id=?").run(nowIso(), id);
    return this.get(id);
  }

  /** Her changes to a pending plan: titles, joins, placements, what to leave out. Only these fields can change; the text never can. */
  edit(id: string, edits: ImportEdits, expectVersion?: number) {
    const r = this.get(id);
    if (r.status !== 'pending') throw new ConflictError('That import was already finished.');
    if (expectVersion !== undefined && r.version !== expectVersion) throw new ConflictError('This review changed in another window. Reload it.');
    const plan = r.plan as Record<string, unknown>;
    if (r.kind === 'manuscript') {
      const mp = plan as unknown as ManuscriptPlan;
      for (const c of mp.chapters) {
        const e = edits.chapters?.[c.key]; if (e) { if (e.title !== undefined) c.title = e.title.slice(0, 200); if (e.include !== undefined) c.include = e.include; if (e.joinPrevious !== undefined) c.joinPrevious = e.joinPrevious; }
        for (const sc of c.scenes) { const x = edits.scenes?.[sc.key]; if (x) { if (x.title !== undefined) sc.title = x.title.slice(0, 200); if (x.include !== undefined) sc.include = x.include; if (x.joinPrevious !== undefined) sc.joinPrevious = x.joinPrevious; } }
      }
    } else if (r.kind === 'document') {
      const dp = plan as unknown as DocumentPlan;
      if (edits.docDate !== undefined) { dp.docDate = edits.docDate; dp.dateFrom = 'you'; }
      for (const it of dp.items) {
        const e = edits.items?.[it.id]; if (!e || it.already) continue;
        if (e.include !== undefined) it.include = e.include;
        if (e.field !== undefined) it.field = e.field && /^[a-z][a-z0-9_]{0,63}$/.test(e.field) ? e.field : null;
        if (e.status !== undefined) it.status = e.status;
        if (e.arc !== undefined) it.arc = e.arc;
        if (e.elementId !== undefined) {
          if (e.elementId) { const el = this.brain.element(e.elementId, r.project_id); it.elementId = el.id as string; it.newElement = null; it.beatKey = null; }
          else { it.elementId = null; }
        }
      }
      for (const ne of dp.newElements) { const e = edits.newElements?.[ne.key]; if (e?.title) ne.title = e.title.slice(0, 200); if (e?.kind) ne.kind = e.kind; }
      for (const it of dp.items) if (it.newElement) it.newElement = dp.newElements.find((n) => n.key === it.newElement!.key) ?? it.newElement;
    } else if (r.kind === 'sheet') {
      const sp = plan as unknown as SheetPlan;
      if (edits.density !== undefined) { if (!sp.read.densities.includes(edits.density)) throw new ValidationError('That sheet has no columns for that many words per page.'); sp.density = edits.density; }
      if (edits.useCorrections !== undefined) sp.useCorrections = edits.useCorrections;
      if (edits.profileName !== undefined) sp.profileName = edits.profileName.slice(0, 120);
      if (edits.keepGuidance !== undefined) sp.keepGuidance = edits.keepGuidance;
    }
    this.store.db.prepare('UPDATE imports SET plan_json=?, version=version+1 WHERE id=?').run(JSON.stringify(plan), id);
    return this.get(id);
  }

  apply(id: string) {
    const r = this.get(id);
    if (r.kind === 'manuscript') return this.applyManuscript(id);
    if (r.kind === 'document') return this.applyDocument(id);
    return this.applySheet(id);
  }

  // ---------- manuscripts ----------

  async startManuscript(projectId: string, file: { name: string; data: Buffer }) {
    this.brain.project(projectId);
    const { blocks, format, warnings } = await readBlocks(file.name, file.data);
    const plan = planManuscript(blocks);
    return this.save(projectId, 'manuscript', file.name, null, plan, { format, warnings, findings: plan.findings, words: plan.totalWords });
  }

  /** Accept a manuscript plan: chapters and scenes are added after what is already there, as one undoable step, then checked. */
  applyManuscript(id: string) {
    const r = this.get(id);
    if (r.kind !== 'manuscript') throw new ValidationError('That is not a manuscript import.');
    if (r.status !== 'pending') throw new ConflictError('That import was already finished.');
    const pid = r.project_id as string;
    const plan = r.plan as ManuscriptPlan;
    const shape = finalShape(plan);
    if (!shape.length) throw new ValidationError('Nothing is selected to import.');
    const made: { chapterId: string; sceneIds: string[] }[] = [];
    this.store.batch({ projectId: pid, actor: 'author', reason: `Import manuscript "${r.name}"` }, () => {
      for (const c of shape) {
        const ch = this.ms.addChapter(pid, c.title || undefined);
        if (c.note) this.store.db.prepare('UPDATE chapters SET notes=? WHERE id=?').run(c.note, ch.id);
        const sceneIds: string[] = [];
        for (const s of c.scenes) sceneIds.push(this.ms.addScene(ch.id as string, { title: s.title, doc: blocksToDoc(s.blocks) }).id as string);
        made.push({ chapterId: ch.id as string, sceneIds });
      }
    });
    // Verify: the words in the novel now are exactly the words accepted.
    const got = made.flatMap((m) => m.sceneIds.map((sid) => this.ms.scene(sid).text as string)).join('\n\n');
    const want = expectedText(shape);
    const ok = got === want;
    const report = { ...r.report, chapters: made.length, scenes: made.reduce((a, m) => a + m.sceneIds.length, 0), words: made.reduce((a, m) => a + m.sceneIds.reduce((b, sid) => b + (this.ms.scene(sid).word_count as number), 0), 0), verified: ok, verification: ok ? 'Every character of the accepted text is in the novel.' : 'The text in the novel does not match the file exactly. Nothing was removed; compare the chapters before writing on.' };
    this.store.db.prepare("UPDATE imports SET status='applied', applied_at=?, report_json=? WHERE id=?").run(nowIso(), JSON.stringify(report), id);
    return { import: this.get(id), made, verified: ok };
  }

  // ---------- plotting spreadsheets ----------

  async startSheet(projectId: string, file: { name: string; data: Buffer }) {
    this.brain.project(projectId);
    if (!/\.xlsx$/i.test(file.name)) throw new ValidationError('Plotting sheets import from Excel workbooks (.xlsx). Save the sheet as .xlsx and try again.');
    let read: SheetRead;
    try { read = await readBeatSheet(file.data); } catch { throw new ValidationError('That workbook could not be read.'); }
    if (!read.beats.length) throw new ValidationError(read.flags[0] ?? 'No beats were found in that sheet.');
    const density = read.densities.includes(300) ? 300 : read.densities[0] ?? 300;
    // Suggested corrections for flagged numbers; she can keep the numbers as written instead.
    const corrections: Record<string, [number, number]> = {};
    for (const b of read.beats) for (const d of read.densities) {
      const pg = b.pages[String(d)], w = b.words[String(d)];
      const mine = b.flags.filter((f) => f.startsWith(`At ${d} `));
      if (pg && w && mine.length) corrections[`${b.row}@${d}`] = [mine.some((f) => f.includes('for the start')) ? pg[0] * d : w[0], mine.some((f) => f.includes('for the end')) ? pg[1] * d : w[1]];
    }
    const plan: SheetPlan = { read, density, useCorrections: true, corrections, profileName: file.name.replace(/\.xlsx$/i, ''), keepGuidance: true };
    const flagged = read.beats.reduce((a, b) => a + b.flags.length, 0);
    return this.save(projectId, 'sheet', file.name, null, plan, { beats: read.beats.length, matched: read.beats.filter((b) => b.key).length, densities: read.densities, flagged, findings: read.flags });
  }

  /** Accept a sheet: its placements become one of her placement profiles, and its teaching text sits with each beat. */
  applySheet(id: string) {
    const r = this.get(id);
    if (r.kind !== 'sheet') throw new ValidationError('That is not a spreadsheet import.');
    if (r.status !== 'pending') throw new ConflictError('That import was already finished.');
    const pid = r.project_id;
    const plan = r.plan as SheetPlan;
    const forDensity = Object.fromEntries(Object.entries(plan.corrections).filter(([k]) => k.endsWith(`@${plan.density}`)).map(([k, v]) => [Number(k.split('@')[0]), v]));
    const prof = profileFromSheet(plan.read, plan.density, plan.useCorrections ? forDensity : {});
    const key = `sheet-${id.slice(0, 8)}`;
    this.store.batch({ projectId: pid, actor: 'author', reason: `Import plotting sheet "${r.name}"` }, () => {
      if (!this.structure.beats(pid, 'save_the_cat').length) this.structure.applySaveTheCat(pid);
      if (prof) {
        const p = this.brain.project(pid);
        const list = ((p.profile.placement_profiles as unknown[]) ?? []) as { key: string }[];
        const entry = { key, template: 'save_the_cat', name: plan.profileName || r.name, source: `Your sheet "${r.name}" at ${plan.density} words per page${plan.useCorrections && Object.keys(forDensity).length ? ', with the flagged numbers corrected' : ''}`, at: prof.at, windows: prof.windows };
        this.brain.updateProject(pid, { profile: { ...p.profile, placement_profiles: [...list, entry] } });
      }
      if (plan.keepGuidance) {
        const beats = this.structure.beats(pid, 'save_the_cat');
        for (const b of plan.read.beats) {
          if (!b.key) continue;
          const el = beats.find((x) => x.attrs.template_key === b.key);
          if (!el) continue;
          const attrs = { ...el.attrs, sheet_guidance: { ...((el.attrs.sheet_guidance as Record<string, unknown>) ?? {}), [r.name]: { description: b.description, where: b.where, scene_type: b.sceneType } } };
          this.brain.updateElement(el.element.id as string, { attrs });
        }
      }
    });
    const report = { ...r.report, profile: prof ? key : null, profileName: plan.profileName, corrected: plan.useCorrections ? Object.keys(forDensity).length : 0 };
    this.store.db.prepare("UPDATE imports SET status='applied', applied_at=?, report_json=? WHERE id=?").run(nowIso(), JSON.stringify(report), id);
    return { import: this.get(id) };
  }

  // ---------- planning documents ----------

  async startDocument(projectId: string, file: { name: string; data: Buffer; kind?: 'story_bible' | 'archive' | 'document'; madeAt?: string | null }) {
    const p = this.brain.project(projectId);
    const st = settingsOf(p.profile);
    const { blocks, warnings, modified } = await readBlocks(file.name, file.data);
    const passages = readPassages(blocks, st.importLabels);
    if (!passages.length) throw new ValidationError('No text was found in that document.');
    const named = dateFromName(file.name);
    const docDate = file.madeAt ?? named ?? modified ?? null;
    const dateFrom = file.madeAt ? 'you' : named ? 'file name' : modified ? 'file properties' : null;

    // The same document imported again reuses its source and passages, so nothing is added twice.
    const kind = file.kind ?? 'story_bible';
    let src = this.store.db.prepare('SELECT * FROM sources WHERE project_id=? AND kind=? AND name=?').get(projectId, kind, file.name) as Row | undefined;
    const isRepeat = !!src;
    if (!src) src = this.brain.addSource(projectId, { kind, name: file.name, madeAt: docDate, notes: 'Imported document. Every passage is kept word for word.' }) as Row;
    const sourceId = src.id as string;
    const excerptIds = new Map<string, string>();
    let newPassages = 0;
    this.store.batch({ projectId, actor: 'author', reason: `Keep the passages of "${file.name}"` }, (w) => {
      for (const ps of passages) {
        const found = this.store.db.prepare('SELECT id FROM excerpts WHERE source_id=? AND text_hash=?').get(sourceId, ps.hash) as Row | undefined;
        if (found) { excerptIds.set(ps.key, found.id as string); continue; }
        const x = w.insert('excerpts', { source_id: sourceId, locator: `${ps.path.join(' > ')}${ps.path.length ? ', ' : ''}paragraph ${ps.position}`, text: ps.full });
        this.store.db.prepare('UPDATE excerpts SET attrs_json=?, position=?, text_hash=? WHERE id=?').run(JSON.stringify({ label: ps.label, status: ps.status, path: ps.path, part: ps.key, passage: ps.text }), ps.position, ps.hash, x.id);
        excerptIds.set(ps.key, x.id as string);
        newPassages++;
      }
    });

    const plan = this.placeDocument(projectId, passages, excerptIds, sourceId, docDate, dateFrom as DocumentPlan['dateFrom']);
    if (!docDate) plan.findings.unshift('The document has no date. Set one before applying, so your later decisions stay ahead of it.');
    if (isRepeat) plan.findings.unshift(`This document was imported before. ${newPassages ? `${newPassages} passage${newPassages === 1 ? ' is' : 's are'} new or changed.` : 'Nothing in it has changed.'} Passages already in your records are skipped.`);
    const counts = countStatuses(passages);
    return this.save(projectId, 'document', file.name, sourceId, plan, { warnings, passages: passages.length, newPassages, counts, findings: plan.findings });
  }

  private placeDocument(pid: string, passages: Passage[], excerptIds: Map<string, string>, sourceId: string, docDate: string | null, dateFrom: DocumentPlan['dateFrom']): DocumentPlan {
    const elements = this.brain.elements(pid).filter((e) => !['thought', 'guardrail', 'scene_plan', 'question', 'idea', 'line', 'arc'].includes(e.kind as string));
    const beats = this.structure.beats(pid, 'save_the_cat');
    const newElements: DocumentPlan['newElements'] = [];
    const findings: string[] = [];
    const ambiguous = new Set<string>();

    // Which headings name something: an existing record, a beat, or (if it reads like a name in a characters section) a new character.
    const subtree = (i: number) => passages.slice(i).filter((p) => p.path[0] === passages[i]!.path[0]);
    const headingTarget = new Map<string, { elementId?: string; beatKey?: string; newKey?: string; kind: string; depth: number }>();
    const consider = (heading: string, depth: number, firstIndex: number, path: string[]) => {
      const key = path.slice(0, depth + 1).join(' > ');
      if (headingTarget.has(key)) return;
      const h = low(heading).replace(/^\s*\d+\s*[|.)]\s*/, '');
      const beat = SAVE_THE_CAT.find((d) => h === low(d.name) || h.startsWith(low(d.name) + ' ') || h.startsWith(low(d.name) + ' ('));
      if (beat) {
        const el = beats.find((b) => b.attrs.template_key === beat.key);
        headingTarget.set(key, { elementId: el?.element.id as string | undefined, beatKey: beat.key, kind: 'beat', depth });
        return;
      }
      const matches = elements.filter((e) => {
        const t = low(e.title as string);
        if (h === t) return true;
        if (e.kind === 'character') {
          const strip = (x: string) => x.replace(/^(miss|mr\.?|mrs\.?|ms\.?|dr\.?)\s+/, '').split(/\s+/);
          const words = strip(h), tw = strip(t);
          if (nameLike(heading) && (words[0] === tw[0] || words.join(' ').startsWith(tw.join(' ')))) return true;
          const full = tw.join(' ');
          return [full, tw[0]!].some((n) => n.length >= 3 && (h.startsWith(n + ':') || h.startsWith(n + "'s ") || h.startsWith(n + ' ') && /^[^:]{0,40}:/.test(h.slice(n.length)) && h.slice(0, h.indexOf(':')).split(' ').length <= 3));
        }
        if (e.kind === 'location' || e.kind === 'set_piece') return h.startsWith(t + ' ') || h.startsWith(t + ':');
        return false;
      });
      if (matches.length === 1) { headingTarget.set(key, { elementId: matches[0]!.id as string, kind: matches[0]!.kind as string, depth }); return; }
      if (matches.length > 1) { ambiguous.add(heading); return; }
      const ctx = low(path.join(' ') + ' ' + subtree(firstIndex).flatMap((p) => p.path).join(' '));
      if (nameLike(heading) && depth === 0 && /\b(arc|lie|ghost|values|ambition|ingermanson|weiland)\b/.test(ctx)) {
        const nk = `new-${newElements.length + 1}`;
        newElements.push({ key: nk, kind: 'character', title: heading.replace(/^(Miss|Mr\.?|Mrs\.?|Ms\.?|Dr\.?)\s+/, '').trim() });
        headingTarget.set(key, { newKey: nk, kind: 'character', depth });
        return;
      }
      if (depth >= 1 && /set piece/i.test(path[0] ?? '') && heading.split(/\s+/).length <= 8) {
        const nk = `new-${newElements.length + 1}`;
        newElements.push({ key: nk, kind: 'set_piece', title: heading });
        headingTarget.set(key, { newKey: nk, kind: 'set_piece', depth });
      }
    };
    passages.forEach((p, i) => p.path.forEach((h, d) => consider(h, d, i, p.path)));

    const arcFields = this.brain.fieldsFor(pid, 'arc', { all: true }).map((f) => ({ field: f.field, label: f.label }));
    const items: ImportItem[] = [];
    const essenceTaken = new Set<string>();
    let n = 0;
    for (const p of passages) {
      const excerptId = excerptIds.get(p.key)!;
      // The deepest heading that names something decides where the passage belongs.
      let target: { elementId?: string; beatKey?: string; newKey?: string; kind: string; depth: number } | null = null;
      for (let d = p.path.length - 1; d >= 0; d--) { const t = headingTarget.get(p.path.slice(0, d + 1).join(' > ')); if (t) { target = t; break; } }
      const base = { passage: p.key, excerptId, path: p.path, label: p.label, status: p.status, already: false, note: '' };
      const push = (field: string | null, text: string, arc: boolean, include: boolean, note = '') => items.push({
        id: `i${++n}`, ...base, text, elementId: target?.elementId ?? null, newElement: target?.newKey ? newElements.find((x) => x.key === target!.newKey) ?? null : null,
        beatKey: target?.beatKey ?? null, arc, field, include, note,
      });
      if (!target) { push(null, p.text, false, false); continue; }
      const direct = p.path.length - 1 === target.depth;
      const sub = p.path[p.path.length - 1] ?? '';
      if (target.kind === 'beat') {
        const field = p.status === 'illustrative' ? 'example' : p.status === 'proposed' ? 'execution' : p.status === 'unlabeled' ? null : 'event';
        push(field, p.text, false, field !== null);
        continue;
      }
      if (target.kind === 'character') {
        const charFields = this.brain.fieldsFor(pid, 'character', { all: true }).map((f) => ({ field: f.field, label: f.label }));
        const pieces = splitByFields(p.text, [...charFields, ...arcFields]);
        if (pieces.length) {
          for (const piece of pieces) {
            const before = items.length;
            push(piece.field, piece.text, arcFields.some((a) => a.field === piece.field) && !charFields.some((c) => c.field === piece.field), true,
              piece.status ? '' : p.status === 'unlabeled' ? 'No label in the document; it comes in as Developing. Change it if it is more or less settled.' : '');
            const it = items[before]!;
            if (piece.status) it.status = piece.status;
            else if (p.status === 'unlabeled') it.status = 'developing';
          }
          continue;
        }
        if (p.status === 'unanswered') {
          // A hand-off ("Over to me: name Kevin's Lie…") opens a slot in each field its section names, with her prompt kept as the note.
          const named = splitHeadingFields(sub, [...charFields, ...arcFields]);
          if (named.length) { for (const f of named) push(f, p.text, arcFields.some((a) => a.field === f) && !charFields.some((c) => c.field === f), true, 'Your prompt is kept with the open slot.'); continue; }
        }
        if (direct && p.status !== 'unlabeled') {
          // The first description is "who they are"; later decided facts sit beside it rather than replacing it.
          const key = target.elementId ?? target.newKey!;
          const taken = essenceTaken.has(key) || (!!target.elementId && !!this.brain.field(target.elementId, 'essence').latest);
          essenceTaken.add(key);
          push(taken ? 'facts' : 'essence', p.text, false, true);
          continue;
        }
        push(null, p.text, false, false, direct ? '' : 'Craft teaching or a working note. It stays in the document unless you place it.');
        continue;
      }
      const field = target.kind === 'set_piece' ? 'shape' : target.kind === 'location' ? 'description' : 'description';
      push(field, p.text, false, p.status !== 'unlabeled');
    }

    // Already in her records from an earlier import: skipped, never added twice or promoted.
    for (const it of items) {
      const prior = this.store.db.prepare('SELECT COUNT(*) AS n FROM statements WHERE excerpt_id=? AND deleted_at IS NULL').get(it.excerptId) as { n: number };
      if (prior.n > 0) { it.already = true; it.include = false; it.note = 'Already in your records from an earlier import.'; }
    }
    // Her later decisions stay ahead of an older document; a newer document never silently replaces her decision.
    for (const it of items) {
      if (!it.include || !it.elementId || !it.field || it.status !== 'established' || it.arc) continue;
      const v = this.brain.field(it.elementId, it.field);
      const cur = v.current as Row | null;
      if (!cur || cur.source_id === sourceId) continue;
      const curSource = cur.source_id ? this.store.get('sources', cur.source_id as string) : null;
      if (docDate && (cur.made_at as string) > docDate) it.note = `${curSource ? `"${curSource.name as string}"` : 'You'} decided this later. That later decision stays current; this one is kept as history.`;
      else if (curSource && docDate) it.note = `Newer than "${curSource.name as string}". This becomes current; the older one is kept as history.`;
      else { it.include = false; it.note = 'This document may be newer than a decision you made here yourself. Choose which stands before including it.'; }
    }
    if (ambiguous.size) findings.push(`Headings that match more than one record, left for you to place: ${[...ambiguous].slice(0, 6).join(', ')}.`);
    const beatHits = items.filter((i) => i.beatKey && !i.elementId).length;
    if (beatHits) findings.push('This document follows the Save the Cat beats. Applying will turn the beats on for this novel so these passages have a home.');
    return { sourceId, docDate, dateFrom, items, newElements, findings };
  }

  /** Apply a document plan. One undoable step; each statement keeps its source passage and her label. */
  applyDocument(id: string) {
    const r = this.get(id);
    if (r.kind !== 'document') throw new ValidationError('That is not a document import.');
    if (r.status !== 'pending') throw new ConflictError('That import was already finished.');
    const pid = r.project_id as string;
    const plan = r.plan as DocumentPlan;
    const src = this.store.get('sources', plan.sourceId)!;
    const chosen = plan.items.filter((i) => i.include && !i.already && i.field && (i.elementId || i.newElement || i.beatKey));
    const madeAt = plan.docDate ?? (src.made_at as string | null) ?? nowIso();
    const counts: Record<string, number> = {};
    this.store.batch({ projectId: pid, actor: 'author', reason: `Import "${r.name}"` }, () => {
      if (plan.docDate && plan.docDate !== src.made_at) this.store.db.prepare('UPDATE sources SET made_at=? WHERE id=?').run(plan.docDate, plan.sourceId);
      if (chosen.some((i) => i.beatKey && !i.elementId)) this.structure.applySaveTheCat(pid);
      const beatIds = Object.fromEntries(this.structure.beats(pid, 'save_the_cat').map((b) => [b.attrs.template_key as string, b.element.id as string]));
      const created = new Map<string, string>();
      const arcs = new Map<string, string>();
      for (const it of chosen) {
        let elementId = it.elementId ?? (it.beatKey ? beatIds[it.beatKey] : null) ?? null;
        if (!elementId && it.newElement) {
          elementId = created.get(it.newElement.key) ?? null;
          if (!elementId) {
            elementId = this.brain.createElement(pid, { kind: it.newElement.kind, title: it.newElement.title, attrs: { imported_from: r.name, source_id: plan.sourceId } }).id as string;
            created.set(it.newElement.key, elementId);
          }
        }
        if (!elementId) continue;
        if (it.arc) {
          let arcId = arcs.get(elementId) ?? (this.store.db.prepare("SELECT id FROM elements WHERE parent_id=? AND kind='arc' AND deleted_at IS NULL ORDER BY created_at LIMIT 1").get(elementId) as Row | undefined)?.id as string | undefined;
          if (!arcId) arcId = this.brain.createElement(pid, { kind: 'arc', title: `${this.brain.element(elementId).title as string}'s arc`, parentId: elementId }).id as string;
          arcs.set(elementId, arcId);
          elementId = arcId;
        }
        const status = it.status === 'unlabeled' ? 'developing' : it.status;
        const open = status === 'unanswered';
        this.brain.addStatement({
          elementId, field: it.field!, value: open ? null : it.text, status, speaker: { kind: 'source', name: r.name as string },
          sourceId: plan.sourceId, excerptId: it.excerptId, madeAt,
          note: open ? it.text : (it.label ? `Labeled "${it.label}" in ${r.name}` : `From ${r.name}`),
          qualifiers: { import_label: it.label, imported_at: nowIso() },
        });
        counts[status] = (counts[status] ?? 0) + 1;
      }
    });
    const report = { ...r.report, applied: chosen.length, appliedByStatus: counts, leftInDocument: plan.items.filter((i) => !i.include && !i.already).length, skipped: plan.items.filter((i) => i.already).length, flagged: plan.items.filter((i) => /Choose which stands/.test(i.note)).length };
    this.store.db.prepare("UPDATE imports SET status='applied', applied_at=?, report_json=? WHERE id=?").run(nowIso(), JSON.stringify(report), id);
    return { import: this.get(id) };
  }

  /** A source document with every passage, its label, and what it became. */
  source(sourceId: string) {
    const src = this.store.get('sources', sourceId);
    if (!src) throw new NotFoundError('source');
    const rows = this.store.db.prepare('SELECT * FROM excerpts WHERE source_id=? ORDER BY position, created_at').all(sourceId) as Row[];
    const used = new Map<string, Row[]>();
    for (const s of this.store.db.prepare(`SELECT s.id, s.excerpt_id, s.field, s.status, e.id AS element_id, e.title AS element_title, e.kind AS element_kind FROM statements s JOIN elements e ON e.id=s.element_id WHERE s.source_id=? AND s.deleted_at IS NULL`).all(sourceId) as Row[]) {
      used.set(s.excerpt_id as string, [...(used.get(s.excerpt_id as string) ?? []), s]);
    }
    return { source: src, passages: rows.map((x) => ({ ...x, attrs: JSON.parse((x.attrs_json as string) || '{}') as Record<string, unknown>, became: used.get(x.id as string) ?? [] })) };
  }

  sources(projectId: string) {
    return this.store.db.prepare("SELECT s.*, (SELECT COUNT(*) FROM excerpts x WHERE x.source_id=s.id) AS passages FROM sources s WHERE s.project_id=? AND s.kind <> 'conversation' ORDER BY s.created_at DESC").all(projectId) as Row[];
  }
}

function countStatuses(passages: Passage[]) {
  const c: Record<string, number> = {};
  for (const p of passages) c[p.status] = (c[p.status] ?? 0) + 1;
  return c;
}

/** "Weiland Arc: Lie, Ghost, Want, Need" names the fields lie, ghost, want and need. */
function splitHeadingFields(heading: string, fields: { field: string; label: string }[]) {
  const tail = heading.includes(':') ? heading.slice(heading.indexOf(':') + 1) : '';
  if (!tail) return [];
  const names = tail.split(/,|\band\b/).map((x) => low(x).trim()).filter(Boolean);
  const out: string[] = [];
  for (const n of names) {
    const f = fields.find((x) => low(x.label) === n || low(x.field.replace(/_/g, ' ')) === n);
    if (f && !out.includes(f.field)) out.push(f.field);
  }
  return out.length === names.length ? out : [];
}

export { docToText };
