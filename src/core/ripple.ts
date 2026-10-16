// The Ripple Effect: before anything moves, show what the move would affect, and why.
// Findings are review items and never edit the story (R-C-075 to R-C-082).
//
// The story's order is built from the manuscript (scenes in chapter order) with planned scene cards that
// have no prose yet slotted in by their decided beat. Every element anchored in a scene (its plan, the
// events and reveals that appear in it, its viewpoint character) gets a position. Ordering rules are
// checked on the current order and on the proposed order; the difference is what the move changes.

import { Store, Row, ValidationError, NotFoundError } from './store.js';
import { Brain } from './brain.js';
import { Manuscript } from './manuscript.js';
import { Structure } from './structure.js';

export type Op =
  | { type: 'moveScene'; sceneId: string; chapterId: string; index: number }
  | { type: 'moveCard'; planId: string; beatId: string | null; beforePlanId?: string | null }
  | { type: 'moveElement'; elementId: string; fromPlanId: string; toPlanId: string };

interface Unit { key: string; sceneId: string | null; planId: string | null; title: string; beatId: string | null; pos: number }
interface World { units: Unit[]; anchorMove: { elementId: string; from: string; to: string }[]; beatOf: Map<string, string | null> }

export interface Finding {
  key: string;
  rule: string;
  severity: 'question' | 'note';
  message: string;
  elements: { id: string; title: string }[];
}

const ANCHOR_IN = new Set(['appears_in', 'realizes', 'part_of']);   // element -> plan
const ANCHOR_OUT = new Set(['contains', 'reveals']);                  // plan -> element
const ORDER_AFTER: Record<string, string> = { causes: 'is caused by', enables: 'is made possible by', motivates: 'is motivated by' };
const FOLLOW = new Set(['causes', 'enables', 'motivates', 'depends_on', 'plants', 'pays_off', 'foreshadows', 'reveals', 'conceals', 'raises', 'answers', 'knows', 'suspects', 'believes_falsely', 'appears_in', 'realizes', 'contains']);

export class Ripple {
  constructor(private store: Store, private brain: Brain, private ms: Manuscript, private structure: Structure) {}

  // ---------- building the story's order ----------
  private world(projectId: string, op?: Op): World {
    const beats = this.structure.beats(projectId);
    const beatRank = new Map<string, number>();
    beats.forEach((b, i) => beatRank.set(b.element.id as string, b.element.parent_id ? (beatRank.get(b.element.parent_id as string) ?? i) + 0.5 : i));
    const outline = this.ms.outline(projectId).map((c) => ({ id: c.id as string, scenes: c.scenes.map((s) => ({ id: s.id as string, title: s.title as string, plan: (s.plan_element_id as string | null) ?? null })) }));
    const plans = this.brain.elements(projectId, { kind: 'scene_plan' });
    const beatOf = new Map<string, string | null>(plans.map((p) => [p.id as string, this.structure.decidedBeat(p.id as string)]));
    const sortOf = new Map<string, number>(plans.map((p) => [p.id as string, p.sort_key as number]));
    const anchorMove: World['anchorMove'] = [];

    if (op?.type === 'moveScene') {
      const from = outline.find((c) => c.scenes.some((s) => s.id === op.sceneId));
      const to = outline.find((c) => c.id === op.chapterId);
      if (!from || !to) throw new NotFoundError('scene or chapter');
      const sc = from.scenes.find((s) => s.id === op.sceneId)!;
      from.scenes = from.scenes.filter((s) => s.id !== op.sceneId);
      to.scenes.splice(Math.max(0, Math.min(op.index, to.scenes.length)), 0, sc);
    } else if (op?.type === 'moveCard') {
      beatOf.set(op.planId, op.beatId);
      if (op.beforePlanId) sortOf.set(op.planId, (sortOf.get(op.beforePlanId) ?? 0) - 0.5);
    } else if (op?.type === 'moveElement') {
      anchorMove.push({ elementId: op.elementId, from: op.fromPlanId, to: op.toPlanId });
    }

    const units: Unit[] = [];
    const inManuscript = new Set<string>();
    for (const c of outline) for (const s of c.scenes) {
      if (s.plan) inManuscript.add(s.plan);
      units.push({ key: s.id, sceneId: s.id, planId: s.plan, title: s.title, beatId: s.plan ? beatOf.get(s.plan) ?? null : null, pos: 0 });
    }
    // Cards with no prose yet are placed by their decided beat; cards with no beat have no position at all (R-C-012).
    const pending = plans.filter((p) => !inManuscript.has(p.id as string) && beatOf.get(p.id as string))
      .sort((a, b) => (beatRank.get(beatOf.get(a.id as string)!) ?? 0) - (beatRank.get(beatOf.get(b.id as string)!) ?? 0) || (sortOf.get(a.id as string)! - sortOf.get(b.id as string)!));
    for (const p of pending) {
      const r = beatRank.get(beatOf.get(p.id as string)!) ?? 0;
      let at = units.length;
      for (let i = units.length - 1; i >= 0; i--) { const ub = units[i]!.beatId; if (ub && (beatRank.get(ub) ?? -1) <= r) { at = i + 1; break; } if (i === 0) at = 0; }
      if (!units.length) at = 0;
      units.splice(at, 0, { key: p.id as string, sceneId: null, planId: p.id as string, title: p.title as string, beatId: beatOf.get(p.id as string)!, pos: 0 });
    }
    units.forEach((u, i) => (u.pos = (i + 1) * 10));
    return { units, anchorMove, beatOf };
  }

