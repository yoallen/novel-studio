// Setting up a novel (R-B-088 to R-B-095): genres and Snyder story types in separate lists with roles,
// narrative characteristics, the storytelling toolkit with "how I use it", and an author profile that new novels inherit.

import { Store, ValidationError, Row } from './store.js';
import { Brain } from './brain.js';
import { Structure } from './structure.js';
import { Continuity } from './continuity.js';
import { settingsOf, ProjectSettings } from './settings.js';
import { GENRES, STORY_TYPES, CHARACTERISTICS, CHARACTERISTIC_GROUPS, FRAMEWORKS, Role } from './catalog.js';
import { methods as myMethods, Method } from './methods.js';
import { FrameworkDef } from './catalog.js';
import { groupTitle } from './groupnames.js';

export interface GenreChoice { key: string; name: string; role: Role; custom?: boolean; parent?: string | null }
export interface SetupState {
  configured: boolean;
  genres: GenreChoice[];
  storyTypes: { key: string; role: Role }[];
  characteristics: string[];
  customCharacteristics: { key: string; name: string; group: string }[];
  frameworkNotes: Record<string, string>;
  customFrameworks: { key: string; name: string; job: string }[];
}

/** Who the author is, in the author's own words. Every line is optional; nothing is ever inferred. */
export interface AuthorAbout {
  name?: string;          // what to call them
  pronouns?: string;      // in their words; when empty the collaborator uses their name, or they
  approach?: string;      // plotter, pantser, somewhere between, or their own words
  experience?: string;    // how long they have been writing, books finished
  helpStyle?: string;     // how they like to be helped and taught
  avoid?: string;         // what drains them or what to stay away from
  more?: string;          // anything else they want the collaborator to know
  asked?: boolean;        // the Library has asked once; it does not ask again
}

export interface AuthorProfile {
  about: AuthorAbout;
  authorName: string;
  frameworks: string[];
  frameworkNotes: Record<string, string>;
  spine: string | null;
  settings: Partial<ProjectSettings>;
}

const ROLES: Role[] = ['primary', 'secondary', 'influence'];
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40) || 'custom';

export class Setup {
  constructor(private store: Store, private brain: Brain, private structure: Structure, private continuity: Continuity) {}

  /** A blank novel's first five answers, kept in pencil: who it is about, what they want, what is in the way,
   *  what they stand to lose, and how it might end. Every answer is optional. */
  plantSeed(projectId: string, a: { name?: string; who?: string; want?: string; obstacle?: string; stakes?: string; ending?: string }) {
    const clean = (x?: string) => (x ?? '').trim().slice(0, 2000);
    const name = clean(a.name).slice(0, 80), who = clean(a.who), want = clean(a.want), obstacle = clean(a.obstacle), stakes = clean(a.stakes), ending = clean(a.ending);
    const author = { kind: 'author' as const };
    const p = this.brain.project(projectId);
    return this.store.batch({ projectId, actor: 'author', reason: 'Plant the seed' }, () => {
      let characterId: string | null = null;
      if (name || who || want || obstacle || stakes) {
        const c = this.brain.createElement(projectId, { kind: 'character', title: name || 'The lead' });
        characterId = c.id as string;
        if (who) this.brain.addStatement({ elementId: characterId, field: 'essence', value: who, status: 'developing', speaker: author });
        this.brain.addStatement({ elementId: characterId, field: 'role', value: 'Lead', status: 'developing', speaker: author });
        if (want) this.brain.addStatement({ elementId: characterId, field: 'goal', value: want, status: 'developing', speaker: author });
        if (obstacle) this.brain.addStatement({ elementId: characterId, field: 'conflict', value: obstacle, status: 'developing', speaker: author });
        if (stakes) this.brain.addStatement({ elementId: characterId, field: 'stakes', value: stakes, status: 'developing', speaker: author });
      }
      if (ending) {
        const world = this.continuity.storyWorld(projectId, true) as Row;
        this.brain.addStatement({ elementId: world.id as string, field: 'ending', value: ending, status: 'developing', speaker: author });
      }
      this.brain.updateProject(projectId, { profile: { ...p.profile, seedStart: 'planted' } });
      return { characterId };
    });
  }

  /** "Not now" on the guided start: it does not come back for this novel. */
  skipSeed(projectId: string) {
    const p = this.brain.project(projectId);
    this.brain.updateProject(projectId, { profile: { ...p.profile, seedStart: 'skipped' } });
  }

