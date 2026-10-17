import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { readExport, exportKind } from '../src/core/io/chat-exports.js';
import { Conversations } from '../src/core/conversations.js';
import { freshStore } from './helpers.js';

const load = (f: string) => JSON.parse(readFileSync(new URL(`./fixtures/${f}`, import.meta.url), 'utf8'));
let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());

describe('reading Claude and ChatGPT exports', () => {
  it('a Claude chat keeps every word she wrote, pasted attachments included, and only the prose of each reply', () => {
    const data = load('claude-export.json');
    expect(exportKind(data)).toBe('Claude');
    const chats = readExport(data, 'Yolanda Allen');
    expect(chats).toHaveLength(1); // the empty chat is left out
    const c = chats[0]!;
    expect(c).toMatchObject({ app: 'Claude', title: 'Writing funny with subtext and depth', origin: 'claude:c-111' });
    expect(c.messages[0]).toMatchObject({ speaker_kind: 'author', speaker_name: 'Yolanda Allen', said_at: '2026-10-13T23:10:00.000Z' });
    expect(c.messages[0]!.text).toContain('gave them something to respect!');
    expect(c.messages[0]!.text).toContain('[Attached: notes.txt]\nKevin does the Aretha spin.');
    expect(c.messages[1]!.text).toBe('Now it works.\n\nKeep the lyric off the page. 🎶');
    expect(c.left).toBe(3); // reasoning, a tool call and its result, counted rather than silently dropped
  });

  it('a ChatGPT chat follows the branch she kept, skipping edited-away replies and tool code', () => {
    const data = load('chatgpt-export.json');
    expect(exportKind(data)).toBe('ChatGPT');
    const [c] = readExport(data, 'Yolanda Allen');
    expect(c!.messages.map((m) => `${m.speaker_name}: ${m.text}`)).toEqual(['Yolanda Allen: What if the lie is about her own ability?', 'ChatGPT: YES. That is stronger.']);
    expect(c!.left).toBe(1);
    expect(c!.messages[0]!.said_at).toBe(new Date(1760640100 * 1000).toISOString());
  });

  it('anything else is refused in plain words', () => {
    expect(() => readExport({ hello: 1 })).toThrow(/not a Claude or ChatGPT/);
    expect(() => readExport([])).toThrow(/not a Claude or ChatGPT/);
  });

  it('a picked chat comes in whole and is recognized as already here next time', () => {
    env = freshStore();
    const pid = env.brain.createProject('I Declare War').id as string;
    const convs = new Conversations(env.store, env.brain);
    const [c] = readExport(load('claude-export.json'), 'Yolanda Allen');
    const r = convs.importTurns(pid, { title: c!.title, turns: c!.messages, format: 'Claude export', origin: c!.origin });
    expect(r).toMatchObject({ complete: true, turnsStored: 2, byAuthor: 1 });
    expect(convs.origins(pid)).toEqual(['claude:c-111']);
    expect(env.brain.search(pid, 'something to respect').some((h) => h.hit === 'turn')).toBe(true);
  });
});
