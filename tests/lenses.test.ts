import { describe, it, expect, afterEach } from 'vitest';
import { freshStore } from './helpers.js';
import { Structure } from '../src/core/structure.js';
import { Ripple } from '../src/core/ripple.js';
import { Continuity } from '../src/core/continuity.js';
import { Lenses } from '../src/core/lenses.js';
import { echoes, watch, longSentences, namesIn, nameVariants, distance } from '../src/core/revise.js';

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());

describe('revision lenses point, never change', () => {
  it('echoes find a word family close together; names and small words are left alone', () => {
    const t = 'Kevin walked to the window. He walked back. Kevin watched Anthony walk away. It was quiet. '.repeat(1);
    const e = echoes(t, { ignore: ['Kevin', 'Anthony'] });
    expect(e.map((x) => x.key)).toEqual(['walk']);
    expect(e[0]!.count).toBe(3);
    expect(t.slice(...e[0]!.ranges[1]!)).toBe('walked');
  });
  it('watch words, phrases included, and long sentences', () => {
    expect(watch('He just, just started to run. Kind of.', ['just', 'started to', 'kind of']).map((w) => [w.phrase, w.count])).toEqual([['just', 2], ['started to', 1], ['kind of', 1]]);
    expect(longSentences('Short. ' + 'word '.repeat(50) + 'end.')[0]!.words).toBe(51);
  });
  it('a name spelled two ways is caught; titles do not end sentences', () => {
    expect(distance('fingleburger', 'fingleberger')).toBe(1);
    const t = 'His wife said, "Do I need to call Dr. Fingleburger?" Later he told Fingleberger nothing. Then Kevin left.';
    const used = namesIn(t);
    expect([...used.keys()].sort()).toEqual(['Fingleberger', 'Fingleburger', 'Kevin']);
    expect(nameVariants(used, ['Dr. Fingleburger'])).toEqual([{ name: 'Fingleberger', count: 1, likely: 'Fingleburger', knownName: true }]);
  });
});

describe('whole-book lenses', () => {
  it('names across scenes with records, and pacing in reading order with turns that do not turn', () => {
    env = freshStore();
    const pid = env.brain.createProject('Any').id as string;
    const st = new Structure(env.store, env.brain, env.ms); const rp = new Ripple(env.store, env.brain, env.ms, st); const ct = new Continuity(env.store, env.brain, env.ms, st, rp);
    const ln = new Lenses(env.store, env.brain, env.ms, st, ct);
    env.brain.createElement(pid, { kind: 'character', title: 'Marla Quinn' });
    const ch = env.ms.addChapter(pid);
    env.ms.addScene(ch.id as string, { title: 'Fog', text: 'The keeper was Marla. Then the fog came for Marla, and Marla waited. Old Tobias came. Old Tobias left. We saw Tobias. Later Marlla laughed.' });
    const s2 = env.ms.addScene(ch.id as string, { title: 'Storm', text: 'A storm. '.repeat(50) });
    const plan = st.addCard(pid, { title: 'Storm plan' });
    env.store.db.prepare('UPDATE scenes SET plan_element_id=? WHERE id=?').run(plan.id, s2.id);
    env.brain.addStatement({ elementId: plan.id as string, field: 'value_start', value: 'Safe', status: 'established', speaker: { kind: 'author' } });
    env.brain.addStatement({ elementId: plan.id as string, field: 'value_end', value: 'Safe', status: 'established', speaker: { kind: 'author' } });
    const n = ln.names(pid);
    expect(n.names.find((x) => x.name === 'Marla')!.record?.title).toBe('Marla Quinn');
    expect(n.noRecord.map((x) => x.name)).toEqual(['Tobias']);
    expect(n.variants.map((v) => [v.name, v.likely])).toEqual([['Marlla', 'Marla']]);
    const p = ln.pacing(pid);
    expect(p.rows.map((r) => r.title)).toEqual(['Fog', 'Storm']);
    expect(p.notes.join(' ')).toMatch(/"Storm" starts and ends on the same value \(Safe\)/);
  });
});
