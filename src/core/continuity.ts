// Continuity: viewpoint, the two timelines, who knows what and when, clues and payoffs, storylines,
// secret operations, motifs, and one review of every question the program can ask, where her
// "intentional" note quiets a question for good (R-C-035 to R-C-065, R-C-077, R-B-036).

import { parseYear } from './storytime.js';
import { Store, Row, NotFoundError, ValidationError } from './store.js';
import { Brain } from './brain.js';
import { Manuscript } from './manuscript.js';
import { Structure } from './structure.js';
import { Ripple, Finding } from './ripple.js';

const DAY_PARTS = ['dawn', 'early morning', 'morning', 'late morning', 'noon', 'midday', 'afternoon', 'late afternoon', 'evening', 'dusk', 'night', 'late night', 'midnight'];
const partRank = (t: unknown) => { const s = String(t ?? '').toLowerCase(); const i = DAY_PARTS.findIndex((p) => s.includes(p)); return i < 0 ? 99 : i; };
const yes = (v: unknown) => /^(y|yes|true|significant|must)/i.test(String(v ?? '').trim());

export class Continuity {
  constructor(private store: Store, private brain: Brain, private ms: Manuscript, private structure: Structure, private ripple: Ripple) {}

  private val(id: string, field: string) { return this.brain.field(id, field).current?.value ?? this.brain.field(id, field).latest?.value ?? null; }
  private title(id: string | null | undefined) { return id ? ((this.store.get('elements', id)?.title as string) ?? '') : ''; }

  /** The project's story world record (time, space, duration, viewpoint rules). Created when first opened. */
  storyWorld(projectId: string, create = false) {
    const found = this.brain.elements(projectId, { kind: 'storyworld' })[0];
    if (found) return found;
    if (!create) return null;
    return this.brain.createElement(projectId, { kind: 'storyworld', title: 'Story world' }) as Row;
  }

  // ---------- viewpoint (R-C-041 to R-C-045) ----------
  setChapterPov(chapterId: string, input: { povElementId?: string | null; pov?: Record<string, unknown> }) {
    const c = this.store.get('chapters', chapterId);
    if (!c || c.deleted_at) throw new NotFoundError('chapter');
    const row: Row = {};
    if (input.povElementId !== undefined) { if (input.povElementId) this.brain.element(input.povElementId, c.project_id as string); row.pov_element_id = input.povElementId; }
    if (input.pov !== undefined) row.pov_json = JSON.stringify(input.pov);
    return this.store.batch({ projectId: c.project_id as string, actor: 'author', reason: `Viewpoint for ${c.title}` }, (w) => w.update('chapters', chapterId, row));
  }

  setScenePov(sceneId: string, pov: Record<string, unknown>) {
    const s = this.ms.scene(sceneId);
    const also = Array.isArray(pov.also) ? (pov.also as string[]) : [];
    for (const id of also) this.brain.element(id, s.project_id as string);
    return this.store.batch({ projectId: s.project_id as string, actor: 'author', reason: `Viewpoint details for "${s.title}"` }, (w) => w.update('scenes', sceneId, { pov_json: JSON.stringify(pov) }));
  }

