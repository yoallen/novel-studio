// Whole-book lenses: the names the book uses (and their near-miss spellings), and the shape of the book's pacing.

import { Store, Row } from './store.js';
import { Brain } from './brain.js';
import { Manuscript } from './manuscript.js';
import { Structure } from './structure.js';
import { Continuity } from './continuity.js';
import { namesIn, nameVariants, tokenize } from './revise.js';

export class Lenses {
  constructor(private store: Store, private brain: Brain, private ms: Manuscript, private structure: Structure, private continuity: Continuity) {}

  private scenes(projectId: string) {
    return this.ms.outline(projectId).flatMap((c) => c.scenes.map((s) => ({ chapter: c, scene: s })));
  }

  /** Every name the manuscript uses, where, whether it has a record, and names that look like misspellings. */
  names(projectId: string) {
    const known = this.brain.elements(projectId).filter((e) => ['character', 'location', 'set_piece', 'storyline'].includes(e.kind as string));
    const knownNames = known.flatMap((e) => [e.title as string, ...(((JSON.parse((e.attrs_json as string) || '{}') as Record<string, unknown>).aliases as string[] | undefined) ?? [])]);
    const total = new Map<string, number>();
    const where = new Map<string, { id: string; title: string; count: number }[]>();
    for (const { scene } of this.scenes(projectId)) {
      const text = (this.store.db.prepare('SELECT text FROM scenes WHERE id=?').get(scene.id) as Row).text as string;
      for (const [n, c] of namesIn(text)) {
        total.set(n, (total.get(n) ?? 0) + c);
        where.set(n, [...(where.get(n) ?? []), { id: scene.id as string, title: scene.title as string, count: c }]);
      }
    }
    const parts = new Set(knownNames.flatMap((k) => k.split(/\s+/)));
    const recordFor = (n: string) => known.find((e) => (e.title as string).split(/\s+/).includes(n) || (e.title as string) === n);
    const names = [...total.entries()].map(([name, count]) => {
      const rec = recordFor(name);
      return { name, count, record: rec ? { id: rec.id as string, title: rec.title as string, kind: rec.kind as string } : null, scenes: where.get(name) ?? [] };
    }).sort((a, b) => b.count - a.count);
    const variants = nameVariants(total, knownNames).map((v) => ({ ...v, scenes: where.get(v.name) ?? [] }));
    const noRecord = names.filter((n) => !n.record && !parts.has(n.name) && n.count >= 3 && !variants.some((v) => v.name === n.name));
    return { names, variants, noRecord };
  }

  /** The book's shape: each scene's length, viewpoint, scene or sequel, value turn and beat, in reading order. */
  pacing(projectId: string) {
    const pov = new Map<string, { title: string } | null>();
    for (const c of this.continuity.povCoverage(projectId).chapters) for (const s of c.scenes) pov.set(s.id as string, s.pov ? { title: s.pov.title as string } : null);
    const beats = new Map(this.structure.beats(projectId).map((b) => [b.element.id as string, b.element.title as string]));
    const val = (id: string | null, f: string) => { if (!id) return null; const v = this.brain.field(id, f); return (v.current?.value ?? v.latest?.value ?? null) as string | null; };
    const rows = this.scenes(projectId).map(({ chapter, scene }, i) => {
      const plan = (scene.plan_element_id as string | null) ?? null;
      const text = (this.store.db.prepare('SELECT text FROM scenes WHERE id=?').get(scene.id) as Row).text as string;
      const sentences = text.split(/[.!?…]+["”’)]*\s+/).filter((x) => x.trim());
      const dialogue = (text.match(/[“"][^”"]+[”"]/g) ?? []).join(' ');
      const beatId = plan ? this.structure.decidedBeat(plan) : null;
      return {
        index: i + 1, id: scene.id as string, title: scene.title as string, chapter: { id: chapter.id as string, number: chapter.number as number, title: chapter.title as string },
        words: scene.word_count as number, pov: pov.get(scene.id as string)?.title ?? null,
        kind: val(plan, 'scene_kind'), valueStart: val(plan, 'value_start'), valueEnd: val(plan, 'value_end'), beat: beatId ? beats.get(beatId) ?? null : null,
        avgSentence: sentences.length ? Math.round(tokenize(text).length / sentences.length) : 0,
        dialoguePercent: text.length ? Math.round((dialogue.length / text.length) * 100) : 0,
      };
    });
    const words = rows.map((r) => r.words).filter((w) => w > 0).sort((a, b) => a - b);
    const median = words.length ? words[Math.floor(words.length / 2)]! : 0;
    const notes: string[] = [];
    if (median) for (const r of rows) {
      if (r.words > median * 2.5 && r.words > 2500) notes.push(`"${r.title}" runs ${r.words.toLocaleString()} words, well over your usual scene (${median.toLocaleString()}). Intended, or two scenes in one?`);
    }
    const flat = rows.filter((r) => r.valueStart && r.valueEnd && r.valueStart === r.valueEnd);
    for (const r of flat) notes.push(`"${r.title}" starts and ends on the same value (${r.valueStart}). Every scene has to turn. Intended?`);
    return { rows, medianWords: median, notes };
  }
}
