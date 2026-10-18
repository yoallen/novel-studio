import { describe, it, expect, afterEach } from 'vitest';
import { turnRole, speakerLabel, continuedHeading, markerRanges, withoutMarkers, aiName } from '../src/core/io/chat-exports.js';
import { Conversations, parseConversation } from '../src/core/conversations.js';
import { checkedNote } from '../src/core/io/exporter.js';
import { freshStore } from './helpers.js';

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());

// A saved ChatGPT transcript, the way her planning chat came: tool steps, reasoning, citation markers,
// and a "### heading" with a table inside a reply.
const TRANSCRIPT = [
  '### YOLANDA | 2026-10-14 09:34 ET | text', '', 'Here is my story bible. Let us talk about the poster.', '',
  '### TOOL (api_tool) | 2026-10-14 09:34 ET | tether_browsing_display', '', '{"content_type":"tether_browsing_display","result":""}', '',
  '### TOOL (api_tool) | 2026-10-14 09:34 ET | multimodal_text', '', 'Make sure to include fileciteturn0file0L5-L8 in your response.', '[L1] <PARSED TEXT FOR PAGE: 1 / 57>', '',
  '### CHATGPT | 2026-10-14 09:35 ET | reasoning_recap', '', 'Thought for 12 seconds', '',
  '### CHATGPT | 2026-10-14 09:35 ET | code -> container.exec', '', 'print(1)', '',
  '### CHATGPT | 2026-10-14 09:36 ET | text', '', 'Yes, I understand.fileciteturn0file0L981-L1009 Here is how the POV works.', '',
  '### The POV record should include:', '', '| Attribute | What it identifies |', '|---|---|', '| Viewpoint character | Whose perspective governs the scene |', '',
  '### YOLANDA | 2026-10-14 09:40 ET | multimodal_text', '', 'Perfect.',
].join('\n');

describe('behind-the-scenes steps and citation markers are kept but never shown as conversation (finding 147)', () => {
  it('reads each stored message as talk, a behind-the-scenes step, or the rest of the message before it', () => {
    expect(turnRole({ speaker_kind: 'author', speaker_name: 'YOLANDA' })).toBe('talk');
    expect(turnRole({ speaker_kind: 'author', speaker_name: 'YOLANDA (multimodal_text)' })).toBe('talk');
    expect(turnRole({ speaker_kind: 'assistant', speaker_name: 'Collaborator' })).toBe('talk');
    expect(turnRole({ speaker_kind: 'assistant', speaker_name: 'TOOL (api_tool) (tether_browsing_display)' })).toBe('behind');
    expect(turnRole({ speaker_kind: 'assistant', speaker_name: 'TOOL (t2uay3k.sj1i4kz) (system_error)' })).toBe('behind');
    expect(turnRole({ speaker_kind: 'assistant', speaker_name: 'CHATGPT (reasoning_recap)' })).toBe('behind');
    expect(turnRole({ speaker_kind: 'assistant', speaker_name: 'CHATGPT (thoughts)' })).toBe('behind');
    expect(turnRole({ speaker_kind: 'assistant', speaker_name: 'CHATGPT (code -> bio)' })).toBe('behind');
    expect(turnRole({ speaker_kind: 'assistant', speaker_name: 'The POV record should include: (What it identifies |)' })).toBe('continued');
    expect(continuedHeading('The POV record should include: (What it identifies |)')).toBe('The POV record should include:');
    expect(speakerLabel('YOLANDA (multimodal_text)')).toBe('YOLANDA');
  });

  it('finds citation markers without changing the text', () => {
    const t = 'Yes.fileciteturn0file0L5-L8 And 【4:2†source】 done.';
    const r = markerRanges(t);
    expect(r).toHaveLength(3);
    expect(withoutMarkers(t)).toBe('Yes. And  done.');
    expect(t).toContain('filecite'); // the stored text is untouched
  });

  it('a new import keeps every step word for word, never splits a reply at a heading, and counts only real messages', () => {
    const { turns } = parseConversation(TRANSCRIPT, 'Yolanda');
    expect(turns).toHaveLength(7);
    expect(turns[5]!.text).toContain('### The POV record should include:');
    expect(turns[5]!.text).toContain('| Attribute | What it identifies |');
    env = freshStore();
    const pid = env.brain.createProject('IDW').id as string;
    const conv = new Conversations(env.store, env.brain);
    const r = conv.importText(pid, { title: 'Story Map Planning', text: TRANSCRIPT, authorName: 'Yolanda' });
    expect(r).toMatchObject({ turnsStored: 7, complete: true, behindTheScenes: 4 });
    expect(conv.list(pid)[0]).toMatchObject({ turn_count: 3 });
    const h = conv.harvest(r.conversation.id as string);
    expect(h.turnCount).toBe(3);
    expect(h.speakers).toEqual(['YOLANDA', 'CHATGPT']);
  });

  it('a conversation already in a library, split the old way, still shows only real speakers in the harvest', () => {
    env = freshStore();
    const pid = env.brain.createProject('IDW').id as string;
    const conv = new Conversations(env.store, env.brain);
    const c = conv.create(pid, { title: 'Old import' });
    conv.addTurn(c.id as string, { speaker_kind: 'author', speaker_name: 'YOLANDA', text: 'Hello' });
    conv.addTurn(c.id as string, { speaker_kind: 'assistant', speaker_name: 'TOOL (api_tool) (multimodal_text)', text: '[L1] <PARSED TEXT FOR PAGE: 1 / 57>' });
    conv.addTurn(c.id as string, { speaker_kind: 'assistant', speaker_name: 'CHATGPT', text: 'Hi' });
    conv.addTurn(c.id as string, { speaker_kind: 'assistant', speaker_name: 'Now look at their comic engines again. (Anthony |)', text: '|---|---|' });
    const h = conv.harvest(c.id as string);
    expect(h.speakers).toEqual(['YOLANDA', 'CHATGPT']);
    expect(h.turnCount).toBe(2);
    // Nothing was deleted.
    expect(conv.full(c.id as string).turns).toHaveLength(4);
  });
});

describe('one name for the AI partner (finding 198)', () => {
  it('names the collaborator the same way everywhere, and keeps another app its own name', () => {
    expect(aiName('Collaborator')).toBe('the collaborator');
    expect(aiName('assistant')).toBe('the collaborator');
    expect(aiName('')).toBe('the collaborator');
    expect(aiName('CHATGPT (multimodal_text)')).toBe('CHATGPT');
    expect(aiName('Claude')).toBe('Claude');
  });
});

describe('after an export, the check reads like a sentence (finding 169)', () => {
  it('counts the way a person would say them', () => {
    expect(checkedNote(1, 0)).toBe('Checked: the chapter is in the file, word for word.');
    expect(checkedNote(2, 0)).toBe('Checked: both chapters are in the file, in order, word for word.');
    expect(checkedNote(12, 3)).toBe('Checked: all 12 chapters and all 3 sections are in the file, in order, word for word.');
    expect(checkedNote(0, 1)).toBe('Checked: the section is in the file, word for word.');
  });
});