  /** Every element's position in the story (the earliest scene it is anchored in). */
  private positions(projectId: string, w: World) {
    const links = this.brain.links(projectId);
    const unitOfPlan = new Map(w.units.filter((u) => u.planId).map((u) => [u.planId!, u]));
    const pos = new Map<string, number>();
    const where = new Map<string, Unit[]>();
    const anchor = (id: string, u: Unit | undefined) => {
      if (!u) return;
      if (!pos.has(id) || pos.get(id)! > u.pos) pos.set(id, u.pos);
      where.set(id, [...(where.get(id) ?? []), u]);
    };
    for (const u of w.units) if (u.planId) anchor(u.planId, u);
    for (const l of links) {
      let from = l.from_id as string, to = l.to_id as string;
      const moved = w.anchorMove.find((m) => (m.elementId === from && m.from === to) || (m.elementId === to && m.from === from));
      if (moved) { if (moved.elementId === from) to = moved.to; else from = moved.to; }
      if (ANCHOR_IN.has(l.relation as string)) anchor(from, unitOfPlan.get(to));
      if (ANCHOR_OUT.has(l.relation as string)) anchor(to, unitOfPlan.get(from));
    }
    // Scene viewpoint characters are present in their scenes.
    const povs = this.store.db.prepare('SELECT id, pov_element_id FROM scenes WHERE project_id=? AND deleted_at IS NULL AND pov_element_id IS NOT NULL').all(projectId) as Row[];
    for (const s of povs) anchor(s.pov_element_id as string, w.units.find((u) => u.sceneId === s.id));
    // Events placed on a beat but not in any scene sit at that beat.
    for (const e of this.brain.elements(projectId).filter((x) => ['event', 'reveal', 'clue', 'payoff'].includes(x.kind as string) && !pos.has(x.id as string))) {
      const beat = this.structure.decidedBeat(e.id as string);
      const u = beat ? w.units.find((x) => x.beatId === beat) : undefined;
      if (u) anchor(e.id as string, u);
    }
    return { pos, where, links };
  }

