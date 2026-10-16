import { describe, it, expect, afterEach } from 'vitest';
import { freshStore } from './helpers.js';
import { Structure } from '../src/core/structure.js';
import { Ripple } from '../src/core/ripple.js';
import { WritingDesk } from '../src/core/writing.js';
import { Cast } from '../src/core/cast.js';

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());

function book() {
  env = freshStore();
  const pid = env.brain.createProject('Cast').id as string;
  const st = new Structure(env.store, env.brain, env.ms);
  const rp = new Ripple(env.store, env.brain, env.ms, st);
  const desk = new WritingDesk(env.store, env.brain, env.ms);
  const cast = new Cast(env.store, env.brain, env.ms, st, rp, desk);
  const ch = (title?: string) => env.ms.addChapter(pid, title).id as string;
  const person = (title: string, gender?: string) => {
    const e = env.brain.createElement(pid, { kind: 'character', title });
    if (gender) env.brain.addStatement({ elementId: e.id, field: 'gender', value: gender, status: 'established', speaker: { kind: 'author' } });
    return e.id as string;
  };
  return { pid, cast, ch, person, desk };
}

describe('the cast across the story', () => {
  it('shows who is where, catches someone introduced and then forgotten, and who meets whom', () => {
    const { pid, cast, ch, person } = book();
    const kevin = person('Kevin Wickley'), anthony = person('Anthony Vernon'), dot = person('Dot Harper'), never = person('Mr. Pruitt');
    const c1 = ch(), c2 = ch(), c3 = ch();
    env.ms.addScene(c1, { title: 'Driveway', text: 'Kevin glared at Anthony. Dot waved from her porch.' });
    for (let i = 0; i < 8; i++) env.ms.addScene(i < 4 ? c2 : c3, { title: `Feud ${i + 1}`, text: `Kevin and Anthony argued again, round ${i + 1}.` });
    const p = cast.presence(pid);
    const row = (id: string) => p.rows.find((r) => r.id === id)!;
    expect(row(kevin).count).toBe(9);
    expect(row(dot).count).toBe(1);
    expect(p.notes.map((n) => n.text)).toEqual(expect.arrayContaining([
      expect.stringMatching(/^Dot Harper is introduced in Chapter 1, "Driveway" and not seen after Chapter 1, "Driveway", 8 scenes before the end\. Intended\?$/),
      'Mr. Pruitt has a record but does not appear in any scene yet.',
    ]));
    const pairs = cast.pairs(pid);
    expect(pairs[0]!.a.title + ' / ' + pairs[0]!.b.title).toBe('Kevin Wickley / Anthony Vernon');
    expect(pairs[0]!.together).toHaveLength(9);
    expect(pairs.find((x) => x.b.id === dot || x.a.id === dot)!.together.map((t) => t.title)).toEqual(['Driveway']);
    void never;
  });

  it('the Bechdel test: finds scenes with two named women, and passes only when she says they talk about something other than a man', () => {
    const { pid, cast, ch, person } = book();
    person('Francine Ellington', 'woman'); person('Gloria', 'Female'); person('Kevin'); person('Dot', 'woman');
    const c = ch();
    const s1 = env.ms.addScene(c, { title: 'Garden', text: 'Francine handed Gloria the shears.' });
    env.ms.addScene(c, { title: 'Porch', text: 'Kevin waved at Francine.' });
    let b = cast.bechdel(pid);
    expect(b.unsure.map((u) => u.title)).toEqual(['Kevin']);
    expect(b.scenes.map((s) => s.place.title)).toEqual(['Garden']);
    expect(b.result).toBe('waiting for your answers');
    expect(b.alone).toEqual(['Dot']);
    b = cast.answerBechdel(pid, s1.id as string, 'yes');
    expect(b.result).toBe('passes');
    b = cast.answerBechdel(pid, s1.id as string, 'no');
    expect(b.result).toBe('does not pass yet');
  });
});

describe('names with titles', () => {
  it('"Mr. Pruitt" is found as Pruitt, and "Mr." alone never counts', () => {
    const { pid, cast, ch, person } = book();
    const pruitt = person('Mr. Pruitt'); person('Mr. Lee');
    const c = ch();
    env.ms.addScene(c, { title: 'One', text: 'Pruitt mowed.' });
    env.ms.addScene(c, { title: 'Two', text: 'Mr. Lee waved.' });
    const p = cast.presence(pid);
    expect(Object.keys(p.rows.find((r) => r.id === pruitt)!.cells)).toHaveLength(1);
  });
});

describe('more than two at a time', () => {
  it('any chosen group: scenes they share, on their own or with others; groups that keep meeting; a record for the whole group', () => {
    const { pid, cast, ch, person } = book();
    const k = person('Kevin'), a = person('Anthony'), f = person('Francine'), g = person('Gloria');
    const c = ch();
    env.ms.addScene(c, { title: 'Block party', text: 'Kevin, Anthony and Francine stood by the pies. Gloria brought napkins.' });
    env.ms.addScene(c, { title: 'Ledger', text: 'Kevin, Anthony and Francine read the ledger.' });
    env.ms.addScene(c, { title: 'Garden', text: 'Francine and Gloria weeded.' });
    const t = cast.together(pid, [k, a, f]);
    expect(t.scenes.map((x) => x.place.title)).toEqual(['Block party', 'Ledger']);
    expect(t.scenes[0]!.alsoThere).toEqual(['Gloria']);
    expect(cast.together(pid, [k, a, f], { only: true }).scenes.map((x) => x.place.title)).toEqual(['Ledger']);
    const groups = cast.groups(pid);
    expect(groups.map((x) => x.characters.map((c) => c.title).sort().join(', '))).toEqual(['Anthony, Francine, Kevin']);
    const rel = env.brain.createElement(pid, { kind: 'relationship', title: 'The feud triangle' });
    for (const id of [k, a, f]) env.brain.link(pid, { fromId: rel.id, toId: id, relation: 'relates_to' });
    expect(cast.together(pid, [k, a, f]).record?.title).toBe('The feud triangle');
    expect(cast.together(pid, [k, a]).record).toBeNull();
    void g;
  });
});
