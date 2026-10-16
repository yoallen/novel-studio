// Story architecture: beat sheets as lenses (never forced), placement computed for any length under
// either of her two placement models, and scenes placed on beats with candidate placements that wait
// for her. Requirements: R-C-001 to R-C-025.

import { Store, Row, ValidationError, NotFoundError } from './store.js';
import { Brain } from './brain.js';
import { Manuscript } from './manuscript.js';
import { settingsOf } from './settings.js';
import sheet from './data/save-the-cat-yolanda.json' with { type: 'json' };
import { SAVE_THE_CAT_MOMENTS, StructBeat, OTHER_STRUCTURES as BUILT_IN } from './structures.js';
import { structureRegistry } from './methods.js';

type Registry = ReturnType<typeof structureRegistry>;

export interface BeatDef {
  key: string; number: number | null; name: string; aka?: string[]; group: 'thesis' | 'antithesis' | 'synthesis';
  act: 'I' | 'IIA' | 'IIB' | 'III'; kind: 'point' | 'span'; parent?: string;
  sceneType?: string; description?: string; example?: string; window?: string; test?: string;
  boardFields?: { field: string; label: string; options?: string[] }[];
}

const RAW = sheet as unknown as { groups: Record<string, { name: string; description: string }>; beats: { source_name: string; description: string; where: string; scene_type: string; group: string }[]; examples: Record<string, string> };
const fromSheet = (prefix: string) => RAW.beats.find((b) => b.source_name.startsWith(prefix));

const B = (key: string, number: number | null, name: string, sheetName: string, act: BeatDef['act'], kind: BeatDef['kind'], extra: Partial<BeatDef> = {}): BeatDef => {
  const row = fromSheet(sheetName);
  return { key, number, name, act, kind, group: (row?.group ?? 'thesis') as BeatDef['group'], sceneType: row?.scene_type || undefined, description: row?.description, window: row?.where, example: RAW.examples[row?.source_name ?? ''] ?? undefined, ...extra };
};

