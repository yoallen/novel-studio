import { describe, it, expect, afterEach } from 'vitest';
import { freshStore } from './helpers.js';
import { Structure } from '../src/core/structure.js';
import { Ripple } from '../src/core/ripple.js';
import { Continuity } from '../src/core/continuity.js';

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());
function setup() {
  env = freshStore();
  const pid = env.brain.createProject('I Declare War').id as string;
  const st = new Structure(env.store, env.brain, env.ms);
  const rp = new Ripple(env.store, env.brain, env.ms, st);
  const ct = new Continuity(env.store, env.brain, env.ms, st, rp);
  st.applySaveTheCat(pid);
  const beat = (k: string) => st.beats(pid).find((b) => b.attrs.template_key === k)!.element.id as string;
  const el = (kind: string, title: string) => env.brain.createElement(pid, { kind, title });
  const link = (a: string, b: string, r: string, note?: string) => env.brain.link(pid, { fromId: a, toId: b, relation: r as never, note });
  const say = (id: string, field: string, value: unknown, extra: Record<string, unknown> = {}) => env.brain.addStatement({ elementId: id, field, value, status: 'established', speaker: { kind: 'author' }, ...extra });
  return { pid, st, rp, ct, beat, el, link, say };
}

describe('viewpoint (R-C-041 to R-C-044)', () => {
  it('scenes inherit the chapter viewpoint; the one-per-scene rule asks about a second head; a withheld viewpoint is protected', () => {
    const { pid, st, ct, beat, el, say } = setup();
    const world = ct.storyWorld(pid, true)!;
    say(world.id as string, 'pov_rule', 'One viewpoint per scene, heads change only at a seam');
    say(world.id as string, 'pov_person', 'First person');
    const kevin = el('character', 'Kevin'), anthony = el('character', 'Anthony'), francine = el('character', 'Francine');
    say(francine.id, 'pov_withheld_until', beat('all_is_lost'));
    const ch = env.ms.addChapter(pid, 'Chapter 1');
    ct.setChapterPov(ch.id, { povElementId: kevin.id });
    const s1 = env.ms.addScene(ch.id, { title: 'Driveway' });
    const s2 = env.ms.addScene(ch.id, { title: 'Fence' });
    ct.setScenePov(s2.id as string, { also: [anthony.id] });
    const cov = ct.povCoverage(pid);
    expect(cov.chapters[0]!.scenes[0]).toMatchObject({ pov: { title: 'Kevin', inherited: true }, person: 'First person' });
    // Put a Francine-viewpoint scene before All Is Lost.
    const s3 = env.ms.addScene(ch.id, { title: 'The garden at night' });
    env.ms.updateSceneMeta(s3.id as string, { povElementId: francine.id });
    const plan = st.addCard(pid, { title: 'The garden at night', beatId: beat('fun_and_games') });
    env.ms.updateSceneMeta(s3.id as string, { planElementId: plan.id });
    const rules = ct.checks(pid).map((f) => f.rule).sort();
    expect(rules).toEqual(['one viewpoint per scene', 'withheld viewpoint']);
    void s1;
  });
});

