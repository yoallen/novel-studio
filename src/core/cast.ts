// The cast across the story: where each character is (by your records, viewpoint, and the names on the page),
// who shares scenes with whom, who has gone quiet, and checks such as the Bechdel test.
// Everything here points; nothing is decided for her.

import { Store, Row, ValidationError } from './store.js';
import { Brain } from './brain.js';
import { Manuscript } from './manuscript.js';
import { Structure } from './structure.js';
import { Ripple, Standing } from './ripple.js';
import { WritingDesk } from './writing.js';

type How = 'pov' | 'planned' | 'named';
export interface Place { key: string; index: number; title: string; sceneId: string | null; planId: string | null; chapter: { id: string; number: number; title: string } | null; act: string; beat: string | null; drafted: boolean; standing: Standing }

const ACT_NAMES: Record<string, string> = { I: 'Act One', IIA: 'Act Two (first half)', IIB: 'Act Two (second half)', III: 'Act Three', none: 'Not on a beat yet' };
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const WOMAN = /\b(woman|women|female|girl|lady|she|her|femme|trans woman)\b/i;

export class Cast {
  constructor(private store: Store, private brain: Brain, private ms: Manuscript, private structure: Structure, private ripple: Ripple, private desk: WritingDesk) {}

  /** The story in reading order, each place with its chapter and act. Cards not yet drafted sit by their beat (or the
   *  beat they might go at); cards with no beat at all come last, in their own group, so nothing is guessed. */
  private places(projectId: string): Place[] {
    const { units } = this.ripple.placesOf(projectId, { plans: true });
    const outline = this.ms.outline(projectId);
    const chapterOf = new Map<string, Place['chapter']>();
    for (const c of outline) for (const s of c.scenes) chapterOf.set(s.id as string, { id: c.id as string, number: c.number as number, title: c.title as string });
    const beats = this.structure.beats(projectId);
    const n = units.filter((u) => u.standing !== 'unplaced').length;
    return units.map((u, i) => {
      const b = u.beatId ? beats.find((x) => x.element.id === u.beatId) : null;
      const frac = n > 1 ? i / (n - 1) : 0;
      const act = u.standing === 'unplaced' ? 'none' : (b?.act as string | undefined) ?? (frac < 0.2 ? 'I' : frac < 0.5 ? 'IIA' : frac < 0.75 ? 'IIB' : 'III');
      return { key: u.key, index: i + 1, title: u.title, sceneId: u.sceneId, planId: u.planId, chapter: u.sceneId ? chapterOf.get(u.sceneId) ?? null : null, act, beat: b ? (b.element.title as string) : null, drafted: !!u.sceneId, standing: u.standing };
    });
  }

  private characters(projectId: string) {
    return this.brain.elements(projectId, { kind: 'character' }).map((e) => {
      const attrs = JSON.parse((e.attrs_json as string) || '{}') as Record<string, unknown>;
      const title = e.title as string;
      const bare = title.replace(/^(Miss|Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Rev\.?|Prof\.?|Aunt|Uncle)\s+/i, '');
      // A first name stands for the whole name only when it is a name: never a common word like "The" or "Old",
      // and never for a description such as "The dogs" or "The Amazon delivery man".
      const first = bare.split(/\s+/)[0]!;
      const described = /^(the|a|an|my|our|his|her|their|old|young|little|big)$/i.test(first);
      const names = [...new Set([title, bare, ...(described || !/^[A-Z]/.test(first) ? [] : [first]), ...((attrs.aliases as string[] | undefined) ?? [])].filter((x) => x && x.length >= 2))];
      const g = this.brain.field(e.id as string, 'gender');
      const pr = this.brain.field(e.id as string, 'pronouns');
      // Gender in her words; when only pronouns are given, they speak for it.
      const gender = (g.current?.value ?? g.latest?.value ?? pr.current?.value ?? pr.latest?.value ?? null) as string | null;
      return { id: e.id as string, title, names, gender };
    });
  }