  /** Built-in frameworks and every method of her own, as one toolkit. */
  frameworks(): (FrameworkDef & { own?: boolean; method?: Method })[] {
    return [...FRAMEWORKS, ...myMethods(this.store).map((m) => ({
      key: m.key, name: m.name, kind: (m.beats.length ? 'structure' : 'method') as FrameworkDef['kind'], job: m.job || (m.source ? `From ${m.source}.` : 'Your own method.'),
      ...(m.beats.length ? { structure: m.key } : {}), fieldGroups: [...new Set(m.fields.map((f) => f.kind))].map((kind) => ({ kind, group: m.name })), own: true, method: m,
    }))];
  }

  state(projectId: string): SetupState {
    const p = this.brain.project(projectId).profile;
    const s = (p.setup ?? {}) as Partial<SetupState>;
    return {
      configured: !!s.configured, genres: s.genres ?? [], storyTypes: s.storyTypes ?? [], characteristics: s.characteristics ?? [],
      customCharacteristics: s.customCharacteristics ?? [], frameworkNotes: s.frameworkNotes ?? (p.framework_notes as Record<string, string> | undefined) ?? {}, customFrameworks: s.customFrameworks ?? [],
    };
  }

  /** The heart of the book, kept in one place: the story world's one sentence and one paragraph.
   *  An older novel's one sentence from its first page is read until the story world has its own. */
  heart(projectId: string) {
    const p = this.brain.project(projectId);
    const world = this.continuity.storyWorld(projectId);
    const get = (f: string) => { if (!world) return null; const v = this.brain.field(world.id as string, f); return v.current ?? v.latest ?? null; };
    const one = get('logline'), para = get('paragraph');
    return {
      sentence: (one?.value as string | undefined) ?? (p.profile.premise_sentence as string | undefined) ?? '', sentenceStatus: (one?.status as string | undefined) ?? null,
      paragraph: (para?.value as string | undefined) ?? '', paragraphStatus: (para?.status as string | undefined) ?? null,
    };
  }

  /** Write the one sentence or one paragraph into the story world. A decided one stays decided; the earlier wording stays in history. */
  writeHeart(projectId: string, field: 'logline' | 'paragraph', text: string) {
    const value = text.trim();
    if (!value) return;
    const world = this.continuity.storyWorld(projectId, true) as Row;
    const v = this.brain.field(world.id as string, field);
    const cur = v.current ?? v.latest;
    if (cur && cur.value === value) return;
    this.brain.addStatement({ elementId: world.id as string, field, value, status: cur?.status === 'established' ? 'established' : 'developing', speaker: { kind: 'author' }, supersedes: cur ? (cur.id as string) : null });
  }

  /** Everything the setup screen needs, including what each choice switches on. */
  get(projectId: string) {
    const p = this.brain.project(projectId);
    const st = this.state(projectId);
    const world = this.continuity.storyWorld(projectId);
    const heart = this.heart(projectId);
    const ingredients = st.storyTypes.map((t) => {
      const def = STORY_TYPES.find((d) => d.key === t.key);
      return def ? { key: t.key, name: def.name, role: t.role, items: def.ingredients.map((i) => {
        const v = world ? this.brain.field(world.id as string, `st_${t.key}_${i.key}`) : null;
        return { ...i, field: `st_${t.key}_${i.key}`, value: (v?.current?.value ?? v?.latest?.value ?? null) as string | null };
      }) } : null;
    }).filter(Boolean);
    return {
      title: p.title, premise: heart.sentence, premiseStatus: heart.sentenceStatus, paragraph: heart.paragraph, paragraphStatus: heart.paragraphStatus,
      setup: st,
      frameworks: (p.profile.frameworks as string[] | undefined) ?? [],
      spine: this.structure.spine(projectId),
      storyWorldId: world?.id ?? null,
      ingredients,
      asks: st.genres.filter((g) => g.role !== 'influence').flatMap((g) => (GENRES.find((d) => d.key === g.key)?.asks ?? []).map((q) => ({ genre: g.name, question: q }))),
      catalog: { genres: GENRES.map(({ key, name, leansOn, about }) => ({ key, name, leansOn, about })), storyTypes: STORY_TYPES.map(({ key, name, about, ingredients }) => ({ key, name, about, needs: ingredients.map((i) => i.label) })), characteristics: CHARACTERISTICS, characteristicGroups: CHARACTERISTIC_GROUPS, frameworks: this.frameworks().map(({ method, ...f }) => ({ ...f, questions: method?.questions ?? [], source: method?.source ?? '' })), structures: this.structure.registry().names },
    };
  }

