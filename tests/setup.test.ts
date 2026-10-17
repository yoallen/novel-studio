import { describe, it, expect, afterEach } from 'vitest';
import { freshStore } from './helpers.js';
import { Structure } from '../src/core/structure.js';
import { Ripple } from '../src/core/ripple.js';
import { Continuity } from '../src/core/continuity.js';
import { Setup } from '../src/core/setup.js';

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());
function setup() {
  env = freshStore();
  const st = new Structure(env.store, env.brain, env.ms);
  const rp = new Ripple(env.store, env.brain, env.ms, st);
  const ct = new Continuity(env.store, env.brain, env.ms, st, rp);
  return { st, ct, su: new Setup(env.store, env.brain, st, ct) };
}

describe('novel setup (R-B-088 to R-B-095)', () => {
  it('AC01: a thriller with the Hero\'s Journey gets its own beats and nothing from Save the Cat or I Declare War', () => {
    const { st, su } = setup();
    const p = su.createNovel('The Replacement');
    const pid = p.id as string;
    su.update(pid, { genres: [{ key: 'thriller', name: 'Thriller', role: 'primary' }, { key: 'custom', name: 'Psychological thriller', role: 'secondary' }], frameworks: ['heros_journey'] });
    const beats = st.beats(pid);
    expect(beats.map((b) => b.element.title)).toContain('Crossing the First Threshold');
    expect(beats).toHaveLength(12);
    expect(env.brain.elements(pid, { kind: 'beat' }).some((e) => e.title === 'Catalyst')).toBe(false);
    const lm = st.landmarks(pid);
    expect(lm.profiles.map((x) => x.key)).toEqual(['usual']);
    const all = JSON.stringify([env.brain.elements(pid), st.landmarks(pid)]);
    for (const w of ['Kevin', 'ledger', 'Francine', 'Thesis World']) expect(all).not.toContain(w);
    const s = su.get(pid);
    expect(s.setup.genres.map((g) => [g.name, g.role])).toEqual([['Thriller', 'primary'], ['Psychological thriller', 'secondary']]);
    expect(s.asks.some((a) => a.question.includes('ticking clock'))).toBe(true);
  });

  it('genres and Snyder story types are separate lists, each with roles; a story type brings its three ingredients', () => {
    const { su } = setup();
    const pid = su.createNovel('IDW test').id as string;
    su.update(pid, {
      genres: [{ key: 'comedy', name: 'Comedy', role: 'primary' }, { key: 'mystery', name: 'Mystery', role: 'secondary' }, { key: '', name: 'Neighborhood farce', role: 'influence' }],
      storyTypes: [{ key: 'buddy_love', role: 'primary' }, { key: 'fool_triumphant', role: 'secondary' }],
    });
    const s = su.get(pid);
    expect(s.setup.genres.map((g) => g.name)).toEqual(['Comedy', 'Mystery', 'Neighborhood farce']);
    expect(s.setup.storyTypes.map((t) => t.key)).toEqual(['buddy_love', 'fool_triumphant']);
    expect(s.ingredients[0]!.items.map((i) => i.label)).toEqual(['An incomplete hero', 'A counterpart', 'A complication']);
    const fields = env.brain.fieldsFor(pid, 'storyworld').map((f) => f.field);
    expect(fields).toContain('st_buddy_love_counterpart');
    su.update(pid, { genres: [{ key: 'comedy', name: 'Comedy', role: 'primary' }] });
    expect(su.get(pid).setup.genres).toHaveLength(1);
    expect(() => su.update(pid, { storyTypes: [{ key: 'space_opera', role: 'primary' }] })).toThrow(/ten story types/);
  });

  it('choosing "unreliable narrator" puts belief beside truth on every scene card; frameworks switch their own fields on', () => {
    const { su } = setup();
    const pid = su.createNovel('Unreliable').id as string;
    const before = env.brain.fieldsFor(pid, 'scene_plan').map((f) => f.field);
    expect(before).not.toContain('narrator_believes');
    su.update(pid, { characteristics: ['unreliable_narrator', 'first_person'], frameworks: ['weiland', 'swain'] });
    const after = env.brain.fieldsFor(pid, 'scene_plan').map((f) => f.field);
    expect(after).toEqual(expect.arrayContaining(['narrator_believes', 'actually_true', 'scene_kind', 'dilemma']));
    expect(env.brain.fieldsFor(pid, 'character').some((f) => f.group === 'Ingermanson')).toBe(false);
    expect(env.brain.fieldsFor(pid, 'arc').some((f) => f.group === 'Weiland Arc')).toBe(true);
    // Something already written is never hidden.
    const c = env.brain.createElement(pid, { kind: 'character', title: 'Ann' });
    env.brain.addStatement({ elementId: c.id, field: 'goal', value: 'Get home', status: 'established', speaker: { kind: 'author' } });
    const page = env.brain.elementPage(c.id);
    expect(page.fields.find((f) => f.def.field === 'goal')?.def.label).toBe('Goal');
  });

  it('discovery writing: no beat sheet, and the board is simply empty', () => {
    const { st, su } = setup();
    const pid = su.createNovel('Pantser').id as string;
    su.update(pid, { frameworks: ['discovery'] });
    expect(st.spine(pid)).toBeNull();
    expect(st.beats(pid)).toHaveLength(0);
    const ch = env.ms.addChapter(pid);
    expect(env.ms.addScene(ch.id as string, { text: 'It began.' }).word_count).toBe(2);
  });

  it('switching the spine changes the beat list; placements are offered on the matching beat and wait for her', () => {
    const { st, su } = setup();
    const pid = su.createNovel('Switch').id as string;
    su.update(pid, { frameworks: ['save_the_cat'] });
    const bi2 = st.beats(pid).find((b) => b.attrs.template_key === 'break_into_two')!;
    const card = st.addCard(pid, { title: 'He declares war', beatId: bi2.element.id as string });
    su.update(pid, { frameworks: ['save_the_cat', 'heros_journey'], spine: 'heros_journey', carryPlacements: true });
    expect(st.beats(pid).map((b) => b.attrs.template_key)).toContain('crossing_threshold');
    const pl = st.placements(card.id as string);
    expect(pl.decided?.beatId).toBe(bi2.element.id);
    const threshold = st.beats(pid).find((b) => b.attrs.template_key === 'crossing_threshold')!;
    expect(pl.candidates.map((c) => c.beatId)).toContain(threshold.element.id);
    expect(st.beatDetail(threshold.element.id as string).alsoCalled.map((a) => a!.name)).toEqual(expect.arrayContaining(['Break into Two', 'Plot Point 1']));
    su.update(pid, { spine: 'save_the_cat' });
    expect(st.beats(pid).some((b) => b.attrs.template_key === 'catalyst')).toBe(true);
  });

  it('the author profile: new novels pick up her defaults; existing novels are untouched', () => {
    const { st, su } = setup();
    const first = su.createNovel('First').id as string;
    env.brain.updateSettings(first, { authorName: 'Yolanda', wordsPerPage: [250, 300] });
    su.update(first, { frameworks: ['save_the_cat', 'mckee', 'weiland', 'snowflake'], frameworkNotes: { save_the_cat: 'The spine.' } });
    su.saveAsDefaults(first);
    const second = su.createNovel('Second').id as string;
    expect(env.brain.project(second).profile.frameworks).toEqual(['save_the_cat', 'mckee', 'weiland', 'snowflake']);
    expect(st.beats(second)).toHaveLength(21);
    expect(env.brain.settings(second).authorName).toBe('Yolanda');
    expect(su.get(second).setup.frameworkNotes.save_the_cat).toBe('The spine.');
    su.setAuthorProfile({ frameworks: ['three_act'], spine: 'three_act' });
    expect(env.brain.project(first).profile.frameworks).toEqual(['save_the_cat', 'mckee', 'weiland', 'snowflake']);
    const blank = su.createNovel('Blank', { useDefaults: false }).id as string;
    expect(st.beats(blank)).toHaveLength(0);
  });
});