  // ---------- the rules ----------
  private analyze(projectId: string, w: World): Finding[] {
    const { pos, where, links } = this.positions(projectId, w);
    const title = (id: string) => (this.store.get('elements', id)?.title as string) ?? 'something';
    const el = (id: string) => ({ id, title: title(id) });
    const out: Finding[] = [];
    const add = (f: Finding) => { if (!out.some((x) => x.key === f.key)) out.push(f); };
    const has = (id: string) => pos.has(id);

    for (const l of links) {
      const a = l.from_id as string, b = l.to_id as string, rel = l.relation as string;
      if (ORDER_AFTER[rel] && has(a) && has(b) && pos.get(a)! > pos.get(b)!) {
        add({ key: `order:${rel}:${a}:${b}`, rule: 'cause before effect', severity: 'question', elements: [el(a), el(b)],
          message: `"${title(b)}" ${ORDER_AFTER[rel]} "${title(a)}", but would now come first in the book. Readers would meet the effect before the cause. Is that a deliberate flashback?` });
      }
      if (rel === 'depends_on' && has(a) && has(b) && pos.get(a)! < pos.get(b)!) {
        add({ key: `order:depends:${a}:${b}`, rule: 'dependency', severity: 'question', elements: [el(a), el(b)],
          message: `"${title(a)}" depends on "${title(b)}", which would now come later.` });
      }
      if (rel === 'foreshadows' && has(a) && has(b) && pos.get(a)! >= pos.get(b)!) {
        add({ key: `order:foreshadow:${a}:${b}`, rule: 'foreshadowing', severity: 'question', elements: [el(a), el(b)],
          message: `"${title(a)}" foreshadows "${title(b)}" but would no longer come before it.` });
      }
    }
    // Setups and payoffs: every plant of something should come before its first payoff.
    const plantsOf = new Map<string, string[]>(), payoffsOf = new Map<string, string[]>();
    for (const l of links) {
      if (l.relation === 'plants') plantsOf.set(l.to_id as string, [...(plantsOf.get(l.to_id as string) ?? []), l.from_id as string]);
      if (l.relation === 'pays_off') payoffsOf.set(l.to_id as string, [...(payoffsOf.get(l.to_id as string) ?? []), l.from_id as string]);
    }
    for (const [thing, planters] of plantsOf) {
      const firstPay = Math.min(...(payoffsOf.get(thing) ?? []).filter(has).map((p) => pos.get(p)!));
      for (const p of planters) if (has(p) && Number.isFinite(firstPay) && pos.get(p)! >= firstPay) {
        const payer = (payoffsOf.get(thing) ?? []).find((x) => pos.get(x) === firstPay)!;
        add({ key: `plant:${p}:${thing}`, rule: 'setup before payoff', severity: 'question', elements: [el(p), el(thing), el(payer)],
          message: `The setup "${title(p)}" for "${title(thing)}" would now come after its payoff in "${title(payer)}".` });
      }
    }
    // Questions the story raises should not be answered before they are raised.
    const raised = new Map<string, number>(), answered = new Map<string, { at: number; by: string }>();
    for (const l of links) {
      const q = l.to_id as string, by = l.from_id as string;
      if (!has(by)) continue;
      if (l.relation === 'raises' && (!raised.has(q) || raised.get(q)! > pos.get(by)!)) raised.set(q, pos.get(by)!);
      if (l.relation === 'answers' && (!answered.has(q) || answered.get(q)!.at > pos.get(by)!)) answered.set(q, { at: pos.get(by)!, by });
    }
    for (const [q, a] of answered) if (raised.has(q) && a.at < raised.get(q)!) {
      add({ key: `qa:${q}`, rule: 'raised before answered', severity: 'question', elements: [el(q), el(a.by)], message: `"${title(q)}" would be answered in "${title(a.by)}" before the story raises it.` });
    }
    // Knowledge: a character should not act on something before learning it (R-C-063).
    for (const l of links.filter((x) => x.relation === 'knows')) {
      const who = l.from_id as string, fact = l.to_id as string;
      const present = (u: Unit) => (where.get(who) ?? []).some((x) => x.key === u.key);
      const revealUnits = links.filter((x) => (x.relation === 'reveals' && x.to_id === fact)).map((x) => w.units.find((u) => u.planId === x.from_id)).filter(Boolean) as Unit[];
      const learn = Math.min(...revealUnits.filter(present).map((u) => u.pos));
      if (!Number.isFinite(learn)) continue;
      const uses = links.filter((x) => x.relation === 'depends_on' && x.to_id === fact).map((x) => w.units.find((u) => u.planId === x.from_id)).filter((u): u is Unit => !!u && present(u));
      for (const u of uses) if (u.pos < learn) {
        // The more specific knowledge question replaces the general dependency one for the same scene and fact.
        const dup = out.findIndex((f) => f.key === `order:depends:${u.planId}:${fact}`);
        if (dup >= 0) out.splice(dup, 1);
        add({ key: `know:${who}:${fact}:${u.key}`, rule: 'acting before knowing', severity: 'question', elements: [el(who), el(fact)],
          message: `${title(who)} would act on "${title(fact)}" in "${u.title}" before learning it.` });
      }
    }
    // Beat order: scenes whose decided beats run backwards.
    const beats = this.structure.beats(projectId);
    const rank = new Map(beats.map((b, i) => [b.element.id as string, b.element.parent_id ? beats.findIndex((x) => x.element.id === b.element.parent_id) + 0.5 : i]));
    let prev: Unit | null = null;
    for (const u of w.units) {
      if (!u.beatId) continue;
      if (prev && (rank.get(u.beatId) ?? 0) < (rank.get(prev.beatId!) ?? 0)) {
        add({ key: `beat:${prev.key}:${u.key}`, rule: 'beat order', severity: 'note', elements: [{ id: u.planId ?? u.key, title: u.title }, { id: prev.planId ?? prev.key, title: prev.title }],
          message: `"${u.title}" (${title(u.beatId)}) would come after "${prev.title}" (${title(prev.beatId!)}), which is a later beat.` });
      }
      prev = u;
    }
    return out;
  }