/** Save the Cat as she uses it: her fifteen beats, her descriptions, her worlds, her sub-beats and board fields. */
export const SAVE_THE_CAT: BeatDef[] = [
  B('opening_image', 1, 'Opening Image', '1. Opening', 'I', 'point', { test: 'If nothing in the opening can be turned over later, it is not yet doing its job.' }),
  B('theme_stated', 2, 'Theme Stated', '2. Theme', 'I', 'point', { test: 'Theme Stated is never spoken by the hero.', boardFields: [{ field: 'theme_line', label: 'The line that states the theme' }] }),
  B('setup', 3, 'Setup', '3. Set-up', 'I', 'span', { boardFields: [{ field: 'home', label: 'Home' }, { field: 'work', label: 'Work' }, { field: 'play', label: 'Play' }] }),
  B('stasis_death', null, 'Stasis = Death', 'Stasis', 'I', 'point', { parent: 'setup' }),
  B('catalyst', 4, 'Catalyst', '4. Catalyst', 'I', 'point', { test: 'Could the character reasonably return to normal the next day? If so, it is not yet the Catalyst.' }),
  B('debate', 5, 'Debate', '5. Debate', 'I', 'span', { boardFields: [{ field: 'debate_question', label: 'The Debate question' }] }),
  B('break_into_two', 6, 'Break into Two', '6. Break into Two', 'IIA', 'point', { test: 'It changes the situation, not just the mind, and the hero chooses it.', boardFields: [{ field: 'want', label: "The hero's WANT" }] }),
  B('b_story', 7, 'B Story', '7. B Story', 'IIA', 'point'),
  B('fun_and_games', 8, 'Fun and Games', '8. Fun and Games', 'IIA', 'span'),
  B('midpoint', 9, 'Midpoint', '9. Midpoint', 'IIB', 'point', { test: 'The Midpoint must turn the direction, not merely be the biggest event.', boardFields: [{ field: 'polarity', label: 'False victory or false defeat', options: ['False victory', 'False defeat'] }] }),
  B('bad_guys_close_in', 10, 'Bad Guys Close In', '10. Bad Guys', 'IIB', 'span'),
  B('all_is_lost', 11, 'All Is Lost', '11. All Is Lost', 'IIB', 'point', { test: 'All Is Lost is caused by the hero\'s own efforts, and the death is internal.', boardFields: [{ field: 'polarity', label: 'False victory or false defeat', options: ['False victory', 'False defeat'] }, { field: 'whiff_of_death', label: 'Whiff of death' }] }),
  B('dark_night', 12, 'Dark Night of the Soul', '12. Dark Night', 'IIB', 'span', { test: 'One still beat: neither skipped nor wallowed in.' }),
  B('break_into_three', 13, 'Break into Three', '13. Break into Three', 'III', 'point', { test: 'The hero acts on the truth.', boardFields: [{ field: 'need', label: "The hero's NEED" }] }),
  B('finale', 14, 'Finale', '14. Finale', 'III', 'span'),
  B('gathering_team', null, 'Gathering the Team', '14. Finale', 'III', 'point', { parent: 'finale', description: undefined, sceneType: undefined }),
  B('storming_castle', null, 'Storming the Castle', '14. Finale', 'III', 'point', { parent: 'finale', description: undefined, sceneType: undefined }),
  B('hightower_surprise', null, 'Hightower Surprise', '14. Finale', 'III', 'point', { parent: 'finale', description: undefined, sceneType: undefined }),
  B('dig_deep_down', null, 'Dig Deep Down', '14. Finale', 'III', 'point', { parent: 'finale', description: undefined, sceneType: undefined }),
  B('new_plan', null, 'Executing the New Plan', '14. Finale', 'III', 'point', { parent: 'finale', description: undefined, sceneType: undefined }),
  B('final_image', 15, 'Final Image', '15. Final Image', 'III', 'point', { boardFields: [{ field: 'final_change', label: 'Hero is changed, or rejects change', options: ['Hero is changed', 'Hero rejects change'] }] }),
];
// Her XL-A puts Break into Three in Synthesis; her XL-B puts it in Antithesis. XL-A is the default, and membership is editable.
for (const b of SAVE_THE_CAT) if (b.key === 'break_into_three') b.group = 'synthesis';

export const WORLDS = RAW.groups;

/** Pairs she uses: Opening/Final Image mirror; Midpoint/All Is Lost inverse; WANT at BI2 vs NEED at BI3. */
export const PAIRS = [
  { a: 'opening_image', b: 'final_image', rule: 'mirror' },
  { a: 'midpoint', b: 'all_is_lost', rule: 'inverse' },
  { a: 'break_into_two', b: 'break_into_three', rule: 'want_need' },
];

/** Placement profiles as fractions of the book: [start, end]. Points have start = end. */
export interface Profile { key: string; name: string; source: string; at: Record<string, [number, number]>; windows?: Record<string, { max: number; text: string }> }