  /** Change the setup. Selections can change at any time as the story evolves; nothing she wrote is removed. */
  update(projectId: string, patch: Partial<Omit<SetupState, 'configured'>> & { frameworks?: string[]; spine?: string | null; carryPlacements?: boolean; premise?: string; paragraph?: string }) {
    const cur = this.state(projectId);
    const next: SetupState = { ...cur, configured: true };
    if (patch.genres) {
      for (const g of patch.genres) if (!ROLES.includes(g.role)) throw new ValidationError('Each genre is primary, secondary or an influence.');
      next.genres = patch.genres.map((g) => {
        const known = GENRES.find((d) => d.key === g.key);
        return known ? { key: known.key, name: known.name, role: g.role, parent: g.parent ?? null } : { key: g.key || `custom_${slug(g.name)}`, name: g.name.trim().slice(0, 80), role: g.role, custom: true, parent: g.parent ?? null };
      }).filter((g) => g.name);
      if (new Set(next.genres.map((g) => g.key)).size !== next.genres.length) throw new ValidationError('A genre is listed twice.');
    }
    if (patch.storyTypes) {
      for (const t of patch.storyTypes) {
        if (!STORY_TYPES.some((d) => d.key === t.key)) throw new ValidationError('That is not one of the ten story types.');
        if (!ROLES.includes(t.role)) throw new ValidationError('Each story type is primary, secondary or an influence.');
      }
      next.storyTypes = patch.storyTypes;
    }
    if (patch.customCharacteristics) next.customCharacteristics = patch.customCharacteristics.map((c) => ({ key: c.key || `custom_${slug(c.name)}`, name: c.name.trim().slice(0, 80), group: (c.group || 'My own').slice(0, 40) })).filter((c) => c.name);
    if (patch.characteristics) {
      const known = new Set([...CHARACTERISTICS.map((c) => c.key), ...next.customCharacteristics.map((c) => c.key)]);
      for (const k of patch.characteristics) if (!known.has(k)) throw new ValidationError('Unknown narrative characteristic.');
      next.characteristics = [...new Set(patch.characteristics)];
    }
    if (patch.customFrameworks) next.customFrameworks = patch.customFrameworks.map((f) => ({ key: f.key || `custom_${slug(f.name)}`, name: f.name.trim().slice(0, 80), job: (f.job ?? '').slice(0, 1000) })).filter((f) => f.name);
    if (patch.frameworkNotes) next.frameworkNotes = { ...cur.frameworkNotes, ...Object.fromEntries(Object.entries(patch.frameworkNotes).map(([k, v]) => [k, String(v).slice(0, 4000)])) };

    return this.store.batch({ projectId, actor: 'author', reason: 'Change novel setup' }, () => {
      const p = this.brain.project(projectId);
      let frameworks = (p.profile.frameworks as string[] | undefined) ?? [];
      if (patch.frameworks) {
        const known = new Set([...this.frameworks().map((f) => f.key), ...next.customFrameworks.map((f) => f.key)]);
        for (const k of patch.frameworks) if (!known.has(k)) throw new ValidationError('Unknown framework.');
        frameworks = [...new Set(patch.frameworks)];
      }
      const profile: Record<string, unknown> = { ...p.profile, setup: next, frameworks };
      if (patch.premise !== undefined) profile.premise_sentence = patch.premise.slice(0, 600);
      this.brain.updateProject(projectId, { profile });
      // One home for the heart of the book: the story world.
      if (patch.premise !== undefined) this.writeHeart(projectId, 'logline', patch.premise.slice(0, 600));
      if (patch.paragraph !== undefined) this.writeHeart(projectId, 'paragraph', patch.paragraph.slice(0, 4000));
      // Beat sheets: the spine she chooses, or the first structure she ticked. "Find it as I write" means none.
      const all = this.frameworks();
      const structures = frameworks.filter((k) => all.find((f) => f.key === k)?.kind === 'structure');
      // A method of her own brings its fields into this novel the first time it is chosen.
      for (const k of frameworks) {
        const m = all.find((f) => f.key === k)?.method;
        if (!m) continue;
        for (const fd of m.fields) {
          if (!this.brain.fieldsFor(projectId, fd.kind, { all: true }).some((x) => x.label.toLowerCase() === fd.label.toLowerCase() && x.group === m.name)) this.brain.defineField(projectId, { kind: fd.kind, label: fd.label, group: m.name, prompt: fd.prompt });
        }
      }
      let spine = patch.spine !== undefined ? patch.spine : this.structure.spine(projectId);
      if (spine && !structures.includes(spine)) spine = structures[0] ?? null;
      if (!spine && structures.length && patch.spine === undefined) spine = structures[0]!;
      if (frameworks.includes('discovery') && !structures.length) spine = null;
      if (spine !== this.structure.spine(projectId) || (spine && !this.structure.beats(projectId, spine).length)) this.structure.setSpine(projectId, spine, !!patch.carryPlacements);
      // Characteristics that need a home record get one.
      if (next.storyTypes.length || next.characteristics.some((c) => ['unreliable_narrator', 'hidden_truth', 'multiple_pov'].includes(c))) this.continuity.storyWorld(projectId, true);
      return this.get(projectId);
    });
  }