  povCoverage(projectId: string) {
    const world = this.storyWorld(projectId);
    // The story world's own words win; otherwise the viewpoint and tense chosen in Novel setup.
    const chosen = ((this.brain.project(projectId).profile.setup as { characteristics?: string[] } | undefined)?.characteristics) ?? [];
    const pick = (map: Record<string, string>) => { const hits = Object.entries(map).filter(([k]) => chosen.includes(k)); return hits.length === 1 ? hits[0]![1] : null; };
    const tidy = (x: unknown) => (x == null || x === '' ? null : String(x).trim().replace(/[.;,]+$/, ''));
    const def = {
      person: (world ? this.val(world.id as string, 'pov_person') : null) ?? pick({ first_person: 'First person', third_limited: 'Third person limited', third_omniscient: 'Third person omniscient', second_person: 'Second person' }),
      tense: (world ? this.val(world.id as string, 'pov_tense') : null) ?? pick({ past_tense: 'Past', present_tense: 'Present', mixed_tense: 'Mixed' }),
    };
    def.person = tidy(def.person) as typeof def.person; def.tense = tidy(def.tense) as typeof def.tense;
    const chapters = this.store.db.prepare('SELECT * FROM chapters WHERE project_id=? AND deleted_at IS NULL ORDER BY position').all(projectId) as Row[];
    const scenes = this.store.db.prepare('SELECT id, chapter_id, title, pov_element_id, pov_json, position FROM scenes WHERE project_id=? AND deleted_at IS NULL ORDER BY position').all(projectId) as Row[];
    const rows = chapters.map((c) => {
      const cp = JSON.parse((c.pov_json as string) || '{}') as Record<string, unknown>;
      return {
        id: c.id, title: c.title, pov: c.pov_element_id ? { id: c.pov_element_id, title: this.title(c.pov_element_id as string) } : null, details: cp,
        scenes: scenes.filter((s) => s.chapter_id === c.id).map((s) => {
          const sp = JSON.parse((s.pov_json as string) || '{}') as Record<string, unknown>;
          const povId = (s.pov_element_id as string | null) ?? (c.pov_element_id as string | null) ?? null;
          return {
            id: s.id, title: s.title, pov: povId ? { id: povId, title: this.title(povId), inherited: !s.pov_element_id && !!c.pov_element_id } : null,
            person: sp.person ?? cp.person ?? def.person, tense: sp.tense ?? cp.tense ?? def.tense,
            // What this scene says for itself, apart from what it takes from its chapter or the book.
            own: { povId: (s.pov_element_id as string | null) ?? null, person: (sp.person as string | undefined) ?? null, tense: (sp.tense as string | undefined) ?? null },
            narrator: sp.narrator ? { id: sp.narrator, title: this.title(sp.narrator as string) } : null,
            distance: sp.distance ?? cp.distance ?? null, reliability: sp.reliability ?? cp.reliability ?? null, function: sp.function ?? null,
            also: ((sp.also as string[] | undefined) ?? []).map((id) => ({ id, title: this.title(id) })),
          };
        }),
      };
    });
    // Long absences: observations, not rules.
    const povChars = new Set(rows.flatMap((c) => c.scenes.map((s) => s.pov?.id).filter(Boolean)) as string[]);
    const absences: { character: string; chapters: number; from: string; to: string }[] = [];
    for (const ch of povChars) {
      let run = 0, start = -1;
      rows.forEach((c, i) => {
        const present = c.scenes.some((s) => s.pov?.id === ch);
        if (!present && c.scenes.length) { if (run === 0) start = i; run++; }
        if ((present || i === rows.length - 1) && run >= 3) absences.push({ character: this.title(ch), chapters: run, from: rows[start]!.title as string, to: rows[start + run - 1]!.title as string });
        if (present) run = 0;
      });
    }
    return { defaults: def, chapters: rows, absences };
  }