describe('timelines, knowledge and clues (R-C-049, R-C-050, R-C-060, R-C-062, R-C-053)', () => {
  it('keeps narrative order and story-time order apart, and finds a character in two places at once', () => {
    const { pid, st, ct, beat, el, link, say } = setup();
    const a = st.addCard(pid, { title: 'Pie on the porch', beatId: beat('midpoint') });
    const b = st.addCard(pid, { title: 'Flashback: the first prank', beatId: beat('bad_guys_close_in') });
    const c = st.addCard(pid, { title: 'Kevin at the HOA meeting', beatId: beat('all_is_lost') });
    say(a.id, 'story_day', 9); say(a.id, 'time_of_day', 'Evening'); say(a.id, 'location', 'Francine\'s porch');
    say(b.id, 'story_day', 1); say(b.id, 'time_of_day', 'Morning');
    say(c.id, 'story_day', 9); say(c.id, 'time_of_day', 'evening'); say(c.id, 'location', 'Clubhouse');
    const kevin = el('character', 'Kevin');
    link(kevin.id, a.id, 'appears_in'); link(kevin.id, c.id, 'appears_in');
    const t = ct.timelines(pid);
    expect(t.narrative.map((r) => r.title)).toEqual(['Pie on the porch', 'Flashback: the first prank', 'Kevin at the HOA meeting']);
    expect(t.chronological.map((r) => r.title)).toEqual(['Flashback: the first prank', 'Pie on the porch', 'Kevin at the HOA meeting']);
    const two = ct.checks(pid).find((f) => f.rule === 'two places at once')!;
    expect(two.message).toContain('Kevin is in "Pie on the porch" (Francine\'s porch) and "Kevin at the HOA meeting" (Clubhouse)');
    expect(two.evidence).toBe(true);
  });

  it('records when the truth happens, when the reader meets it and when each character learns it, and belief apart from knowledge', () => {
    const { pid, st, ct, beat, el, link, say } = setup();
    const truth = el('event', 'Francine dumped the fish guts');
    say(truth.id, 'story_time', 'Night before day 1');
    const find = st.addCard(pid, { title: 'Kevin finds the ledger', beatId: beat('all_is_lost') });
    const tell = st.addCard(pid, { title: 'Yo, man... we\'ve been played!', beatId: beat('break_into_three') });
    const kevin = el('character', 'Kevin'), anthony = el('character', 'Anthony');
    link(find.id, truth.id, 'reveals'); link(tell.id, truth.id, 'reveals');
    link(kevin.id, find.id, 'appears_in'); link(anthony.id, tell.id, 'appears_in'); link(kevin.id, tell.id, 'appears_in');
    link(anthony.id, truth.id, 'believes_falsely', 'Believes Kevin did it');
    const k = ct.knowledge(pid);
    const ev = k.events.find((e) => e.title === 'Francine dumped the fish guts')!;
    expect(ev.happens).toBe('Night before day 1');
    expect(ev.readerAt).toEqual({ scene: 'Kevin finds the ledger', index: 1 });
    expect(ev.who.find((w) => w.title === 'Kevin')!.learnsAt).toEqual({ scene: 'Kevin finds the ledger', index: 1 });
    expect(ev.who.find((w) => w.title === 'Anthony')).toMatchObject({ learnsAt: { index: 2 }, stance: { relation: 'believes_falsely', note: 'Believes Kevin did it' } });
    expect(k.timeline[1]!.learns).toEqual(expect.arrayContaining(['Anthony learns Francine dumped the fish guts']));
  });

  it('the clue tracker checks both ways and never flags a detail that need not pay off', () => {
    const { pid, st, ct, beat, el, link, say } = setup();
    const ledger = el('clue', 'The ledger'), gnome = el('clue', 'The gnome'), pie = el('clue', 'The pie tin');
    say(ledger.id, 'significant', 'Yes');
    const plant = st.addCard(pid, { title: 'Francine writes', beatId: beat('setup') });
    const pay = st.addCard(pid, { title: 'They use it', beatId: beat('finale') });
    link(plant.id, ledger.id, 'plants');
    link(pay.id, pie.id, 'pays_off');
    link(plant.id, gnome.id, 'plants');
    const rules = ct.checks(pid).filter((f) => f.rule.includes('pay') || f.rule.includes('plant') || f.rule.includes('promise'));
    expect(rules.map((r) => `${r.rule}: ${r.elements[0]!.title}`).sort()).toEqual(['payoff without a plant: The pie tin', 'unpaid promise: The ledger']);
    link(pay.id, ledger.id, 'pays_off');
    expect(ct.clues(pid).find((c) => c.title === 'The ledger')).toMatchObject({ plants: [{ at: 1 }], payoffs: [{ at: 2 }] });
  });
});

describe('storylines and the review (R-C-036, R-C-037, R-C-059, R-C-077)', () => {
  it('any number of storylines; a lonely strand is asked about; held open quiets it; an intentional note quiets a question for good', () => {
    const { pid, st, ct, beat, el, link, say } = setup();
    const a = el('storyline', 'The war'), b = el('storyline', 'Francine\'s garden'), c = el('storyline', 'Anthony\'s job');
    say(a.id, 'letter', 'A');
    const cards = ['setup', 'catalyst', 'fun_and_games', 'midpoint', 'bad_guys_close_in', 'all_is_lost', 'finale'].map((k) => st.addCard(pid, { title: k, beatId: beat(k) }));
    for (const cd of cards) link(cd.id, a.id, 'advances');
    link(cards[0]!.id, b.id, 'advances'); link(cards[5]!.id, b.id, 'advances');
    link(cards[1]!.id, c.id, 'advances'); link(cards[2]!.id, c.id, 'advances');
    let r = ct.review(pid);
    const dropped = r.open.find((f) => f.rule === 'storyline continues' && f.elements[0]!.title === "Anthony's job")!;
    expect(dropped.message).toContain('If its later scenes are not mapped yet, that is fine');
    expect(r.open.some((f) => /plot hole/i.test(f.message))).toBe(false);
    ct.respond(pid, { key: dropped.key, status: 'intentional', note: 'His job thread pays off off-page in the epilogue', text: dropped.message });
    r = ct.review(pid);
    expect(r.open.some((f) => f.key === dropped.key)).toBe(false);
    expect(r.answered[0]!.note).toBe('His job thread pays off off-page in the epilogue');
    expect(ct.storylines(pid).touchPoints.length).toBe(4);
  });
});
