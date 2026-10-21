import { describe, it, expect, afterEach } from 'vitest';
import { freshStore } from './helpers.js';
import { Structure } from '../src/core/structure.js';
import { Ripple } from '../src/core/ripple.js';
import { Continuity } from '../src/core/continuity.js';
import { Setup } from '../src/core/setup.js';
import { pagesFor } from '../src/ui/recordPages.js';

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());
function setup() {
  env = freshStore();
  const st = new Structure(env.store, env.brain, env.ms); const rp = new Ripple(env.store, env.brain, env.ms, st); const ct = new Continuity(env.store, env.brain, env.ms, st, rp);
  return { st, su: new Setup(env.store, env.brain, st, ct) };
}

describe('McKee in the scene and the structure', () => {
  it("a scene card gains McKee's turn (what turns it, action or revelation, expected, the gap) only with McKee on, on its first page", () => {
    const { su } = setup();
    const pid = su.createNovel('Gull Point').id as string;
    su.update(pid, { frameworks: ['save_the_cat'] });
    expect(env.brain.fieldsFor(pid, 'scene_plan').some((f) => f.field === 'gap')).toBe(false);
    su.update(pid, { frameworks: ['save_the_cat', 'mckee'] });
    const turn = env.brain.fieldsFor(pid, 'scene_plan').filter((f) => f.group === 'The turn').map((f) => f.field);
    expect(turn).toEqual(['turning_point', 'turn_kind', 'expected', 'gap']);
    const pages = pagesFor('scene_plan', ['The scene', 'The turn', 'Around it'], () => true, 'Scene card');
    expect(pages[0]!.items).toEqual(['The scene', 'The turn', 'Around it']);
  });

  it("McKee's five parts can be the novel's beat sheet, with the crisis and climax tied to the same moments as Save the Cat", () => {
    const { st, su } = setup();
    const pid = su.createNovel('Gull Point').id as string;
    su.update(pid, { frameworks: ['mckee_five'], spine: 'mckee_five' });
    expect(st.beats(pid).map((b) => b.element.title)).toEqual(['Inciting Incident', 'Progressive Complications', 'Crisis', 'Climax', 'Resolution']);
    const crisis = st.beats(pid).find((b) => b.element.title === 'Crisis')!;
    expect(st.beatDetail(crisis.element.id as string).alsoCalled.map((a) => a!.name)).toContain('Break into Three');
  });
});