  // ---------- the two timelines (R-C-049 to R-C-051) ----------
  timelines(projectId: string) {
    const units = this.ripple.order(projectId, { plans: true });
    const memory = (this.brain.links(projectId) as Row[]).filter((l) => l.relation === 'calls_up');
    const rows = units.map((u) => {
      const id = u.planId;
      const g = (f: string) => (id ? this.val(id, f) : null);
      // A present scene can call up a past one: the memory link, in both directions.
      const callsUp = id ? memory.filter((l) => l.from_id === id).map((l) => String(l.to_title ?? this.title(l.to_id as string))) : [];
      const calledUpBy = id ? memory.filter((l) => l.to_id === id).map((l) => String(l.from_title ?? this.title(l.from_id as string))) : [];
      return { key: u.key, planId: id, sceneId: u.sceneId, title: u.title, narrative: u.index, standing: u.standing, beat: this.title(u.beatId), when: g('story_time'), day: g('story_day'), date: g('story_date'), year: g('story_year'), time: g('time_of_day'), elapsed: g('elapsed'), season: g('season'), weather: g('weather'), location: g('location'), callsUp, calledUpBy };
    });
    const chronological = [...rows].filter((r) => r.day != null || r.date != null || r.year != null).sort((a, b) => {
      const ya = parseYear(a.year), yb = parseYear(b.year);
      if (ya != null && yb != null && ya !== yb) return ya - yb;
      const da = Number(a.day), db = Number(b.day);
      if (Number.isFinite(da) && Number.isFinite(db) && da !== db) return da - db;
      if (a.date && b.date && a.date !== b.date) return String(a.date).localeCompare(String(b.date));
      return partRank(a.time) - partRank(b.time) || a.narrative - b.narrative;
    });
    return { narrative: rows, chronological, unplacedInTime: rows.filter((r) => r.day == null && r.date == null && r.year == null).length };
  }

  // ---------- knowledge (R-C-050, R-C-060, R-C-064) ----------
  knowledge(projectId: string) {
    const { units, where } = this.ripple.placesOf(projectId, { plans: true });
    const links = this.brain.links(projectId);
    const present = (charId: string, unitKey: string) => (where.get(charId) ?? []).some((u) => u.key === unitKey);
    const unitOfPlan = (planId: string) => units.find((u) => u.planId === planId);
    const characters = this.brain.elements(projectId, { kind: 'character' });
    const facts = new Map<string, Row>();
    for (const l of links) if (['reveals', 'knows', 'suspects', 'believes_falsely'].includes(l.relation as string)) { const e = this.store.get('elements', l.to_id as string); if (e && !e.deleted_at && e.kind !== 'character') facts.set(e.id as string, e); }
    const events = [...facts.values()].map((f) => {
      const revealUnits = links.filter((l) => l.relation === 'reveals' && l.to_id === f.id).map((l) => unitOfPlan(l.from_id as string)).filter(Boolean).sort((a, b) => a!.pos - b!.pos);
      const readerAt = revealUnits[0] ?? null;
      const who = characters.map((c) => {
        const learnsAt = revealUnits.find((u) => present(c.id as string, u!.key)) ?? null;
        const k = links.find((l) => l.from_id === c.id && l.to_id === f.id && ['knows', 'suspects', 'believes_falsely'].includes(l.relation as string));
        return { id: c.id, title: c.title, learnsAt: learnsAt ? { scene: learnsAt.title, index: units.indexOf(learnsAt) + 1, standing: learnsAt.standing } : null, stance: k ? { relation: k.relation, note: k.note } : null };
      }).filter((x) => x.learnsAt || x.stance);
      return { id: f.id, title: f.title, truth: this.val(f.id as string, 'truth'), happens: this.val(f.id as string, 'story_time'), layer: this.val(f.id as string, 'layer'), readerAt: readerAt ? { scene: readerAt.title, index: units.indexOf(readerAt) + 1, standing: readerAt.standing } : null, who };
    });
    // The reader-knowledge timeline, scene by scene.
    const timeline = units.map((u, i) => ({
      index: i + 1, title: u.title, planId: u.planId, sceneId: u.sceneId, standing: u.standing, beat: this.title(u.beatId),
      readerSuspects: u.planId ? this.val(u.planId, 'reader_suspects') : null, layer: u.planId ? this.val(u.planId, 'layer') : null,
      reveals: links.filter((l) => l.relation === 'reveals' && l.from_id === u.planId).map((l) => this.title(l.to_id as string)),
      learns: links.filter((l) => l.relation === 'reveals' && l.from_id === u.planId).flatMap((l) => characters.filter((c) => present(c.id as string, u.key)).map((c) => `${c.title} learns ${this.title(l.to_id as string)}`)),
    }));
    return { events, timeline, of: units.length };
  }