describe('identity in her words, and the Ackerman and Puglisi thesauri', () => {
  it('identity, appearance and voice fields are always there, with suggestions she can tap', () => {
    const { su } = setup();
    const pid = su.createNovel('Anyone').id as string;
    const defs = env.brain.fieldsFor(pid, 'character');
    for (const f of ['gender', 'pronouns', 'orientation', 'sex_characteristics', 'skin', 'hair', 'languages', 'accent', 'disability']) expect(defs.some((d) => d.field === f)).toBe(true);
    expect(defs.find((d) => d.field === 'pronouns')!.suggestions).toContain('they/them');
  });
  it('the thesaurus fields appear only when the thesauri are in the toolkit', () => {
    const { su } = setup();
    const pid = su.createNovel('Anyone').id as string;
    su.update(pid, { frameworks: ['save_the_cat'] });
    expect(env.brain.fieldsFor(pid, 'character').some((d) => d.field === 'wound_belief')).toBe(false);
    su.update(pid, { frameworks: ['save_the_cat', 'thesauri'] });
    expect(env.brain.fieldsFor(pid, 'character').some((d) => d.field === 'wound_belief')).toBe(true);
    expect(env.brain.fieldsFor(pid, 'scene_plan').some((d) => d.field === 'outward_signals')).toBe(true);
  });

  it('setup covers any book: genres, tone, heat, tense, readership and tropes, each group taking her own entries', () => {
    const { su } = setup();
    const pid = su.createNovel('Till the End of Time').id as string;
    const d = su.get(pid) as any;
    const keys = d.catalog.characteristics.map((c: any) => c.key);
    for (const k of ['bittersweet', 'heat_steamy', 'past_tense', 'adult', 'trope_second_chance', 'cw_death', 'hidden_world']) expect(keys).toContain(k);
    expect(d.catalog.genres.map((g: any) => g.key)).toEqual(expect.arrayContaining(['magical_realism', 'literary_romance', 'psychological_thriller', 'urban_fantasy']));
    expect(d.catalog.characteristicGroups.find((g: any) => g.name === 'Tense').one).toBe(true);
    su.update(pid, { customCharacteristics: [{ key: '', name: 'Aching', group: 'Tone' }] });
    const own = (su.get(pid) as any).setup.customCharacteristics[0];
    expect(own).toMatchObject({ name: 'Aching', group: 'Tone' });
    su.update(pid, { characteristics: ['trope_friends_to_lovers', 'trope_second_chance', own.key, 'heat_sensual'] });
    expect(su.activeFeatures(pid).join(' ')).toMatch(/heat field/);
  });

  it('a blank novel can be started from six answers, all kept in pencil', () => {
    const { su, ct } = setup();
    const pid = su.createNovel('The Death of Sabrina Sawyer').id as string;
    const r = su.plantSeed(pid, { name: 'Sabrina Sawyer', who: 'A woman who learned to thrive but never let herself feel it.', want: 'One week off, finally.', ending: 'She forgives every Sabrina, herself included.' });
    const lead = env.brain.field(r.characterId!, 'goal');
    expect(lead.current).toBeNull(); // nothing decided
    expect(lead.possibilities.map((x) => x.value)).toContain('One week off, finally.');
    expect(env.brain.element(r.characterId!).title).toBe('Sabrina Sawyer');
    const world = ct.storyWorld(pid) as any;
    expect(env.brain.field(world.id, 'ending').possibilities[0]!.value).toMatch(/forgives/);
    expect(env.brain.project(pid).profile.seedStart).toBe('planted');
  });
});