  /** Who is where: from her records (appears in, viewpoint) and from the names on the page. */
  presence(projectId: string) {
    const places = this.places(projectId);
    const { where } = this.ripple.placesOf(projectId, { plans: true });
    const chars = this.characters(projectId);
    const povOf = new Map<string, string | null>();
    for (const s of this.store.db.prepare('SELECT s.id, s.pov_element_id, c.pov_element_id AS cpov FROM scenes s JOIN chapters c ON c.id=s.chapter_id WHERE s.project_id=? AND s.deleted_at IS NULL').all(projectId) as Row[]) povOf.set(s.id as string, (s.pov_element_id ?? s.cpov ?? null) as string | null);
    const text = new Map<string, string>();
    for (const p of places) if (p.sceneId) text.set(p.key, (this.store.db.prepare('SELECT text FROM scenes WHERE id=?').get(p.sceneId) as Row).text as string);
    const rows = chars.map((c) => {
      const res = new Map<string, How>();
      for (const u of where.get(c.id) ?? []) res.set(u.key, 'planned');
      const re = new RegExp(`(?<![\\p{L}\\p{N}])(?:${c.names.map(esc).join('|')})(?![\\p{L}\\p{N}])`, 'u');
      for (const p of places) {
        if (p.sceneId && povOf.get(p.sceneId) === c.id) { res.set(p.key, 'pov'); continue; }
        if (!res.has(p.key) && re.test(text.get(p.key) ?? '')) res.set(p.key, 'named');
      }
      const at = places.filter((p) => res.has(p.key));
      const first = at[0] ?? null, last = at[at.length - 1] ?? null;
      let gap = 0, gapFrom: Place | null = null, gapTo: Place | null = null;
      for (let i = 1; i < at.length; i++) { const g = at[i]!.index - at[i - 1]!.index - 1; if (g > gap) { gap = g; gapFrom = at[i - 1]!; gapTo = at[i]!; } }
      return { id: c.id, title: c.title, gender: c.gender, cells: Object.fromEntries([...res.entries()]), count: at.length, first, last, gap: gap ? { scenes: gap, from: gapFrom, to: gapTo } : null };
    });
    // Gone quiet: seen early, then not again for a long stretch, or never again.
    // Only places with a spot in the story's order can show a gap; cards with no beat are not counted here.
    const placed = places.filter((p) => p.standing !== 'unplaced');
    const quiet = Math.max(5, Math.round(placed.length * 0.25));
    const where_ = (p: Place) => `${p.chapter ? `Chapter ${p.chapter.number}` : ACT_NAMES[p.act]}, "${p.title}"`;
    const notes: { characterId: string; text: string }[] = [];
    // Before anything has a place in the story, there is nothing to have gone missing from.
    for (const r of places.length ? rows : []) {
      if (!r.count) { notes.push({ characterId: r.id, text: `${r.title} has a record but does not appear in any scene yet.` }); continue; }
      const at = placed.filter((p) => r.cells[p.key]);
      if (!at.length) continue;
      const first = at[0]!, lastP = at[at.length - 1]!;
      let gap = 0, gapFrom: Place | null = null, gapTo: Place | null = null;
      for (let i = 1; i < at.length; i++) { const g = at[i]!.index - at[i - 1]!.index - 1; if (g > gap) { gap = g; gapFrom = at[i - 1]!; gapTo = at[i]!; } }
      const after = placed.length - lastP.index;
      if (after >= quiet && at.length <= 3) notes.push({ characterId: r.id, text: `${r.title} ${/^the\s.+s$/i.test(r.title) ? 'are' : 'is'} introduced in ${where_(first)} and not seen after ${where_(lastP)}, ${after} scene${after === 1 ? '' : 's'} before the end. Intended?` });
      else if (gap >= quiet) notes.push({ characterId: r.id, text: `${r.title} is away for ${gap} scenes, from ${where_(gapFrom!)} to ${where_(gapTo!)}. Intended?` });
    }
    return { places, rows, notes, acts: ACT_NAMES };
  }

  /** How characters meet: every pair that shares a scene, where and how often, with any relationship record. */
  pairs(projectId: string) {
    const { places, rows } = this.presence(projectId);
    const relFor = (a: string, b: string) => this.recordFor(projectId, [a, b]);
    const out: { a: { id: string; title: string }; b: { id: string; title: string }; together: Place[]; byAct: Record<string, number>; relationship: { id: string; title: string } | null }[] = [];
    for (let i = 0; i < rows.length; i++) for (let j = i + 1; j < rows.length; j++) {
      const A = rows[i]!, B = rows[j]!;
      const together = places.filter((p) => A.cells[p.key] && B.cells[p.key]);
      const rel = relFor(A.id, B.id);
      if (!together.length && !rel) continue;
      const byAct: Record<string, number> = {};
      for (const p of together) byAct[p.act] = (byAct[p.act] ?? 0) + 1;
      out.push({ a: { id: A.id, title: A.title }, b: { id: B.id, title: B.title }, together, byAct, relationship: rel ? { id: rel.id as string, title: rel.title as string } : null });
    }
    return out.sort((x, y) => y.together.length - x.together.length);
  }

  /** A relationship record that links exactly these characters (a pair, a family, a gang, a book club). */
  private recordFor(projectId: string, ids: string[]) {
    const links = this.brain.links(projectId);
    return this.brain.elements(projectId, { kind: 'relationship' }).find((r) => {
      const ends = new Set(links.filter((l) => l.from_id === r.id || l.to_id === r.id).map((l) => (l.from_id === r.id ? l.to_id : l.from_id) as string));
      return ids.length === ends.size && ids.every((id) => ends.has(id));
    }) ?? null;
  }