export const PROFILES: Profile[] = [
  {
    key: 'brody', name: 'Novel percentages (Brody)', source: 'Your "BS2 Breakdown - Updated December 6 2021" sheet and your Story Bible',
    at: {
      opening_image: [0, 0.01], theme_stated: [0.05, 0.05], setup: [0.01, 0.10], stasis_death: [0.095, 0.095], catalyst: [0.10, 0.10], debate: [0.10, 0.20],
      break_into_two: [0.20, 0.20], b_story: [0.22, 0.22], fun_and_games: [0.20, 0.50], midpoint: [0.50, 0.50], bad_guys_close_in: [0.50, 0.75],
      all_is_lost: [0.75, 0.75], dark_night: [0.75, 0.80], break_into_three: [0.80, 0.80], finale: [0.80, 0.99], final_image: [0.99, 1.0],
    },
    windows: {
      theme_stated: { max: 0.10, text: 'Or somewhere within the first 10% of the novel.' },
      catalyst: { max: 0.10, text: '10% or earlier.' },
      break_into_two: { max: 0.25, text: 'Before you get one-quarter of the way through your novel.' },
      b_story: { max: 0.25, text: 'Make sure it happens in the first 25% of the novel.' },
    },
  },
  {
    key: 'snyder', name: 'Screenplay proportions (Snyder, 110 pages scaled)', source: 'Your "BS2 Breakdown - revised with word count for 250 and 300 words per page" sheet',
    at: Object.fromEntries(Object.entries({
      opening_image: [0, 1], theme_stated: [5, 5], setup: [1, 10], stasis_death: [11, 11], catalyst: [12, 12], debate: [12, 25], break_into_two: [25, 25],
      b_story: [30, 30], fun_and_games: [30, 55], midpoint: [55, 55], bad_guys_close_in: [55, 75], all_is_lost: [75, 75], dark_night: [75, 85],
      break_into_three: [85, 85], finale: [85, 110], final_image: [110, 110],
    } as Record<string, [number, number]>).map(([k, [a, b]]) => [k, [a / 110, b / 110] as [number, number]])),
    windows: {
      theme_stated: { max: 0.10, text: 'Or somewhere within the first 10% of the novel.' },
      catalyst: { max: 0.11, text: '10% or earlier.' },
      break_into_two: { max: 0.25, text: 'Before you get one-quarter of the way through your novel.' },
      b_story: { max: 0.25, text: 'Make sure it happens in the first 25% of the novel.' },
    },
  },
];

const ACT_NAMES: Record<string, string> = { I: 'Act One', IIA: 'Act Two, first half', IIB: 'Act Two, second half', III: 'Act Three' };

export class Structure {
  constructor(private store: Store, private brain: Brain, private ms: Manuscript) {}

  /** Built-in beat sheets plus her own methods' beat sheets. */
  registry(): Registry { return structureRegistry(this.store); }

  /** The beat sheet that drives this novel's board and placement (R-B-094). Other selected frameworks translate to it. */
  spine(projectId: string): string | null {
    const p = this.brain.project(projectId);
    if (p.profile.spine !== undefined) return (p.profile.spine as string | null);
    const has = new Set(this.brain.elements(projectId, { kind: 'beat' }).map((e) => (JSON.parse((e.attrs_json as string) || '{}') as Record<string, unknown>).template as string ?? 'save_the_cat'));
    return has.has('save_the_cat') ? 'save_the_cat' : [...has][0] ?? null;
  }

  /** Beat elements of this novel in order (the spine's, unless another sheet is named), with their definition. */
  beats(projectId: string, template?: string) {
    const which = template ?? this.spine(projectId);
    const reg = this.registry();
    const els = this.brain.elements(projectId, { kind: 'beat' });
    return els.map((e) => {
      const attrs = JSON.parse((e.attrs_json as string) || '{}') as Record<string, unknown>;
      const t = (attrs.template as string) ?? 'save_the_cat';
      const def = beatDef(t, attrs.template_key as string, reg);
      return { element: e, attrs: { ...attrs, template: t } as Record<string, unknown>, def, group: (attrs.group as string) ?? def?.group, act: (attrs.act as string) ?? def?.act };
    }).filter((b) => b.attrs.template === which).sort((a, b) => (a.element.sort_key as number) - (b.element.sort_key as number));
  }