  /** What a single element touches: its direct connections, and one step further along cause and dependency. */
  private connected(projectId: string, ids: string[]) {
    const links = this.brain.links(projectId);
    const title = (id: string) => (this.store.get('elements', id)?.title as string) ?? '';
    const seen = new Set(ids);
    const out: { id: string; title: string; kind: string; path: string; strength: 'direct' | 'follows from' }[] = [];
    const step = (from: string[], strength: 'direct' | 'follows from', only?: Set<string>) => {
      const next: string[] = [];
      for (const id of from) for (const l of links) {
        const rel = l.relation as string;
        if (!FOLLOW.has(rel) || (only && !only.has(rel))) continue;
        const other = l.from_id === id ? (l.to_id as string) : l.to_id === id ? (l.from_id as string) : null;
        if (!other || seen.has(other)) continue;
        seen.add(other); next.push(other);
        const e = this.store.get('elements', other);
        if (!e || e.deleted_at) continue;
        const phrase = l.from_id === id ? `${title(id)} ${rel.replace(/_/g, ' ')} ${title(other)}` : `${title(other)} ${rel.replace(/_/g, ' ')} ${title(id)}`;
        out.push({ id: other, title: e.title as string, kind: e.kind as string, path: phrase, strength });
      }
      return next;
    };
    const first = step(ids, 'direct');
    step(first, 'follows from', new Set(['causes', 'enables', 'motivates', 'depends_on', 'pays_off', 'plants']));
    return out;
  }

  private anchoredIn(projectId: string, w: World, unitKeys: string[]) {
    const { where } = this.positions(projectId, w);
    const ids: string[] = [];
    for (const [id, us] of where) if (us.some((u) => unitKeys.includes(u.key))) ids.push(id);
    return ids;
  }

  /** Preview a move: nothing is saved. Shows new questions, questions it would settle, what moves, and what it touches. */
  preview(projectId: string, op: Op) {
    this.brain.project(projectId);
    const now = this.world(projectId), next = this.world(projectId, op);
    const before = this.analyze(projectId, now), after = this.analyze(projectId, next);
    const movedKeys = this.movedUnits(now, next, op);
    const subject = op.type === 'moveElement' ? [op.elementId] : this.anchoredIn(projectId, now, movedKeys);
    const shifts = this.shifts(projectId, now, next, subject);
    const touches = this.connected(projectId, subject).filter((t) => !subject.includes(t.id));
    return {
      op,
      newQuestions: after.filter((f) => !before.some((b) => b.key === f.key)),
      settled: before.filter((f) => !after.some((a) => a.key === f.key)),
      stillOpen: after.filter((f) => before.some((b) => b.key === f.key)),
      moves: shifts,
      touches,
      changesNothingYet: true,
    };
  }

  private movedUnits(now: World, next: World, op: Op): string[] {
    if (op.type === 'moveScene') return [op.sceneId];
    if (op.type === 'moveCard') return [now.units.find((u) => u.planId === op.planId)?.key ?? op.planId];
    return [];
  }

  private shifts(projectId: string, now: World, next: World, ids: string[]) {
    const a = this.positions(projectId, now).where, b = this.positions(projectId, next).where;
    const beatTitle = (id: string | null) => (id ? (this.store.get('elements', id)?.title as string) : null);
    const idx = (w: World, u?: Unit) => (u ? w.units.findIndex((x) => x.key === u.key) + 1 : null);
    return ids.map((id) => {
      const u0 = (a.get(id) ?? [])[0], u1 = (b.get(id) ?? [])[0];
      return { id, title: (this.store.get('elements', id)?.title as string) ?? '', from: u0 ? { scene: u0.title, position: idx(now, u0), beat: beatTitle(u0.beatId) } : null, to: u1 ? { scene: u1.title, position: idx(next, u1), beat: beatTitle(u1.beatId) } : null, of: next.units.length };
    }).filter((s) => JSON.stringify(s.from) !== JSON.stringify(s.to));
  }