  // ---------- clues, plants and payoffs (R-C-062) ----------
  clues(projectId: string) {
    const { units, pos } = this.ripple.placesOf(projectId, { plans: true });
    const links = this.brain.links(projectId);
    const unitAt = (id: string) => { const p = pos.get(id); return p == null ? null : units.find((u) => u.pos === p) ?? null; };
    const ix = (id: string) => { const u = unitAt(id); return u ? units.indexOf(u) + 1 : null; };
    // Her own words in the clue's "Where it is planted" and "Where it pays off" count too, and point at the cards
    // and beats they name, so she never has to say the same thing twice.
    const beats = this.structure.beats(projectId).map((b) => ({ id: b.element.id as string, title: b.element.title as string }));
    const norm = (x: string) => x.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
    const bare = (x: string) => norm(x).replace(/^(the|a|an) /, '');
    const has = (hay: string, needle: string) => !!needle && ` ${hay} `.includes(` ${needle} `);
    const words = (id: string, field: string) => {
      const f = this.brain.field(id, field);
      const mine = [...f.currentAll.map((x) => ({ text: String(x.value), sure: true })), ...f.possibilities.filter((x) => x.status === 'developing').map((x) => ({ text: String(x.value), sure: false }))];
      return mine.map((w) => {
        const t = norm(w.text);
        const cards = units.filter((u) => { const b = bare(u.title); return b.length >= 4 && (has(t, b) || (t.split(' ').length >= 2 && has(b, bare(w.text)))); })
          .map((u) => ({ id: u.planId ?? u.key, sceneId: u.sceneId, title: u.title, at: units.indexOf(u) + 1, standing: u.standing }));
        const atBeats = beats.filter((b) => b.title.length >= 4 && has(t, norm(b.title))).map((b) => ({ id: b.id, title: b.title }));
        return { ...w, cards, beats: atBeats };
      });
    };
    const things = this.brain.elements(projectId).filter((e) => ['clue', 'object', 'payoff', 'event', 'reveal'].includes(e.kind as string) && links.some((l) => ['plants', 'pays_off'].includes(l.relation as string) && l.to_id === e.id));
    const clueEls = [...things, ...this.brain.elements(projectId, { kind: 'clue' }).filter((c) => !things.some((t) => t.id === c.id))];
    return clueEls.map((c) => {
      const side = (rel: string) => links.filter((l) => l.relation === rel && l.to_id === c.id).map((l) => ({ id: l.from_id as string, title: this.title(l.from_id as string), at: ix(l.from_id as string), standing: unitAt(l.from_id as string)?.standing ?? null })).sort((a, b) => (a.at ?? 1e9) - (b.at ?? 1e9));
      return { id: c.id, title: c.title, kind: c.kind, truth: this.val(c.id as string, 'truth'), significant: yes(this.val(c.id as string, 'significant')), plants: side('plants'), reveals: side('reveals'), payoffs: side('pays_off'), plantedWords: words(c.id as string, 'planted'), paidOffWords: words(c.id as string, 'paid_off'), of: units.length };
    });
  }

  // ---------- storylines (R-C-035 to R-C-039) ----------
  storylines(projectId: string, plans = true) {
    const units = this.ripple.order(projectId, { plans });
    const links = this.brain.links(projectId);
    const strands = this.brain.elements(projectId, { kind: 'storyline' }).map((s) => ({
      id: s.id as string, title: s.title as string, letter: this.val(s.id as string, 'letter'), storyType: this.val(s.id as string, 'story_type'), state: this.val(s.id as string, 'state'), resolution: this.val(s.id as string, 'resolution'),
      values: this.brain.field(s.id as string, 'values').currentAll.map((v) => v.value),
    }));
    const moves = (unitPlan: string | null, strand: string) => !!unitPlan && links.some((l) => l.relation === 'advances' && l.from_id === unitPlan && l.to_id === strand);
    const grid = units.map((u) => ({ index: u.index, title: u.title, planId: u.planId, standing: u.standing, strands: strands.filter((s) => moves(u.planId, s.id)).map((s) => s.id) }));
    return { strands, grid, touchPoints: grid.filter((g) => g.strands.length > 1) };
  }

