import { describe, it, expect, afterEach } from 'vitest';
import { freshStore } from './helpers.js';
import { Structure } from '../src/core/structure.js';
import { Ripple } from '../src/core/ripple.js';
import { Continuity } from '../src/core/continuity.js';

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());
const author = { kind: 'author' as const };

function book() {
  env = freshStore();
  const pid = env.brain.createProject('All Because of Love').id as string;
  const st = new Structure(env.store, env.brain, env.ms);
  const rp = new Ripple(env.store, env.brain, env.ms, st);
  return { pid, ct: new Continuity(env.store, env.brain, env.ms, st, rp) };
}

describe('parts, storyline story types and memory', () => {
  it('a chapter opens a part; the part shows in the outline and can be ended', () => {
    const { pid } = book();
    const winter = env.ms.addChapter(pid, 'Good Morning Heartache');
    env.ms.addChapter(pid, 'Two');
    env.ms.setPart(winter.id as string, 'Part One: Winter');
    const o = env.ms.outline(pid) as any[];
    expect(o.map((c) => c.part_title)).toEqual(['Part One: Winter', '']);
    env.ms.setPart(winter.id as string, '');
    expect((env.ms.outline(pid) as any[])[0].part_title).toBe('');
  });

  it('memory links show both ways in Timelines, and a scene\'s year places it in story order', () => {
    const { pid, ct } = book();
    const ch = env.ms.addChapter(pid, 'One');
    const now = env.ms.addScene(ch.id as string, { title: 'The gazebo, now' });
    const then = env.ms.addScene(ch.id as string, { title: 'The wedding, twenty years ago' });
    const plan = (sceneId: string, year: string) => {
      const p = env.brain.createElement(pid, { kind: 'scene_plan', title: sceneId });
      env.ms.updateSceneMeta(sceneId, { planElementId: p.id as string });
      env.brain.addStatement({ elementId: p.id as string, field: 'story_year', value: year, status: 'established', speaker: author });
      return p.id as string;
    };
    const a = plan(now.id as string, '2026'), b = plan(then.id as string, '2006');
    env.brain.link(pid, { fromId: a, toId: b, relation: 'calls_up' });
    const t = ct.timelines(pid);
    const row = (id: string) => t.narrative.find((r) => r.planId === id)!;
    expect(row(a).callsUp).toHaveLength(1);
    expect(row(b).calledUpBy).toHaveLength(1);
    expect(t.chronological.map((r) => r.planId)).toEqual([b, a]);
  });

  it('each storyline carries its own story type', () => {
    const { pid, ct } = book();
    const a = env.brain.createElement(pid, { kind: 'storyline', title: 'Lauryn and Ethan' }).id as string;
    env.brain.addStatement({ elementId: a, field: 'story_type', value: 'Buddy Love', status: 'established', speaker: author });
    const s = ct.storylines(pid) as any;
    expect(s.strands.find((x: any) => x.id === a).storyType).toBe('Buddy Love');
  });
});
