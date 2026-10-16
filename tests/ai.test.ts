import { describe, it, expect, afterEach } from 'vitest';
import { freshStore } from './helpers.js';
import { Structure } from '../src/core/structure.js';
import { Ripple } from '../src/core/ripple.js';
import { Continuity } from '../src/core/continuity.js';
import { Conversations } from '../src/core/conversations.js';
import { Collaborator, AiClient, AiResponse, stripPageCitations } from '../src/core/ai.js';

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());

type Req = Parameters<AiClient['create']>[0];
function fake(script: (req: Req, call: number) => AiResponse) {
  const calls: Req[] = [];
  const client: AiClient = { async create(req) { calls.push(JSON.parse(JSON.stringify(req)) as Req); return script(req, calls.length); } };
  return { calls, factory: () => client };
}

function setup(script: (req: Req, call: number) => AiResponse) {
  env = freshStore();
  const pid = env.brain.createProject('Any Story', { settings: { authorName: 'Yolanda' } }).id as string;
  const st = new Structure(env.store, env.brain, env.ms);
  const rp = new Ripple(env.store, env.brain, env.ms, st);
  const ct = new Continuity(env.store, env.brain, env.ms, st, rp);
  const convs = new Conversations(env.store, env.brain);
  const f = fake(script);
  const ai = new Collaborator(env.store, env.brain, env.ms, convs, ct, f.factory);
  return { pid, convs, ai, calls: f.calls };
}

const say = (text: string): AiResponse => ({ content: [{ type: 'text', text }], stop_reason: 'end_turn' });

