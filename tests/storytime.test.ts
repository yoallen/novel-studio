import { describe, it, expect, afterEach } from 'vitest';
import { freshStore } from './helpers.js';
import { StoryTime, parseYear } from '../src/core/storytime.js';

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());
const author = { kind: 'author' as const };

function book() {
  env = freshStore();
  const pid = env.brain.createProject('The Death of Sabrina Sawyer').id as string;
  const t = new StoryTime(env.store, env.brain, env.ms);
  const ch = env.ms.addChapter(pid, 'One');
  const sc = env.ms.addScene(ch.id as string, { title: 'The line at intake' });
  const plan = env.brain.createElement(pid, { kind: 'scene_plan', title: 'The line at intake' });
  env.ms.updateSceneMeta(sc.id as string, { planElementId: plan.id as string });
  const say = (id: string, field: string, value: unknown, status: 'established' | 'developing' = 'established') => env.brain.addStatement({ elementId: id, field, value, status, speaker: author });
  const person = (title: string) => env.brain.createElement(pid, { kind: 'character', title }).id as string;
  return { pid, t, ch, sc, plan: plan.id as string, say, person };
}

describe('ages, selves, reader response and the soundtrack', () => {
  it('works out each person\'s age in a scene from the scene\'s year; a younger self keeps her fixed age', () => {
    const { t, sc, plan, say, person, pid } = book();
    const sabrina = person('Sabrina'), nina = person('Nina');
    say(sabrina, 'born', '1970'); say(nina, 'fixed_age', '8'); say(plan, 'story_year', '2026', 'developing');
    for (const id of [sabrina, nina]) env.brain.link(pid, { fromId: id, toId: plan, relation: 'appears_in' });
    const r = t.agesInScene(sc.id as string);
    expect(r.year).toBe(2026);
    expect(r.people.find((p) => p.title === 'Sabrina')!.age).toBe(56);
    expect(r.people.find((p) => p.title === 'Nina')).toMatchObject({ age: 8, how: 'fixed' });
  });

  it('one person, several selves: each self lists the others, youngest first', () => {
    const { t, say, person, pid } = book();
    const sabrina = person('Sabrina'), nina = person('Nina'), bria = person('Bria');
    say(nina, 'fixed_age', '8'); say(bria, 'fixed_age', '17');
    env.brain.link(pid, { fromId: bria, toId: sabrina, relation: 'same_person_as' });
    env.brain.link(pid, { fromId: nina, toId: sabrina, relation: 'same_person_as' });
    expect(t.character(sabrina).selves.map((x) => `${x.title} ${x.age}`)).toEqual(['Nina 8', 'Bria 17']);
  });

  it('the reader response map gathers the tabs aimed at in each chapter, and names the chapters with none', () => {
    const { t, ch, plan, say, pid } = book();
    say(plan, 'reader_response', 'Funny'); say(plan, 'reader_response', 'Profound', 'developing');
    env.ms.addChapter(pid, 'Two');
    const m = t.readerMap(pid);
    expect(m.chapters[0]!.responses.sort()).toEqual(['Funny', 'Profound']);
    expect(m.withNone).toEqual([2]);
    expect(m.counts.Funny).toBe(1);
    void ch;
  });

  it('the soundtrack lists songs in the order they first play; unplaced songs come last', () => {
    const { t, plan, say, pid } = book();
    const later = env.brain.createElement(pid, { kind: 'song', title: 'Save the Best for Last' }).id as string;
    const first = env.brain.createElement(pid, { kind: 'song', title: 'Good Morning Heartache' }).id as string;
    say(first, 'artist', 'Billie Holiday');
    env.brain.link(pid, { fromId: first, toId: plan, relation: 'plays_in' });
    const s = t.soundtrack(pid);
    expect(s.map((x) => x.title)).toEqual(['Good Morning Heartache', 'Save the Best for Last']);
    expect(s[0]).toMatchObject({ artist: 'Billie Holiday', plays: [{ title: 'The line at intake', chapter: 'One' }] });
    void later;
  });

  it('interviews: a whole set of questions, never repeated, answered as the character', () => {
    const { t, person, pid } = book();
    const villain = person('Carlton');
    expect(t.addInterview(villain, { set: 'villain' }).added).toBe(5);
    expect(t.addInterview(villain, { set: 'villain' }).added).toBe(0);
    expect(t.addInterview(villain, { question: 'What would you do to keep your secret?' }).added).toBe(1);
    const qs = env.brain.elements(pid, { kind: 'interview' }).filter((e) => e.parent_id === villain);
    expect(qs).toHaveLength(6);
    expect(() => t.addInterview(qs[0]!.id as string, { set: 'know' })).toThrow(/belong to characters/);
  });

  it('reads years the way she writes them', () => {
    expect(parseYear('1970')).toBe(1970);
    expect(parseYear('March 3, 1970')).toBe(1970);
    expect(parseYear('03/14/1970')).toBe(1970);
    expect(parseYear('Summer of 1985')).toBe(1985);
    expect(parseYear('312 BC')).toBe(-312);
    expect(parseYear('the 2nd summer')).toBeNull();
    expect(parseYear('8', true)).toBe(8);
  });
});