  /** Turn on a beat sheet: its beats are created once, in order, never duplicated (R-C-013). The first one becomes the spine. */
  applyTemplate(projectId: string, template: string) {
    const defs = template === 'save_the_cat' ? SAVE_THE_CAT : this.registry().beats[template]?.map(toBeatDef);
    if (!defs) throw new NotFoundError('beat sheet');
    const mine = this.beats(projectId, template);
    const existing = new Set(mine.map((b) => b.attrs.template_key));
    const keyToId: Record<string, string> = Object.fromEntries(mine.map((b) => [b.attrs.template_key as string, b.element.id as string]));
    defs.forEach((d, i) => {
      if (existing.has(d.key)) {
        // Her method changed: keep the beat and everything placed on it, and follow its new name and order.
        const b = mine.find((x) => x.attrs.template_key === d.key)!;
        if (b.element.title !== d.name || b.element.sort_key !== i + 1 || b.attrs.act !== d.act) this.brain.updateElement(b.element.id as string, { title: d.name, sortKey: i + 1, attrs: { ...b.attrs, act: d.act, number: d.number, point: d.kind === 'point', retired: false } });
        return;
      }
      const el = this.brain.createElement(projectId, {
        kind: 'beat', title: d.name, sortKey: i + 1, parentId: d.parent ? keyToId[d.parent] ?? null : null,
        attrs: { template, template_key: d.key, number: d.number, ...(template === 'save_the_cat' ? { group: d.group } : {}), act: d.act, point: d.kind === 'point' },
      });
      keyToId[d.key] = el.id;
    });
    // Beats no longer in her method stay, with what is placed on them, marked so she can move things off them.
    for (const b of mine) if (!defs.some((d) => d.key === b.attrs.template_key) && !b.attrs.retired) this.brain.updateElement(b.element.id as string, { attrs: { ...b.attrs, retired: true } });
    const p = this.brain.project(projectId);
    const frameworks = new Set<string>((p.profile.frameworks as string[] | undefined) ?? []);
    frameworks.add(template);
    const spine = p.profile.spine === undefined || p.profile.spine === null ? (this.spineFromBeats(projectId) ?? template) : p.profile.spine;
    this.brain.updateProject(projectId, { profile: { ...p.profile, frameworks: [...frameworks], spine } });
    return this.beats(projectId, template);
  }

  private spineFromBeats(projectId: string) {
    const ts = new Set(this.brain.elements(projectId, { kind: 'beat' }).map((e) => (JSON.parse((e.attrs_json as string) || '{}') as Record<string, unknown>).template as string ?? 'save_the_cat'));
    return ts.has('save_the_cat') ? 'save_the_cat' : [...ts][0] ?? null;
  }

  applySaveTheCat(projectId: string) { return this.applyTemplate(projectId, 'save_the_cat'); }

  /**
   * Make another beat sheet the spine. Nothing placed is lost: placements on the old sheet stay as they were,
   * and if she asks, each one is offered on the matching beat of the new sheet as a candidate, waiting for her.
   */
  setSpine(projectId: string, template: string | null, carry = false) {
    const old = this.spine(projectId);
    let carried = 0;
    this.store.batch({ projectId, actor: 'author', reason: template ? `Use ${this.registry().names[template] ?? template} as the spine` : 'Write without a beat sheet' }, () => {
      if (template) this.applyTemplate(projectId, template);
      const p = this.brain.project(projectId);
      this.brain.updateProject(projectId, { profile: { ...p.profile, spine: template } });
      if (carry && old && template && old !== template) {
        const target = this.beats(projectId, template);
        const from = this.beats(projectId, old);
        for (const e of this.brain.elements(projectId).filter((x) => ['scene_plan', 'event'].includes(x.kind as string))) {
          const at = this.decidedBeat(e.id as string);
          const fb = at ? from.find((b) => b.element.id === at) : null;
          if (!fb) continue;
          const key = translate(old, fb.attrs.template_key as string, template, this.registry());
          const tb = key ? target.find((b) => b.attrs.template_key === key) : null;
          if (!tb) continue;
          const already = this.placements(e.id as string).candidates.some((c) => c.beatId === tb.element.id);
          if (!already) { this.place(e.id as string, tb.element.id as string, 'candidate'); carried++; }
        }
      }
    });
    return { spine: template, carried };
  }

  /** Her placement profiles: the two from her sheets, plus any she imported or made for this novel. */
  profiles(projectId: string): Profile[] {
    const spine = this.spine(projectId) ?? 'save_the_cat';
    const custom = ((this.brain.project(projectId).profile.placement_profiles as (Profile & { template?: string })[] | undefined) ?? []).filter((c) => (c.template ?? 'save_the_cat') === spine);
    if (spine === 'save_the_cat') return [...PROFILES, ...custom];
    const reg = this.registry();
    const defs = reg.beats[spine] ?? [];
    const own = spine.startsWith('method_');
    return [{ key: 'usual', name: own ? 'Your placement' : 'Usual placement', source: own ? `${reg.names[spine] ?? spine}, as you set it up` : `${reg.names[spine] ?? spine} as it is usually taught`, at: Object.fromEntries(defs.map((d) => [d.key, d.at])) }, ...custom];
  }