describe('the collaborator (R-A-089 to R-A-108)', () => {
  it('sends nothing until she turns it on and adds a key', async () => {
    const { pid, convs, ai, calls } = setup(() => say('hi'));
    const c = convs.create(pid, { title: 'Talk' });
    await expect(ai.ask(c.id as string, { text: 'Hello' })).rejects.toThrow(/off for this novel/);
    ai.configure(pid, { enabled: true });
    await expect(ai.ask(c.id as string, { text: 'Hello' })).rejects.toThrow(/API key/);
    expect(calls).toHaveLength(0);
    expect(ai.status(pid).consentedAt).toBeTruthy();
  });

  it('reads her decisions, guardrails and kept scenes first, and labels assistant-origin facts', async () => {
    const { pid, convs, ai, calls } = setup(() => say('Here is a thought.'));
    const kevin = env.brain.createElement(pid, { kind: 'character', title: 'Kevin' });
    env.brain.addStatement({ elementId: kevin.id as string, field: 'lie', value: 'Love must be earned by being useful', status: 'established', speaker: { kind: 'author' } });
    env.brain.addStatement({ elementId: kevin.id as string, field: 'ghost', value: 'An old possibility', status: 'set_aside', speaker: { kind: 'author' } });
    env.brain.createElement(pid, { kind: 'guardrail', title: 'Kevin is never cruel', parentId: kevin.id as string });
    const ch = env.ms.addChapter(pid);
    env.ms.addScene(ch.id as string, { title: 'The Confession' });
    const sc = env.ms.addScene(ch.id as string, { title: 'Porch talk', text: 'He sat down.' });
    env.ms.updateSceneMeta(sc.id as string, { reserved: 'Mine to write' });
    ai.setKey('sk-test'); ai.configure(pid, { enabled: true });
    const c = convs.create(pid, { title: 'Kevin' });
    await ai.ask(c.id as string, { text: 'What is Kevin afraid of?', mode: 'teach' });
    const first = calls[0]!;
    const ctx = String(first.messages[0]!.content);
    expect(ctx).toContain('Love must be earned by being useful');
    expect(ctx).toContain('[Decided');
    expect(ctx).not.toContain('An old possibility');
    expect(ctx).toContain('Kevin is never cruel');
    expect(ctx).toContain('Porch talk (Mine to write)');
    expect(ctx).toContain('What is Kevin afraid of?');
    expect(first.system).toContain('Never write or rewrite her manuscript');
    expect(first.system).toContain('Teach it');
    expect(first.model).toBe('claude-opus-5-5');
  });

  it('keeps prose private unless she shares it', async () => {
    const { pid, convs, ai, calls } = setup(() => say('ok'));
    const ch = env.ms.addChapter(pid);
    const sc = env.ms.addScene(ch.id as string, { title: 'Opening', text: 'The secret first line.' });
    ai.setKey('k'); ai.configure(pid, { enabled: true });
    const c = convs.create(pid, { title: 'Scene' });
    await ai.ask(c.id as string, { text: 'Critique this', mode: 'critique', sceneId: sc.id as string });
    expect(String(calls[0]!.messages[0]!.content)).not.toContain('The secret first line.');
    expect(calls[0]!.system).toContain('Quiet');
    ai.configure(pid, { shareManuscript: true });
    await ai.ask(c.id as string, { text: 'And now?', mode: 'critique', sceneId: sc.id as string });
    expect(JSON.stringify(calls[1]!.messages)).toContain('The secret first line.');
  });

  it('suggestions wait for her; nothing becomes a decision on its own', async () => {
    let kevinId = '';
    const { pid, convs, ai } = setup((req, n) => n === 1
      ? { content: [{ type: 'text', text: 'Two ideas.' }, { type: 'tool_use', id: 't1', name: 'suggest_fact', input: { element_id: kevinId, field: 'Fear', value: 'Being left behind' } }, { type: 'tool_use', id: 't2', name: 'suggest_question', input: { question: 'Who taught Kevin to be useful?', about_element_id: kevinId } }, { type: 'tool_use', id: 't3', name: 'suggest_fact', input: { element_id: 'nope', field: 'x', value: 'y' } }], stop_reason: 'tool_use' }
      : say(JSON.stringify(req.messages).includes('Not recorded') ? 'One could not be saved.' : 'Done.'));
    kevinId = env.brain.createElement(pid, { kind: 'character', title: 'Kevin' }).id as string;
    ai.setKey('k'); ai.configure(pid, { enabled: true });
    const c = convs.create(pid, { title: 'Kevin' });
    const r = await ai.ask(c.id as string, { text: 'Ideas?' });
    expect(r.reply.text).toContain('Two ideas.');
    expect(r.reply.text).toContain('One could not be saved.');
    const pending = env.brain.proposals(pid, 'pending');
    expect(pending).toHaveLength(1);
    expect(pending[0]!.target).toMatchObject({ elementId: kevinId, field: 'fear' });
    expect(pending[0]!.turn_id).toBe(r.reply.id);
    const fear = env.brain.elementPage(kevinId).fields.find((f) => f.view.field === 'fear');
    expect(fear?.view.current ?? null).toBeNull();
    expect(fear?.view.latest ?? null).toBeNull();
    const q = env.brain.elements(pid, { kind: 'question' });
    expect(q).toHaveLength(1);
    expect(q[0]!.attrs_json).toContain('"suggested":true');
    const full = convs.full(c.id as string);
    expect((full.turns as { speaker_kind: string }[]).map((t) => t.speaker_kind)).toEqual(['author', 'assistant']);
  });

  it('never passes on page or chapter citations, or em dashes', () => {
    expect(stripPageCitations('See Story by Robert McKee, p. 112, and The Anatomy of Story (chapter 4).')).toBe('See Story by Robert McKee, and The Anatomy of Story.');
    expect(stripPageCitations('In your chapter 3, Kevin waits.')).toBe('In your chapter 3, Kevin waits.');
    expect(stripPageCitations('A beat—then silence')).toBe('A beat, then silence');
  });
});

describe('when Claude cannot be reached', () => {
  it('her message is kept and the reason is plain', async () => {
    const { pid, convs, ai } = setup(() => { throw Object.assign(new Error('x'), { status: 401 }); });
    ai.setKey('bad'); ai.configure(pid, { enabled: true });
    const c = convs.create(pid, { title: 'T' });
    await expect(ai.ask(c.id as string, { text: 'Keep this' })).rejects.toThrow(/did not accept the API key/);
    expect((convs.full(c.id as string).turns as { text: string }[]).map((t) => t.text)).toEqual(['Keep this']);
  });
});