  // ---------- secret operations (R-C-061): author-only ----------
  secretLog(projectId: string) {
    const moves = this.brain.elements(projectId, { kind: 'hidden_move' });
    const actors = [...new Set(moves.map((m) => m.parent_id as string | null))];
    return actors.map((a) => ({
      actor: a ? { id: a, title: this.title(a) } : null,
      moves: moves.filter((m) => m.parent_id === a).map((m) => ({ id: m.id, title: m.title, when: this.val(m.id as string, 'when'), move: this.val(m.id as string, 'move'), othersSee: this.val(m.id as string, 'others_see'), blame: this.val(m.id as string, 'blame') })),
    }));
  }

  // ---------- motifs (R-C-065) ----------
  motifs(projectId: string) {
    const { units, where } = this.ripple.placesOf(projectId, { plans: true });
    const links = this.brain.links(projectId);
    return this.brain.elements(projectId, { kind: 'motif' }).map((m) => ({
      id: m.id, title: m.title,
      appearances: (where.get(m.id as string) ?? []).map((u) => ({ index: units.indexOf(u) + 1, standing: u.standing, scene: u.title, note: (links.find((l) => l.from_id === m.id && ['appears_in', 'realizes'].includes(l.relation as string) && l.to_id === u.planId)?.note as string) ?? '' })).sort((a, b) => a.index - b.index),
    }));
  }