  /** The book's length for placement: target words, or the drafted total when no target is set. */
  private length(projectId: string) {
    const s = settingsOf(this.brain.project(projectId).profile);
    const drafted = this.ms.totalWords(projectId);
    return { target: s.targetWords, drafted, basis: s.targetWords ? 'target' : 'drafted', words: s.targetWords ?? drafted, wpp: s.wordsPerPage };
  }

  /**
   * Landmarks for every beat under each profile: percent, words and estimated pages at each density,
   * plus where the beat's scenes actually fall in the manuscript (planned vs written, R-C-011).
   */
  landmarks(projectId: string) {
    const len = this.length(projectId);
    const beats = this.beats(projectId);
    const written = this.writtenPositions(projectId);
    const total = len.drafted;
    return {
      length: len,
      unit: '% of the manuscript',
      profiles: this.profiles(projectId).map((p) => ({ key: p.key, name: p.name, source: p.source })),
      beats: beats.map((b) => {
        const key = b.attrs.template_key as string;
        const custom = b.attrs.placement as Record<string, [number, number]> | undefined;
        const at = Object.fromEntries(this.profiles(projectId).map((p) => {
          const r = custom?.[p.key] ?? p.at[key];
          if (!r) return [p.key, null];
          const words = [Math.round(r[0] * len.words), Math.round(r[1] * len.words)];
          return [p.key, { percent: r.map((x) => Math.round(x * 1000) / 10), words, pages: Object.fromEntries(len.wpp.map((w) => [w, words.map((x) => Math.max(1, Math.ceil(x / w)))])), window: p.windows?.[key] ?? null }];
        }));
        const w = written[b.element.id as string];
        const writtenPct = w && total > 0 ? Math.round((w.start / total) * 1000) / 10 : null;
        return { id: b.element.id, key, number: b.attrs.number, name: b.element.title, group: b.group, act: b.act, point: b.attrs.point, parentId: b.element.parent_id, at, written: w ? { ...w, percent: writtenPct } : null };
      }),
    };
  }

  /** Where each beat's decided scenes start and end in the drafted manuscript. */
  private writtenPositions(projectId: string) {
    const out: Record<string, { start: number; end: number; scenes: number }> = {};
    const outline = this.ms.outline(projectId);
    for (const ch of outline) for (const sc of ch.scenes) {
      if (!sc.plan_element_id) continue;
      const beat = this.decidedBeat(sc.plan_element_id as string);
      if (!beat) continue;
      const cur = out[beat] ?? { start: sc.words_before, end: sc.words_before + sc.word_count, scenes: 0 };
      cur.start = Math.min(cur.start, sc.words_before); cur.end = Math.max(cur.end, sc.words_before + sc.word_count); cur.scenes++;
      out[beat] = cur;
    }
    return out;
  }

  /** The beat a scene card or event is decided to sit at (its "beat" field's current value), if any. */
  decidedBeat(elementId: string): string | null {
    const v = this.brain.field(elementId, 'beat');
    return (v.current?.value as string | undefined) ?? null;
  }

  /** Candidate beats for an element: decided plus every possibility (R-C-012). */
  placements(elementId: string) {
    const v = this.brain.field(elementId, 'beat');
    return { decided: v.current ? { statementId: v.current.id, beatId: v.current.value as string } : null, candidates: v.possibilities.map((p) => ({ statementId: p.id, beatId: p.value as string, status: p.status })) };
  }

