// Remind me: the story's memory and the craft, answered beside the page so she never has to leave the scene.
// Every answer is gathered from what is already kept elsewhere (the Story Brain, the plan, the continuity checks);
// nothing here is stored or changed. Each answer says where its full page lives.
import type { Store, Row } from './store.js';
import { NotFoundError } from './store.js';
import type { Brain } from './brain.js';
import type { Manuscript } from './manuscript.js';
import type { Structure } from './structure.js';
import { BRODY_SIZES } from './structure.js';
import type { Continuity } from './continuity.js';
import type { Ripple } from './ripple.js';

const text = (v: unknown) => (v == null ? null : String(v).trim() || null);

/** "Main", "supporting", "minor" in her words, as far as they can be read; anything else after them. */
function importanceRank(v: string | null): number {
  const s = (v ?? '').toLowerCase();
  if (/\b(main|lead|protagonist|co-lead|central)\b/.test(s)) return 0;
  if (/\bsupport/.test(s)) return 1;
  if (/\bminor\b/.test(s)) return 2;
  return 1.5;
}

export class Remind {
  constructor(private store: Store, private brain: Brain, private ms: Manuscript, private structure: Structure, private continuity: Continuity, private ripple: Ripple) {}

  private val(id: string, field: string) { const f = this.brain.field(id, field); return text(f.current?.value ?? f.latest?.value); }
  private all(id: string, field: string) { const f = this.brain.field(id, field); const v = f.currentAll.length ? f.currentAll : f.latest ? [f.latest] : []; return v.map((x) => text(x.value)).filter(Boolean) as string[]; }
  private title(id: string | null | undefined) { return id ? ((this.store.get('elements', id)?.title as string) ?? '') : ''; }

  private place(sceneId: string) {
    const s = this.ms.scene(sceneId);
    const projectId = s.project_id as string;
    const units = this.ripple.order(projectId, { plans: true });
    const here = units.find((u) => u.sceneId === sceneId) ?? null;
    return { s, projectId, units, here, at: here ? here.index : null };
  }

  /** The scene's viewpoint, person and tense as the Viewpoint check works them out (scene, then chapter, then book). */
  private povOf(projectId: string, sceneId: string) {
    const cov = this.continuity.povCoverage(projectId);
    for (const c of cov.chapters) for (const sc of c.scenes) if (sc.id === sceneId) return { ...sc, chapter: c.title as string };
    return null;
  }

  /** The beat this scene's card sits on (decided first, else the first it might go at). */
  private beatOf(planId: string | null) {
    if (!planId) return null;
    const p = this.structure.placements(planId);
    const id = p.decided?.beatId ?? p.candidates[0]?.beatId ?? null;
    return id ? { id, name: this.title(id), decided: !!p.decided } : null;
  }

  /** The menu's own short lines: whose voice, and which beat. */
  menu(sceneId: string) {
    const { s, projectId } = this.place(sceneId);
    const pov = this.povOf(projectId, sceneId);
    const parts = [pov?.pov?.title, pov?.person ? String(pov.person).toLowerCase() : null, pov?.tense ? `${String(pov.tense).toLowerCase()} tense` : null].filter(Boolean);
    return { voice: parts.length ? parts.join(', ') : null, povName: pov?.pov?.title ?? null, beat: this.beatOf(s.plan_element_id as string | null), hasBeats: this.structure.beats(projectId).length > 0 };
  }

  characters(projectId: string) {
    return this.brain.elements(projectId, { kind: 'character' }).map((c) => ({
      id: c.id as string, title: c.title as string, role: this.val(c.id as string, 'role'), importance: this.val(c.id as string, 'importance'), essence: this.val(c.id as string, 'essence'), sort: c.sort_key as number,
    })).sort((a, b) => importanceRank(a.importance) - importanceRank(b.importance) || a.sort - b.sort).map(({ sort: _s, ...c }) => c);
  }

  voice(sceneId: string) {
    const { s, projectId } = this.place(sceneId);
    const pov = this.povOf(projectId, sceneId);
    const ch = this.store.get('chapters', s.chapter_id as string);
    const from = !pov?.pov ? null : pov.own.povId ? 'scene' : ch?.pov_element_id ? 'chapter' : null;
    const who = pov?.pov?.id as string | undefined;
    return {
      scene: s.title as string, chapter: pov?.chapter ?? null, from,
      pov: pov?.pov ? { id: who!, title: pov.pov.title } : null,
      person: text(pov?.person), tense: text(pov?.tense), distance: text(pov?.distance), narrator: pov?.narrator ?? null,
      sounds: who ? { accent: this.val(who, 'accent'), habits: this.all(who, 'speech'), languages: this.all(who, 'languages'), narrates: this.val(who, 'narrates') } : null,
    };
  }

  /** Each storyline: the last place it moved up to this scene, and the next place it is planned to move. */
  storylines(sceneId: string) {
    const { projectId, at } = this.place(sceneId);
    const s = this.continuity.storylines(projectId);
    return s.strands.map((st) => {
      const moves = s.grid.filter((g) => g.strands.includes(st.id));
      const last = [...moves].reverse().find((g) => at == null || g.index <= at) ?? null;
      const next = moves.find((g) => at != null && g.index > at) ?? null;
      const one = (g: typeof last) => (g ? { title: g.title, at: g.index, standing: g.standing } : null);
      return { id: st.id, title: st.title, letter: st.letter, state: st.state, last: one(last), next: one(next), moves: moves.length };
    });
  }