  /** Make the move as one undoable step, and return the review list (R-C-076). */
  commit(projectId: string, op: Op) {
    const review = this.preview(projectId, op);
    this.store.batch({ projectId, actor: 'author', reason: describe(this.store, op) }, () => {
      if (op.type === 'moveScene') this.ms.moveScene(op.sceneId, op.chapterId, op.index);
      else if (op.type === 'moveCard') {
        if (op.beatId) this.structure.place(op.planId, op.beatId, 'decide');
        else { const cur = this.brain.field(op.planId, 'beat').current; if (cur) this.brain.setStatementStatus(cur.id as string, 'developing'); }
        if (op.beforePlanId) { const before = this.brain.element(op.beforePlanId); this.brain.updateElement(op.planId, { sortKey: (before.sort_key as number) - 0.5 }); }
      } else {
        const links = this.brain.links(projectId).filter((l) => (l.from_id === op.elementId && l.to_id === op.fromPlanId && ANCHOR_IN.has(l.relation as string)) || (l.to_id === op.elementId && l.from_id === op.fromPlanId && ANCHOR_OUT.has(l.relation as string)));
        if (!links.length) throw new ValidationError('That element is not in that scene.');
        for (const l of links) {
          this.brain.unlink(l.id as string);
          if (l.from_id === op.elementId) this.brain.link(projectId, { fromId: op.elementId, toId: op.toPlanId, relation: l.relation as never });
          else this.brain.link(projectId, { fromId: op.toPlanId, toId: op.elementId, relation: l.relation as never });
        }
      }
    });
    return { ...review, committed: true, batch: this.store.history(projectId)[0] };
  }

  /** All open structural questions right now (for Choices Ahead and the review list). */
  current(projectId: string) { return this.analyze(projectId, this.world(projectId)); }

  /** The story's order as Narrative Zoom and the board see it. */
  order(projectId: string) { return this.world(projectId).units.map((u, i) => ({ ...u, index: i + 1 })); }

  // ---------- alternate structures (D-17): saved, compared, adopted or discarded ----------
  saveAlternate(projectId: string, name: string, ops: Op[], note = '') {
    this.brain.project(projectId);
    if (!name.trim()) throw new ValidationError('Give the alternate a name.');
    for (const op of ops) this.world(projectId, op); // validates
    return this.store.batch({ projectId, actor: 'author', reason: `Save alternate structure "${name}"` }, (w) =>
      w.insert('arrangements', { project_id: projectId, name: name.trim(), note, kind: 'plan', order_json: JSON.stringify({ ops }) }));
  }

  alternates(projectId: string) {
    return (this.store.db.prepare('SELECT * FROM arrangements WHERE project_id=? AND deleted_at IS NULL ORDER BY created_at DESC').all(projectId) as Row[])
      .map((a) => ({ ...a, ops: (JSON.parse(a.order_json as string) as { ops: Op[] }).ops }));
  }

  /** Compare an alternate with the story as it stands. Changes nothing. */
  compareAlternate(id: string) {
    const a = this.store.get('arrangements', id);
    if (!a || a.deleted_at) throw new NotFoundError('alternate structure');
    const ops = (JSON.parse(a.order_json as string) as { ops: Op[] }).ops;
    const pid = a.project_id as string;
    // Apply the ops in sequence to an in-memory copy by previewing each against a temporary transaction.
    let result: ReturnType<Ripple['preview']>[] = [];
    this.store.db.exec('SAVEPOINT alt_compare');
    try {
      for (const op of ops) { result.push(this.preview(pid, op)); this.commit(pid, op); }
    } finally {
      this.store.db.exec('ROLLBACK TO alt_compare');
      this.store.db.exec('RELEASE alt_compare');
    }
    const before = this.current(pid);
    const newQuestions = result.flatMap((r) => r.newQuestions).filter((f, i, all) => all.findIndex((x) => x.key === f.key) === i);
    return { alternate: { id: a.id, name: a.name, note: a.note }, steps: result, newQuestions, current: before };
  }

  adoptAlternate(id: string) {
    const a = this.store.get('arrangements', id);
    if (!a || a.deleted_at) throw new NotFoundError('alternate structure');
    const pid = a.project_id as string;
    const ops = (JSON.parse(a.order_json as string) as { ops: Op[] }).ops;
    return this.store.batch({ projectId: pid, actor: 'author', reason: `Adopt alternate structure "${a.name}"` }, () => ops.map((op) => this.commit(pid, op)));
  }

  discardAlternate(id: string) {
    const a = this.store.get('arrangements', id);
    if (!a || a.deleted_at) throw new NotFoundError('alternate structure');
    this.store.batch({ projectId: a.project_id as string, actor: 'author', reason: `Discard alternate structure "${a.name}"` }, (w) => w.remove('arrangements', id));
  }
}

function describe(store: Store, op: Op) {
  const t = (table: string, id: string | null | undefined) => (id ? (store.get(table, id)?.title as string) ?? '' : '');
  if (op.type === 'moveScene') return `Move scene "${t('scenes', op.sceneId)}"`;
  if (op.type === 'moveCard') return op.beatId ? `Move "${t('elements', op.planId)}" to ${t('elements', op.beatId)}` : `Take "${t('elements', op.planId)}" off its beat`;
  return `Move "${t('elements', op.elementId)}" to "${t('elements', op.toPlanId)}"`;
}