  /** Place a card or event at a beat. 'decide' replaces the decided placement (kept in history); 'candidate' adds an option beside others. */
  place(elementId: string, beatId: string, mode: 'decide' | 'candidate' = 'decide') {
    const el = this.brain.element(elementId);
    const beat = this.brain.element(beatId, el.project_id as string);
    if (beat.kind !== 'beat') throw new ValidationError('That is not a beat.');
    return this.brain.addStatement({ elementId, field: 'beat', value: beatId, status: mode === 'decide' ? 'established' : 'developing', speaker: { kind: 'author' }, supersedes: mode === 'decide' ? 'current' : null });
  }

  /** A scene card on the board: a scene plan, optionally linked to a manuscript scene. */
  addCard(projectId: string, input: { title: string; beatId?: string | null; mode?: 'decide' | 'candidate' }) {
    const cards = this.brain.elements(projectId, { kind: 'scene_plan' });
    const el = this.brain.createElement(projectId, { kind: 'scene_plan', title: input.title, sortKey: (cards.reduce((m, c) => Math.max(m, c.sort_key as number), 0) || 0) + 1 });
    if (input.beatId) this.place(el.id, input.beatId, input.mode ?? 'decide');
    return el;
  }

  /** The board: four rows (acts) of beats, each with its decided cards and candidate cards (R-C-004). */
  board(projectId: string) {
    const beats = this.beats(projectId);
    const cards = this.brain.elements(projectId, { kind: 'scene_plan' });
    const scenes = this.store.db.prepare('SELECT id, title, plan_element_id, status, word_count, chapter_id FROM scenes WHERE project_id=? AND deleted_at IS NULL').all(projectId) as Row[];
    const sceneOf = (planId: string) => scenes.find((s) => s.plan_element_id === planId) ?? null;
    const cardInfo = (c: Row) => {
      const pm = this.placements(c.id as string);
      const pm2 = this.brain.field(c.id as string, 'value_start'), pm3 = this.brain.field(c.id as string, 'value_end');
      return { id: c.id, title: c.title, sort: c.sort_key, reserved: c.reserved, scene: sceneOf(c.id as string), placements: pm, valueStart: pm2.latest?.value ?? null, valueEnd: pm3.latest?.value ?? null };
    };
    const infos = cards.map(cardInfo);
    const rows = (['I', 'IIA', 'IIB', 'III'] as const).map((act) => ({
      act, name: ACT_NAMES[act],
      beats: beats.filter((b) => b.act === act && !b.element.parent_id).map((b) => ({
        id: b.element.id, key: b.attrs.template_key, number: b.attrs.number, name: b.element.title, group: b.group,
        children: beats.filter((c) => c.element.parent_id === b.element.id).map((c) => ({ id: c.element.id, name: c.element.title })),
        cards: infos.filter((c) => c.placements.decided?.beatId === b.element.id || beats.some((ch) => ch.element.parent_id === b.element.id && c.placements.decided?.beatId === ch.element.id)).sort((x, y) => (x.sort as number) - (y.sort as number)),
        candidates: infos.filter((c) => c.placements.candidates.some((p) => p.beatId === b.element.id)),
      })),
    }));
    const unplaced = infos.filter((c) => !c.placements.decided);
    return { rows, unplaced, worlds: WORLDS };
  }

  /** One beat in her teaching format with this book's own fields (R-C-014). */
  beatDetail(beatId: string) {
    const page = this.brain.elementPage(beatId);
    const attrs = page.element.attrs as Record<string, unknown>;
    const template = (attrs.template as string) ?? 'save_the_cat';
    const reg = this.registry();
    const def = beatDef(template, attrs.template_key as string, reg);
    const pair = template === 'save_the_cat' ? PAIRS.find((p) => p.a === def?.key || p.b === def?.key) ?? null : null;
    const alsoCalled = Object.keys(reg.names).filter((t) => t !== template).map((t) => { const k = translate(template, attrs.template_key as string, t, reg); const d = k ? beatDef(t, k, reg) : null; return d ? { framework: reg.names[t]!, name: d.name } : null; }).filter(Boolean);
    return { page, def, pair, world: def && template === 'save_the_cat' ? WORLDS[def.group] : null, alsoCalled, template };
  }

