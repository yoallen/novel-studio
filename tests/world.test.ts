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
  const ct = new Continuity(env.store, env.brain, env.ms, st, new Ripple(env.store, env.brain, env.ms, st));
  return new Setup(env.store, env.brain, st, ct);
}
const groups = (pid: string, kind: string) => [...new Set(env.brain.fieldsFor(pid, kind).map((f) => f.group))];

describe('the worldbuilding kit', () => {
  it('opens for fantasy and invented worlds, and stays out of a contemporary comedy', () => {
    const su = setup();
    const comedy = su.createNovel('I Declare War').id as string;
    su.update(comedy, { genres: [{ key: 'comedy', name: 'Comedy', role: 'primary' }], characteristics: ['contemporary_setting'] });
    expect(groups(comedy, 'location')).not.toContain('Settlement');
    expect(groups(comedy, 'character')).not.toContain('Beyond human');

    const fantasy = su.createNovel('Samuel\'s Cauldron').id as string;
    su.update(fantasy, { genres: [{ key: 'urban_fantasy', name: 'Urban Fantasy', role: 'primary' }] });
    expect(groups(fantasy, 'location')).toEqual(expect.arrayContaining(['Settlement', 'Between worlds']));
    expect(groups(fantasy, 'character')).toContain('Beyond human');

    const myth = su.createNovel('Scylla').id as string;
    su.update(myth, { characteristics: ['retelling'] });
    expect(groups(myth, 'location')).toContain('Settlement');
  });

  it('beings, magic, sources and in-world documents are records with fields made for them', () => {
    const su = setup();
    const pid = su.createNovel('Aruria').id as string;
    const fields = (kind: string) => env.brain.fieldsFor(pid, kind).map((f) => f.field);
    expect(fields('being')).toEqual(expect.arrayContaining(['abilities', 'limits', 'see_humans']));
    expect(fields('magic')).toEqual(expect.arrayContaining(['source', 'cost', 'never', 'misuse']));
    expect(fields('source')).toEqual(expect.arrayContaining(['original', 'keeps', 'changes', 'public_domain']));
    expect(fields('document')).toEqual(expect.arrayContaining(['written_by', 'reveals', 'reliable']));
    expect(fields('era')).toContain('legacy');
    expect(fields('relationship')).toEqual(expect.arrayContaining(['their_names', 'private_words']));
    const imagi = env.brain.createElement(pid, { kind: 'being', title: 'The Imagi' });
    const samuel = env.brain.createElement(pid, { kind: 'character', title: 'Samuel' });
    env.brain.link(pid, { fromId: samuel.id as string, toId: imagi.id as string, relation: 'is_a' });
    expect(env.brain.linksOf(samuel.id as string).some((l) => l.relation === 'is_a')).toBe(true);
  });
});