  // ---------- checks (questions, and evidence where the facts are certain) ----------
  checks(projectId: string): (Finding & { evidence?: boolean })[] {
    const out: (Finding & { evidence?: boolean })[] = [];
    const world = this.storyWorld(projectId);
    const rule = world ? String(this.val(world.id as string, 'pov_rule') ?? '').toLowerCase() : '';
    const cov = this.povCoverage(projectId);
    if (rule.includes('scene')) {
      for (const c of cov.chapters) for (const s of c.scenes) if (s.also.length) out.push({ key: `headhop:${s.id}`, rule: 'one viewpoint per scene', severity: 'question', elements: [{ id: s.id as string, title: s.title as string }], message: `"${s.title}" lists more than one viewpoint (${[s.pov?.title, ...s.also.map((a) => a.title)].filter(Boolean).join(', ')}). Your rule changes heads only at a seam. Intended?` });
    }
    if (rule.includes('chapter')) {
      for (const c of cov.chapters) { const povs = new Set(c.scenes.map((s) => s.pov?.id).filter(Boolean)); if (povs.size > 1) out.push({ key: `headhop-ch:${c.id}`, rule: 'one viewpoint per chapter', severity: 'question', elements: [{ id: c.id as string, title: c.title as string }], message: `${c.title} has more than one viewpoint. Your rule is one per chapter. Intended?` }); }
    }
    for (const a of cov.absences) out.push({ key: `absence:${a.character}:${a.from}`, rule: 'viewpoint balance', severity: 'note', elements: [], message: `${a.character} has no viewpoint scene for ${a.chapters} chapters (${a.from} to ${a.to}). Just an observation.` });

    // Withheld viewpoint: no scene inside the secret keeper's head before the chosen beat (R-C-044).
    const units = this.ripple.order(projectId);
    for (const ch of this.brain.elements(projectId, { kind: 'character' })) {
      const until = this.val(ch.id as string, 'pov_withheld_until');
      if (!until) continue;
      const beats = this.structure.beats(projectId);
      const beat = beats.find((b) => b.element.id === until || (b.element.title as string).toLowerCase() === String(until).toLowerCase());
      if (!beat) continue;
      const rank = (id: string | null) => beats.findIndex((b) => b.element.id === id);
      const cutoff = rank(beat.element.id as string);
      for (const c of cov.chapters) for (const s of c.scenes) {
        if (s.pov?.id !== ch.id && !s.also.some((x) => x.id === ch.id)) continue;
        const u = units.find((x) => x.sceneId === s.id);
        if (u && u.beatId && rank(u.beatId) >= 0 && rank(u.beatId) < cutoff) out.push({ key: `leak:${ch.id}:${s.id}`, rule: 'withheld viewpoint', severity: 'question', elements: [{ id: ch.id as string, title: ch.title as string }], message: `"${s.title}" is in ${ch.title}'s viewpoint before ${beat.element.title}, where you are keeping her outside the point of view. Intended?` });
      }
    }

    // Clues: two-way completeness (R-C-062).
    for (const c of this.clues(projectId)) {
      const planted = c.plants.length > 0 || c.plantedWords.length > 0, paid = c.payoffs.length > 0 || c.paidOffWords.length > 0;
      if (paid && !planted) out.push({ key: `clue-noplant:${c.id}`, rule: 'payoff without a plant', severity: 'question', elements: [{ id: c.id as string, title: c.title as string }], message: `"${c.title}" pays off but nothing plants it first. If it pays off later, it has to be here first.` });
      if (c.significant && planted && !paid) out.push({ key: `clue-unpaid:${c.id}`, rule: 'unpaid promise', severity: 'question', elements: [{ id: c.id as string, title: c.title as string }], message: `"${c.title}" is planted and marked significant, but nothing pays it off yet. Not every detail needs to pay off; this one you marked as one that does.` });
    }

    // Storylines: weave, dropped threads (R-C-037, R-C-038). Unmapped middles are never called holes (R-C-059).
    const sl = this.storylines(projectId, false);
    const n = sl.grid.length;
    for (const s of sl.strands) {
      const at = sl.grid.filter((g) => g.strands.includes(s.id)).map((g) => g.index);
      if (!at.length) continue;
      const quiet = /dormant|held|intentional|resolved/i.test(`${s.state ?? ''} ${s.resolution ?? ''}`);
      const shared = sl.grid.some((g) => g.strands.includes(s.id) && g.strands.length > 1);
      const letter = String(s.letter ?? '').toUpperCase();
      if (!shared && letter !== 'A' && sl.strands.length > 1 && !quiet && at.length > 1) out.push({ key: `weave:${s.id}`, rule: 'storyline weave', severity: 'question', elements: [{ id: s.id, title: s.title }], message: `"${s.title}" never shares a scene with another storyline. Does it run untouched beside the main story?` });
      if (!quiet && n >= 6 && Math.max(...at) < n * 0.6) out.push({ key: `dropped:${s.id}`, rule: 'storyline continues', severity: 'note', elements: [{ id: s.id, title: s.title }], message: `"${s.title}" last appears in scene ${Math.max(...at)} of ${n}. If its later scenes are not mapped yet, that is fine; if it is meant to end here, mark it resolved or held open.` });
    }

    // Two places at once, from the scene clock (R-C-053): evidence, not interpretation.
    const tl = this.timelines(projectId).narrative.filter((r) => r.planId && (r.day != null || r.date != null) && r.time != null);
    const { where } = this.ripple.placesOf(projectId, { plans: true });
    for (let i = 0; i < tl.length; i++) for (let j = i + 1; j < tl.length; j++) {
      const a = tl[i]!, b = tl[j]!;
      if (String(a.day ?? a.date) !== String(b.day ?? b.date) || String(a.time).toLowerCase() !== String(b.time).toLowerCase() || !a.location || !b.location || String(a.location).toLowerCase() === String(b.location).toLowerCase()) continue;
      for (const ch of this.brain.elements(projectId, { kind: 'character' })) {
        const us = (where.get(ch.id as string) ?? []).map((u) => u.planId);
        if (us.includes(a.planId) && us.includes(b.planId)) out.push({ key: `twoplaces:${ch.id}:${a.planId}:${b.planId}`, rule: 'two places at once', severity: 'question', evidence: true, elements: [{ id: ch.id as string, title: ch.title as string }], message: `${ch.title} is in "${a.title}" (${a.location}) and "${b.title}" (${b.location}) at the same story time (${a.day ?? a.date}, ${a.time}).` });
      }
    }

    // A Ghost happens before the story (R-C-052).
    for (const arc of this.brain.elements(projectId, { kind: 'arc' })) {
      for (const s of this.brain.field(arc.id as string, 'ghost').history.concat(this.brain.field(arc.id as string, 'ghost').currentAll, this.brain.field(arc.id as string, 'ghost').possibilities)) {
        if ((s as Row & { qualifiers?: Record<string, unknown> }).qualifiers?.timing === 'in_story' && !s.superseded_by_id) out.push({ key: `ghost-timing:${s.id}`, rule: 'Ghost timing', severity: 'question', elements: [{ id: arc.id as string, title: arc.title as string }], message: `A Ghost comes before the story, but "${String(s.value)}" is marked as happening during it. It may be an event that challenges the Lie instead. Intended?` });
      }
    }
    return out;
  }

