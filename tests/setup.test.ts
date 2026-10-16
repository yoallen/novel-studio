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