  /** What the viewpoint character knows, suspects or believes wrongly as of this scene, and what is still ahead of them. */
  knows(sceneId: string) {
    const { projectId, at } = this.place(sceneId);
    const pov = this.povOf(projectId, sceneId);
    if (!pov?.pov) return { character: null, knows: [], ahead: [] };
    const k = this.continuity.knowledge(projectId);
    const knows: { title: string; truth: string | null; how: string; since: string | null }[] = [], ahead: { title: string; at: string }[] = [];
    for (const e of k.events) {
      const me = e.who.find((w) => w.id === pov.pov!.id);
      if (!me) continue;
      const truth = text(e.truth);
      if (me.learnsAt && at != null && me.learnsAt.index > at) { ahead.push({ title: e.title as string, at: me.learnsAt.scene as string }); continue; }
      const how = me.stance?.relation === 'suspects' ? 'suspects' : me.stance?.relation === 'believes_falsely' ? 'believes wrongly' : 'knows';
      knows.push({ title: e.title as string, truth, how, since: me.learnsAt ? me.learnsAt.scene as string : null });
    }
    return { character: { id: pov.pov.id as string, title: pov.pov.title as string }, knows, ahead };
  }

  /** Her Decided entries that mention the words she typed, newest first. */
  decided(projectId: string, q: string) {
    const term = q.trim();
    if (term.length < 2) return [];
    const label = this.brain.fieldLabeler(projectId);
    const like = `%${term.replace(/[%_]/g, (m) => `\\${m}`)}%`;
    const rows = this.store.db.prepare(
      `SELECT s.element_id, s.field, s.value_json, s.made_at, e.title, e.kind FROM statements s JOIN elements e ON e.id = s.element_id
       WHERE s.project_id=? AND s.status='established' AND s.superseded_by_id IS NULL AND s.deleted_at IS NULL AND e.deleted_at IS NULL
       AND (s.value_json LIKE ? ESCAPE '\\' OR e.title LIKE ? ESCAPE '\\') ORDER BY s.made_at DESC LIMIT 40`,
    ).all(projectId, like, like) as Row[];
    return rows.map((r) => ({ elementId: r.element_id as string, record: r.title as string, field: label(r.kind as string, r.field as string) ?? (r.field as string), value: text(JSON.parse(r.value_json as string)) ?? '', madeAt: r.made_at as string }))
      .filter((r) => r.value && !/^[0-9a-f-]{20,}$/i.test(r.value));
  }

  /** Setups planted for the reader, with where (and whether) each pays off. Waiting ones first. */
  promises(sceneId: string) {
    const { projectId, at } = this.place(sceneId);
    return this.continuity.clues(projectId).map((c) => {
      const planted = c.plants[0] ?? null, pays = c.payoffs[0] ?? null;
      const plantedWords = c.plantedWords[0]?.text ?? null, paidWords = c.paidOffWords[0]?.text ?? null;
      return { id: c.id as string, title: c.title as string, planted: planted ? { title: planted.title, at: planted.at } : plantedWords ? { title: plantedWords, at: null } : null, paysOff: pays ? { title: pays.title, at: pays.at } : paidWords ? { title: paidWords, at: null } : null, before: planted?.at != null && at != null ? planted.at <= at : null };
    }).filter((c) => c.planted).sort((a, b) => Number(!!a.paysOff) - Number(!!b.paysOff) || (a.planted!.at ?? 1e9) - (b.planted!.at ?? 1e9));
  }

  /** The next unwritten scene cards in story order after this scene, and the next beat. */
  next(sceneId: string) {
    const { s, projectId } = this.place(sceneId);
    const order = this.structure.plannedOrder(projectId);
    const mine = order.findIndex((c) => c.id === s.plan_element_id);
    const after = (mine >= 0 ? order.slice(mine + 1) : order).filter((c) => !c.sceneId).slice(0, 5);
    const beats = this.structure.beats(projectId).filter((b) => !b.element.parent_id);
    const here = this.beatOf(s.plan_element_id as string | null);
    const bi = here ? beats.findIndex((b) => b.element.id === here.id) : -1;
    const nextBeat = bi >= 0 ? beats[bi + 1] ?? null : null;
    return { cards: after.map((c) => ({ id: c.id, title: c.title, beat: c.beat, decided: c.decided })), beat: here, nextBeat: nextBeat ? { id: nextBeat.element.id as string, name: nextBeat.element.title as string } : null };
  }

  /** The craft of one beat, short enough to read mid-scene. */
  beat(projectId: string, beatId: string) {
    const b = this.structure.beats(projectId).find((x) => x.element.id === beatId) ?? this.structure.beats(projectId, undefined).find((x) => x.element.id === beatId);
    const el = this.brain.element(beatId, projectId);
    if (el.kind !== 'beat') throw new NotFoundError('beat');
    const def = b?.def ?? null;
    const br = def?.brody ?? null;
    return {
      id: beatId, name: el.title as string, act: b?.act ?? null, description: def?.description ?? null, window: def?.window ?? null, test: def?.test ?? null,
      brody: br ? { size: br.size ?? null, sizeMeans: br.size ? BRODY_SIZES[br.size] : null, goes: br.goes, does: br.does, teach: br.teach, checklist: br.checklist } : null,
    };
  }

  beats(projectId: string) {
    return this.structure.beats(projectId).map((b) => ({ id: b.element.id as string, name: b.element.title as string, sub: !!b.element.parent_id }));
  }

  /** What makes a scene work: the questions of the scene plan, with this scene's own answers where she has them. */
  scene(sceneId: string) {
    const s = this.ms.scene(sceneId);
    const plan = s.plan_element_id as string | null;
    const a = (f: string) => (plan ? this.val(plan, f) : null);
    return { title: s.title as string, answers: { purpose: a('purpose'), objective: a('objective'), conflict: a('conflict'), outcome: a('outcome'), value_start: a('value_start'), value_end: a('value_end'), turning_point: a('turning_point') } };
  }
}