  /** One review of every question the program can ask right now, with her responses (R-C-077, R-B-036). */
  review(projectId: string) {
    const notes = this.store.db.prepare('SELECT * FROM finding_notes WHERE project_id=? AND deleted_at IS NULL ORDER BY created_at DESC').all(projectId) as Row[];
    const noteFor = (key: string) => notes.find((n) => n.finding_key === key) ?? null;
    const structureQs = this.structure.questions(projectId).map((q) => ({ key: `structure:${q.beatId ?? ''}:${q.text.slice(0, 60)}`, rule: 'beat sheet', severity: 'question' as const, elements: q.beatId ? [{ id: q.beatId, title: this.title(q.beatId) }] : [], message: q.text }));
    const all = [...this.ripple.current(projectId), ...structureQs, ...this.checks(projectId)];
    const open: typeof all = [], later: (typeof all[number] & { note: Row })[] = [];
    for (const f of all) {
      const n = noteFor(f.key);
      if (!n) open.push(f);
      else if (n.status === 'deferred') later.push({ ...f, note: n });
    }
    return { open, later, answered: notes.filter((n) => n.status !== 'deferred'), total: all.length };
  }

  /** Respond to a finding: intentional (with her reason), not now, or resolved. Quiets that exact question. */
  respond(projectId: string, input: { key: string; status: 'intentional' | 'deferred' | 'resolved'; note?: string; text?: string }) {
    this.brain.project(projectId);
    if (!input.key) throw new ValidationError('Which question?');
    const existing = this.store.db.prepare('SELECT id FROM finding_notes WHERE project_id=? AND finding_key=? AND deleted_at IS NULL').get(projectId, input.key) as Row | undefined;
    return this.store.batch({ projectId, actor: 'author', reason: input.status === 'intentional' ? 'Marked a question intentional' : input.status === 'deferred' ? 'Set a question aside for later' : 'Marked a question resolved' }, (w) => {
      if (existing) return w.update('finding_notes', existing.id as string, { status: input.status, note: input.note ?? '' });
      return w.insert('finding_notes', { project_id: projectId, finding_key: input.key, status: input.status, note: input.note ?? '', finding_text: input.text ?? '' });
    });
  }

  reopen(noteId: string) {
    const n = this.store.get('finding_notes', noteId);
    if (!n || n.deleted_at) throw new NotFoundError('note');
    this.store.batch({ projectId: n.project_id as string, actor: 'author', reason: 'Reopened a question' }, (w) => w.remove('finding_notes', noteId));
  }
}