  /** Questions (never errors) about the beat sheet as it stands (R-C-009, R-C-019, R-C-023). */
  questions(projectId: string, profileKey = 'brody') {
    const out: { beatId: string | null; text: string }[] = [];
    const beats = this.beats(projectId);
    const byKey = (k: string) => beats.find((b) => b.attrs.template_key === k);
    const polarity = (k: string) => { const b = byKey(k); return b ? (this.brain.field(b.element.id as string, 'polarity').current?.value as string | undefined) : undefined; };
    const mp = polarity('midpoint'), ail = polarity('all_is_lost');
    if (mp && ail && mp === ail) out.push({ beatId: byKey('all_is_lost')!.element.id as string, text: `Your Midpoint and All Is Lost are both "${mp}". Your rule says they are the inverse of each other. Intended?` });
    const lm = this.landmarks(projectId);
    const prof = this.profiles(projectId).find((p) => p.key === profileKey) ?? this.profiles(projectId)[0]!;
    for (const b of lm.beats) {
      const win = prof.windows?.[b.key];
      if (win && b.written?.percent != null && b.written.percent / 100 > win.max) out.push({ beatId: b.id as string, text: `${b.name} starts at ${b.written.percent}% of the manuscript. Your sheet says: "${win.text}" Intended?` });
    }
    // A disaster is a reversal, never a win (Ingermanson).
    for (const e of this.brain.elements(projectId).filter((x) => ['event', 'scene_plan'].includes(x.kind as string))) {
      const cls = this.brain.field(e.id as string, 'classification').current?.value as string | undefined;
      const beat = this.decidedBeat(e.id as string);
      const bk = beat ? beats.find((b) => b.element.id === beat)?.attrs.template_key : null;
      if (cls === 'win' && (bk === 'break_into_two' || bk === 'midpoint' || bk === 'all_is_lost')) out.push({ beatId: beat, text: `"${e.title}" is marked as a win at a disaster beat. A disaster is a reversal, never a win. Intended?` });
    }
    return out;
  }
}

export function profileByKey(key: string) { const p = PROFILES.find((x) => x.key === key); if (!p) throw new NotFoundError('placement profile'); return p; }

/** A beat's definition in any of the beat sheets. */
export function beatDef(template: string, key: string, reg?: Registry): BeatDef | null {
  if (template === 'save_the_cat') return SAVE_THE_CAT.find((d) => d.key === key) ?? null;
  const d = (reg?.beats ?? BUILT_IN)[template]?.find((x) => x.key === key);
  return d ? toBeatDef(d) : null;
}

function toBeatDef(d: StructBeat): BeatDef {
  return { key: d.key, number: d.number, name: d.name, act: d.act, kind: d.kind, group: undefined as unknown as BeatDef['group'], description: d.description, test: d.test, window: `Usually around ${Math.round(d.at[0] * 100)}%${d.at[1] !== d.at[0] ? ` to ${Math.round(d.at[1] * 100)}%` : ''} of the book.` };
}

/** The matching beat in another framework, by the moment both name (her Master Translation). */
export function translate(from: string, key: string, to: string, reg?: Registry): string | null {
  const beats = reg?.beats ?? BUILT_IN;
  const moment = from === 'save_the_cat' ? SAVE_THE_CAT_MOMENTS[key] : beats[from]?.find((d) => d.key === key)?.moment;
  if (!moment) return null;
  if (to === 'save_the_cat') return Object.entries(SAVE_THE_CAT_MOMENTS).find(([, m]) => m === moment)?.[0] ?? null;
  return beats[to]?.find((d) => d.moment === moment)?.key ?? null;
}

/** Save the Cat as a starting point for a method of her own. */
export function saveTheCatAsBeats(): StructBeat[] {
  const at = PROFILES[0]!.at;
  return SAVE_THE_CAT.filter((d) => !d.parent).map((d) => ({ key: d.key, number: d.number, name: d.name, act: d.act, kind: d.kind, at: at[d.key] ?? [0, 0], description: d.description ?? '', test: d.test, moment: SAVE_THE_CAT_MOMENTS[d.key] }));
}