  // ---------- author profile (R-B-095) ----------

  authorProfile(): AuthorProfile {
    const r = this.store.db.prepare("SELECT value_json FROM settings WHERE key='author_profile'").get() as Row | undefined;
    const v = r ? JSON.parse(r.value_json as string) as Partial<AuthorProfile> : {};
    return { about: v.about ?? {}, authorName: v.authorName ?? '', frameworks: v.frameworks ?? [], frameworkNotes: v.frameworkNotes ?? {}, spine: v.spine ?? null, settings: v.settings ?? {} };
  }

  setAuthorProfile(patch: Partial<AuthorProfile>) {
    const raw = (() => { const r = this.store.db.prepare("SELECT value_json FROM settings WHERE key='author_profile'").get() as Row | undefined; return r ? JSON.parse(r.value_json as string) as Record<string, unknown> : {}; })();
    const next = { ...raw, ...this.authorProfile(), ...patch };
    if (patch.frameworks) for (const k of patch.frameworks) if (!this.frameworks().some((f) => f.key === k)) throw new ValidationError('Unknown framework.');
    this.store.db.prepare("INSERT INTO settings(key,value_json) VALUES ('author_profile',?) ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json").run(JSON.stringify(next));
    return next;
  }

  /** Save this novel's choices as her defaults for new novels. Existing novels are not touched. */
  saveAsDefaults(projectId: string) {
    const p = this.brain.project(projectId);
    const st = settingsOf(p.profile);
    const s = this.state(projectId);
    return this.setAuthorProfile({
      authorName: st.authorName, frameworks: ((p.profile.frameworks as string[] | undefined) ?? []).filter((k) => this.frameworks().some((f) => f.key === k)),
      frameworkNotes: s.frameworkNotes, spine: this.structure.spine(projectId),
      settings: { guidanceWhileDrafting: st.guidanceWhileDrafting, guidanceWhilePlanning: st.guidanceWhilePlanning, wordsPerPage: st.wordsPerPage, statusLabels: st.statusLabels, ownedLabel: st.ownedLabel, reservedMarkers: st.reservedMarkers, sceneLadder: st.sceneLadder, importLabels: st.importLabels, authorName: st.authorName },
    });
  }

  /** A new novel starts from her author profile; anything can be changed afterwards. */
  createNovel(title: string, input: { useDefaults?: boolean; frameworks?: string[]; spine?: string | null; profile?: Record<string, unknown> } = {}) {
    const a = this.authorProfile();
    const useDefaults = input.useDefaults !== false;
    const base: Record<string, unknown> = { ...(input.profile ?? {}) };
    if (useDefaults) base.settings = { ...a.settings, ...(a.authorName ? { authorName: a.authorName } : {}), ...((base.settings as Record<string, unknown>) ?? {}) };
    return this.store.batch({ actor: 'author', reason: `Create novel "${title.trim()}"` }, () => {
      const p = this.brain.createProject(title, base);
      const frameworks = input.frameworks ?? (useDefaults ? a.frameworks : []);
      if (frameworks.length) this.update(p.id as string, { frameworks, frameworkNotes: useDefaults ? a.frameworkNotes : {}, ...(input.spine !== undefined ? { spine: input.spine } : a.spine && frameworks.includes(a.spine) ? { spine: a.spine } : {}) });
      if (typeof base.premise_sentence === 'string' && base.premise_sentence.trim()) this.writeHeart(p.id as string, 'logline', base.premise_sentence);
      return this.brain.project(p.id as string);
    });
  }

  /** What the selections switch on, said plainly. */
  activeFeatures(projectId: string) {
    const st = this.state(projectId);
    const p = this.brain.project(projectId).profile;
    const fw = (p.frameworks as string[] | undefined) ?? [];
    const out: string[] = [];
    for (const k of fw) { const f = this.frameworks().find((x) => x.key === k); if (f?.fieldGroups?.length) out.push(`${f.name}: ${f.fieldGroups.map((g) => `${groupTitle(g.group)} on ${g.kind === 'scene_plan' ? 'scene cards' : g.kind === 'storyworld' ? 'the story world' : `each ${g.kind}`}`).join('; ')}`); }
    for (const k of st.characteristics) { const c = CHARACTERISTICS.find((x) => x.key === k); if (c?.turnsOn) out.push(`${c.name}: ${c.turnsOn}`); }
    return out;
  }
}