  /** Any two or more characters: every scene where they are all present, optionally with no one else there. */
  together(projectId: string, ids: string[], opts: { only?: boolean } = {}) {
    if (ids.length < 2) throw new ValidationError('Choose at least two characters.');
    const { places, rows } = this.presence(projectId);
    const chosen = ids.map((id) => rows.find((r) => r.id === id));
    if (chosen.some((c) => !c)) throw new ValidationError('One of those characters is not in this novel.');
    const others = rows.filter((r) => !ids.includes(r.id));
    const scenes = places.filter((p) => chosen.every((c) => c!.cells[p.key]) && (!opts.only || others.every((o) => !o.cells[p.key])))
      .map((p) => ({ place: p, alsoThere: others.filter((o) => o.cells[p.key]).map((o) => o.title) }));
    const byAct: Record<string, number> = {};
    for (const x of scenes) byAct[x.place.act] = (byAct[x.place.act] ?? 0) + 1;
    const rec = this.recordFor(projectId, ids);
    return { characters: chosen.map((c) => ({ id: c!.id, title: c!.title })), scenes, byAct, record: rec ? { id: rec.id as string, title: rec.title as string } : null };
  }

  /** Groups of three or more who share scenes again and again, largest first. */
  groups(projectId: string) {
    const { places, rows } = this.presence(projectId);
    const counts = new Map<string, Place[]>();
    for (const p of places) {
      const here = rows.filter((r) => r.cells[p.key]).map((r) => r.id).sort();
      if (here.length < 3 || here.length > 12) continue;
      // Every group of three or more within the scene, so a trio still shows when a fourth person drops by.
      const n = here.length;
      for (let mask = 0; mask < 1 << n; mask++) {
        let bits = 0; for (let m = mask; m; m &= m - 1) bits++;
        if (bits < 3) continue;
        const key = here.filter((_, i) => mask & (1 << i)).join('|');
        counts.set(key, [...(counts.get(key) ?? []), p]);
      }
    }
    const title = (id: string) => rows.find((r) => r.id === id)!.title;
    const all = [...counts.entries()].filter(([, ps]) => ps.length >= 2).map(([k, ps]) => ({ ids: k.split('|'), scenes: ps }));
    // Keep a group only if no larger group meets in exactly the same scenes.
    const kept = all.filter((g) => !all.some((h) => h.ids.length > g.ids.length && g.ids.every((id) => h.ids.includes(id)) && h.scenes.length === g.scenes.length));
    return kept.map((g) => {
      const rec = this.recordFor(projectId, g.ids);
      return { characters: g.ids.map((id) => ({ id, title: title(id) })), scenes: g.scenes, record: rec ? { id: rec.id as string, title: rec.title as string } : null };
    }).sort((a, b) => b.scenes.length - a.scenes.length || b.characters.length - a.characters.length).slice(0, 40);
  }

  /**
   * The Bechdel test: at least two named women, who talk to each other, about something other than a man.
   * The program finds the scenes where two or more women are present; only she can say what they talk about.
   */
  bechdel(projectId: string) {
    const { places, rows } = this.presence(projectId);
    const women = rows.filter((r) => r.gender && WOMAN.test(r.gender));
    const unsure = rows.filter((r) => !r.gender).map((r) => ({ id: r.id, title: r.title }));
    const scenes = places.filter((p) => women.filter((w) => w.cells[p.key]).length >= 2).map((p) => {
      const plan = p.planId;
      const v = plan ? this.brain.field(plan, 'bechdel_talk') : null;
      return { place: p, women: women.filter((w) => w.cells[p.key]).map((w) => ({ id: w.id, title: w.title })), answer: (v?.current?.value as string | undefined) ?? null };
    });
    const passes = scenes.filter((s) => s.answer === 'yes');
    return {
      women: women.map((w) => ({ id: w.id, title: w.title, scenes: w.count })),
      unsure, scenes,
      result: women.length < 2 ? 'not enough named women recorded' : !scenes.length ? 'no scene has two named women together yet' : passes.length ? 'passes' : scenes.some((s) => !s.answer) ? 'waiting for your answers' : 'does not pass yet',
      passingScenes: passes.length,
      alone: women.filter((w) => !scenes.some((s) => s.women.some((x) => x.id === w.id))).map((w) => w.title),
    };
  }

  /** Her answer for one scene: do these women talk to each other about something other than a man? */
  answerBechdel(projectId: string, unitKey: string, answer: 'yes' | 'no' | null) {
    const p = this.places(projectId).find((x) => x.key === unitKey);
    if (!p) throw new ValidationError('That scene is not in this novel.');
    const plan = p.planId ?? (p.sceneId ? this.desk.ensurePlan(p.sceneId) : null);
    if (!plan) throw new ValidationError('That scene has no card to keep the answer on.');
    if (answer) this.brain.addStatement({ elementId: plan, field: 'bechdel_talk', value: answer, status: 'established', speaker: { kind: 'author' }, supersedes: 'current' });
    else { const cur = this.brain.field(plan, 'bechdel_talk').current; if (cur) this.brain.setStatementStatus(cur.id as string, 'set_aside'); }
    return this.bechdel(projectId);
  }
}
