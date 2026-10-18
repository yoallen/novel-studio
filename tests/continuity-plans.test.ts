import { describe, it, expect, afterEach } from 'vitest';
import { freshStore } from './helpers.js';
import { Structure } from '../src/core/structure.js';
import { Ripple } from '../src/core/ripple.js';
import { Continuity } from '../src/core/continuity.js';
import { WritingDesk } from '../src/core/writing.js';
import { Cast } from '../src/core/cast.js';
import { Lenses } from '../src/core/lenses.js';
import { namesIn } from '../src/core/revise.js';

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());

function setup() {
  env = freshStore();
  const pid = env.brain.createProject('I Declare War').id as string;
  const st = new Structure(env.store, env.brain, env.ms);
  const rp = new Ripple(env.store, env.brain, env.ms, st);
  const ct = new Continuity(env.store, env.brain, env.ms, st, rp);
  const cast = new Cast(env.store, env.brain, env.ms, st, rp, new WritingDesk(env.store, env.brain, env.ms));
  const ln = new Lenses(env.store, env.brain, env.ms, st, ct);
  st.applySaveTheCat(pid);
  const beat = (k: string) => st.beats(pid).find((b) => b.attrs.template_key === k)!.element.id as string;
  const el = (kind: string, title: string) => env.brain.createElement(pid, { kind, title });
  const link = (a: string, b: string, r: string) => env.brain.link(pid, { fromId: a, toId: b, relation: r as never });
  const say = (id: string, field: string, value: unknown, status = 'established') => env.brain.addStatement({ elementId: id, field, value, status: status as never, speaker: { kind: 'author' } });
  return { pid, st, rp, ct, cast, ln, beat, el, link, say };
}

describe('continuity sees the planned scene cards, marked apart from written scenes', () => {
  it('places decided, might-go and unplaced cards, and keeps the structural rules on the firm order', () => {
    const { pid, st, rp, ct, cast, beat, el, link } = setup();
    const ch = env.ms.addChapter(pid, 'Chapter 1');
    const s1 = env.ms.addScene(ch.id as string, { title: 'Scene 1', text: 'Kevin waved.' });
    const opening = st.addCard(pid, { title: 'Scene 1', beatId: beat('opening_image') });
    env.ms.updateSceneMeta(s1.id as string, { planElementId: opening.id });
    st.addCard(pid, { title: 'The brawl', beatId: beat('midpoint') });
    const pie = st.addCard(pid, { title: 'Block-party pie', beatId: beat('fun_and_games'), mode: 'candidate' });
    const apology = st.addCard(pid, { title: "Kevin's apology" });
    const kevin = el('character', 'Kevin');
    link(kevin.id, apology.id, 'appears_in'); link(kevin.id, pie.id, 'appears_in');

    // The story's firm order is unchanged.
    expect(rp.order(pid).map((u) => u.title)).toEqual(['Scene 1', 'The brawl']);
    const all = rp.order(pid, { plans: true });
    expect(all.map((u) => [u.title, u.standing])).toEqual([['Scene 1', 'written'], ['Block-party pie', 'might'], ['The brawl', 'card'], ["Kevin's apology", 'unplaced']]);

    const t = ct.timelines(pid);
    expect(t.narrative.map((r) => r.standing)).toEqual(['written', 'might', 'card', 'unplaced']);

    const c = cast.presence(pid);
    const unplaced = c.places.find((p) => p.title === "Kevin's apology")!;
    expect(unplaced).toMatchObject({ act: 'none', standing: 'unplaced', drafted: false });
    const row = c.rows.find((r) => r.title === 'Kevin')!;
    expect(row.cells[unplaced.key]).toBe('planned');
    expect(row.cells[pie.id]).toBe('planned');
    expect(c.notes.some((n) => n.text.startsWith('Kevin has a record but'))).toBe(false);
  });

  it('counts the clue\'s own "Where it is planted" and "Where it pays off" words, pointing at the cards and beats they name', () => {
    const { pid, st, ct, beat, el, say } = setup();
    st.addCard(pid, { title: 'The cruel exchange', beatId: beat('midpoint') });
    st.addCard(pid, { title: 'Memory-care visit' });
    const clue = el('clue', 'No grave marker');
    say(clue.id, 'significant', 'Yes');
    say(clue.id, 'planted', 'Cruel exchange, early in Fun and Games');
    say(clue.id, 'paid_off', 'Memory-care visit reveals the father', 'developing');
    const r = ct.clues(pid).find((x) => x.title === 'No grave marker')!;
    expect(r.plants).toEqual([]);
    expect(r.plantedWords[0]).toMatchObject({ text: 'Cruel exchange, early in Fun and Games', sure: true });
    expect(r.plantedWords[0]!.cards.map((x) => [x.title, x.standing])).toEqual([['The cruel exchange', 'card']]);
    expect(r.plantedWords[0]!.beats.map((x) => x.title)).toEqual(['Fun and Games']);
    expect(r.paidOffWords[0]).toMatchObject({ sure: false });
    expect(r.paidOffWords[0]!.cards.map((x) => [x.title, x.standing])).toEqual([['Memory-care visit', 'unplaced']]);
    // Planted and paid off in her own words: nothing to ask.
    expect(ct.checks(pid).filter((f) => f.rule.includes('pay') || f.rule.includes('plant'))).toEqual([]);

    const lonely = el('clue', 'The five-dollar bill');
    say(lonely.id, 'paid_off', 'The reveal');
    expect(ct.checks(pid).map((f) => f.key)).toContain(`clue-noplant:${lonely.id}`);
  });
});

describe('viewpoint defaults and what a scene says for itself', () => {
  it('drops the stray period from the book default and keeps the scene\'s own values apart', () => {
    const { pid, ct, say } = setup();
    const world = ct.storyWorld(pid, true)!;
    say(world.id as string, 'pov_person', 'Kevin narrates in first person.');
    const ch = env.ms.addChapter(pid, 'Chapter 1');
    const s = env.ms.addScene(ch.id as string, { title: 'Porch' });
    ct.setScenePov(s.id as string, { tense: 'Past' });
    const cov = ct.povCoverage(pid);
    expect(cov.defaults.person).toBe('Kevin narrates in first person');
    expect(cov.chapters[0]!.scenes[0]).toMatchObject({ person: 'Kevin narrates in first person', tense: 'Past', own: { person: null, tense: 'Past', povId: null } });
  });
});

describe('names at the start of a sentence', () => {
  it('counts a known name that only ever starts sentences, and not other capitalized words', () => {
    const t = 'Kevin slammed the door. Anthony laughed. Then nobody spoke.';
    expect([...namesIn(t).keys()]).toEqual([]);
    expect([...namesIn(t, new Set(['Kevin', 'Anthony'])).entries()].sort()).toEqual([['Anthony', 1], ['Kevin', 1]]);
    const { pid, ln, el } = setup();
    el('character', 'Kevin Wickley');
    const ch = env.ms.addChapter(pid);
    env.ms.addScene(ch.id as string, { title: 'Door', text: t });
    expect(ln.names(pid).names.map((n) => n.name)).toEqual(['Kevin']);
  });
});
