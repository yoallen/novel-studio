import { describe, it, expect, afterEach } from 'vitest';
import { freshStore } from './helpers.js';
import { Structure } from '../src/core/structure.js';
import { Ripple } from '../src/core/ripple.js';
import { Continuity } from '../src/core/continuity.js';
import { Remind } from '../src/core/remind.js';

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());

// A small Keeper of Gull Point: three cards on beats, two written scenes, a storyline, a secret and a clue.
function book() {
  env = freshStore();
  const pid = env.brain.createProject('The Keeper of Gull Point').id as string;
  const st = new Structure(env.store, env.brain, env.ms);
  const rp = new Ripple(env.store, env.brain, env.ms, st);
  const ct = new Continuity(env.store, env.brain, env.ms, st, rp);
  const rm = new Remind(env.store, env.brain, env.ms, st, ct, rp);
  st.applySaveTheCat(pid);
  const beat = (k: string) => st.beats(pid).find((b) => b.attrs.template_key === k)!.element.id as string;
  const el = (kind: string, title: string) => env.brain.createElement(pid, { kind, title });
  const link = (a: string, b: string, r: string) => env.brain.link(pid, { fromId: a, toId: b, relation: r as never });
  const say = (id: string, field: string, value: unknown) => env.brain.addStatement({ elementId: id, field, value, status: 'established', speaker: { kind: 'author' } });

  const tom = el('character', 'Tom Pell'); say(tom.id, 'importance', 'Minor'); say(tom.id, 'role', 'Bait shop');
  const marisol = el('character', 'Marisol Vega'); say(marisol.id, 'importance', 'Main'); say(marisol.id, 'role', 'Protagonist');
  say(marisol.id, 'essence', 'Keeper of the Gull Point light, who finds an empty boat on her rocks.');
  say(marisol.id, 'accent', 'Down East flat and slow; never wastes a word.');
  say(marisol.id, 'speech', 'Weather\'s coming, whether you\'re ready or not.');

  const boat = st.addCard(pid, { title: 'The empty boat', beatId: beat('catalyst') });
  const ledger = st.addCard(pid, { title: 'The harbor ledger', beatId: beat('debate') });
  const storm = st.addCard(pid, { title: 'The storm', beatId: beat('dark_night') });
  const ch = env.ms.addChapter(pid);
  const s1 = env.ms.addScene(ch.id, { title: 'The empty boat', text: 'The boat came in with nobody in it.' });
  const s2 = env.ms.addScene(ch.id, { title: 'The harbor ledger', text: 'The ledger had a page cut out.' });
  env.ms.updateSceneMeta(s1.id as string, { planElementId: boat.id, povElementId: marisol.id });
  env.ms.updateSceneMeta(s2.id as string, { planElementId: ledger.id });
  ct.setChapterPov(ch.id, { povElementId: marisol.id, pov: { person: 'Third person', tense: 'Past', distance: 'Close' } });

  const thread = el('storyline', 'Who sent the boat');
  link(boat.id, thread.id, 'advances'); link(storm.id, thread.id, 'advances');
  const secret = el('reveal', 'Cyrus cut the page');
  say(secret.id, 'truth', 'Cyrus removed the page to hide the boat\'s registry.');
  link(marisol.id, boat.id, 'appears_in'); link(marisol.id, storm.id, 'appears_in');
  link(storm.id, secret.id, 'reveals');
  const clue = el('clue', 'The cut page');
  link(ledger.id, clue.id, 'plants');
  return { pid, rm, s1: s1.id as string, s2: s2.id as string, beat, say, marisol };
}

describe('Remind me', () => {
  it('names whose voice a scene is in, from the scene or its chapter, with how the character sounds', () => {
    const { rm, s2 } = book();
    expect(rm.menu(s2).voice).toBe('Marisol Vega, third person, past tense');
    const v = rm.voice(s2);
    expect(v).toMatchObject({ from: 'chapter', pov: { title: 'Marisol Vega' }, person: 'Third person', tense: 'Past', distance: 'Close' });
    expect(v.sounds).toMatchObject({ accent: 'Down East flat and slow; never wastes a word.', habits: ['Weather\'s coming, whether you\'re ready or not.'] });
  });

  it('lists the cast with main characters first, each with role and who they are', () => {
    const { pid, rm } = book();
    const c = rm.characters(pid);
    expect(c.map((x) => x.title)).toEqual(['Marisol Vega', 'Tom Pell']);
    expect(c[0]).toMatchObject({ role: 'Protagonist', essence: 'Keeper of the Gull Point light, who finds an empty boat on her rocks.' });
  });

  it('remembers where a storyline last moved and where it moves next, from this scene', () => {
    const { rm, s2 } = book();
    const [t] = rm.storylines(s2);
    expect(t).toMatchObject({ title: 'Who sent the boat', last: { title: 'The empty boat' }, next: { title: 'The storm' }, moves: 2 });
  });

  it('keeps what the viewpoint character learns later out of what she knows now', () => {
    const { rm, s2 } = book();
    const k = rm.knows(s2);
    expect(k.character?.title).toBe('Marisol Vega');
    expect(k.knows).toEqual([]);
    expect(k.ahead).toEqual([{ title: 'Cyrus cut the page', at: 'The storm' }]);
  });

  it('finds what she decided by a word, and the promises still waiting to pay off', () => {
    const { pid, rm, s2 } = book();
    const d = rm.decided(pid, 'boat');
    expect(d.some((x) => x.record === 'Marisol Vega' && /empty boat/.test(x.value))).toBe(true);
    expect(rm.decided(pid, 'b')).toEqual([]);
    expect(rm.promises(s2)).toEqual([expect.objectContaining({ title: 'The cut page', planted: expect.objectContaining({ title: 'The harbor ledger' }), paysOff: null })]);
  });

  it('says what comes next in the plan, and teaches the beat this scene sits on', () => {
    const { pid, rm, s1, beat } = book();
    const n = rm.next(s1);
    expect(n.cards.map((c) => c.title)).toEqual(['The storm']);
    expect(n.beat?.name).toBe('Catalyst');
    expect(n.nextBeat?.name).toBe('Debate');
    const b = rm.beat(pid, beat('dark_night'));
    expect(b.name).toBe('Dark Night of the Soul');
    expect(b.brody?.size).toBe('multi');
    expect(b.brody?.checklist).toContain('Is the hero reflecting on something here?');
    expect(rm.menu(s1).beat?.name).toBe('Catalyst');
  });

  it('shows the scene plan questions with this scene\'s own answers', () => {
    const { rm, s1, say } = book();
    const plan = env.ms.scene(s1).plan_element_id as string;
    say(plan, 'objective', 'Find out who sent the boat.');
    expect(rm.scene(s1).answers).toMatchObject({ objective: 'Find out who sent the boat.', conflict: null });
  });
});
