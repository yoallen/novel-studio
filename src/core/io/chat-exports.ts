// Reads the data exports that Claude and ChatGPT give you, so a planning chat comes into Story Canon
// whole and word for word. Pure functions with no runtime imports: the window reads the export file
// on her own computer and sends only the chats she picks.

export interface ExportMessage { speaker_kind: 'author' | 'assistant'; speaker_name: string; text: string; said_at: string | null }
export interface ExportChat {
  /** Stable id from the export, so a chat already brought in is recognized next time. */
  origin: string;
  app: 'Claude' | 'ChatGPT';
  title: string;
  createdAt: string | null;
  updatedAt: string | null;
  messages: ExportMessage[];
  /** Parts of the chat that are not conversation (tool steps, hidden reasoning), counted so nothing vanishes silently. */
  left: number;
}

const iso = (v: unknown): string | null => {
  if (v == null || v === '') return null;
  const d = typeof v === 'number' ? new Date(v * 1000) : new Date(String(v));
  return isNaN(d.getTime()) ? null : d.toISOString();
};

/** Which app made this export, judged from its shape. */
export function exportKind(data: unknown): 'Claude' | 'ChatGPT' | null {
  if (!Array.isArray(data) || !data.length) return null;
  const first = data[0] as Record<string, unknown>;
  if (first && 'chat_messages' in first) return 'Claude';
  if (first && 'mapping' in first) return 'ChatGPT';
  return null;
}

// ---------- Claude ----------
interface ClaudeBlock { type?: string; text?: string; title?: string }
interface ClaudeMsg { uuid?: string; sender?: string; text?: string; content?: ClaudeBlock[]; created_at?: string; attachments?: { file_name?: string; extracted_content?: string }[]; files?: { file_name?: string }[] }
interface ClaudeChat { uuid?: string; name?: string; created_at?: string; updated_at?: string; chat_messages?: ClaudeMsg[] }

function claudeText(m: ClaudeMsg): { text: string; left: number } {
  let left = 0;
  let body: string;
  if (Array.isArray(m.content) && m.content.length) {
    const parts: string[] = [];
    for (const b of m.content) {
      if (b.type === 'text' && typeof b.text === 'string') parts.push(b.text);
      else if (b.type === 'document') parts.push(`[Attached: ${b.title || 'a file'}]`);
      else if (b.type === 'image') parts.push('[Image]');
      else if (b.type === 'injected_prompt_block') continue; // the app's own notes to Claude, never part of the chat
      else left++;
    }
    body = parts.join('\n\n');
  } else body = m.text ?? '';
  // Long text pasted into Claude arrives as an attachment; it is her words, so it comes in too.
  const extra: string[] = [];
  for (const a of m.attachments ?? []) {
    if (a.extracted_content) extra.push(`[Attached: ${a.file_name || 'pasted text'}]\n${a.extracted_content}`);
    else if (a.file_name) extra.push(`[Attached: ${a.file_name}]`);
  }
  for (const f of m.files ?? []) if (f.file_name && !body.includes(`[Attached: ${f.file_name}]`)) extra.push(`[File: ${f.file_name}]`);
  return { text: [body, ...extra].filter((x) => x.trim()).join('\n\n'), left };
}

export function readClaude(data: unknown, authorName = 'You'): ExportChat[] {
  return (data as ClaudeChat[]).map((c) => {
    let left = 0;
    const messages: ExportMessage[] = [];
    for (const m of c.chat_messages ?? []) {
      const { text, left: l } = claudeText(m);
      left += l;
      if (!text.trim()) continue;
      const author = m.sender === 'human';
      messages.push({ speaker_kind: author ? 'author' : 'assistant', speaker_name: author ? authorName : 'Claude', text, said_at: iso(m.created_at) });
    }
    return { origin: `claude:${c.uuid ?? c.name ?? ''}`, app: 'Claude', title: (c.name ?? '').trim() || 'Untitled chat', createdAt: iso(c.created_at), updatedAt: iso(c.updated_at), messages, left };
  });
}

// ---------- ChatGPT ----------
interface GptNode { message?: { author?: { role?: string }; create_time?: number | null; content?: { content_type?: string; parts?: unknown[] }; metadata?: { is_visually_hidden_from_conversation?: boolean } } | null; parent?: string | null }
interface GptChat { id?: string; conversation_id?: string; title?: string; create_time?: number; update_time?: number; mapping?: Record<string, GptNode>; current_node?: string }

export function readChatGPT(data: unknown, authorName = 'You'): ExportChat[] {
  return (data as GptChat[]).map((c) => {
    const map = c.mapping ?? {};
    // The visible conversation is the branch that ends at current_node; edited-away branches are skipped.
    const path: GptNode[] = [];
    let at = c.current_node ?? null;
    const seen = new Set<string>();
    while (at && map[at] && !seen.has(at)) { seen.add(at); path.unshift(map[at]!); at = map[at]!.parent ?? null; }
    let left = 0;
    const messages: ExportMessage[] = [];
    for (const n of path) {
      const m = n.message;
      if (!m) continue;
      const role = m.author?.role;
      if (role !== 'user' && role !== 'assistant') { if (role === 'tool') left++; continue; }
      if (m.metadata?.is_visually_hidden_from_conversation) continue;
      const ct = m.content?.content_type;
      if (ct !== 'text' && ct !== 'multimodal_text') { left++; continue; }
      const text = (m.content?.parts ?? []).map((p) => (typeof p === 'string' ? p : (p as { text?: string })?.text ?? '')).filter((x) => x).join('\n\n');
      if (!text.trim()) continue;
      messages.push({ speaker_kind: role === 'user' ? 'author' : 'assistant', speaker_name: role === 'user' ? authorName : 'ChatGPT', text, said_at: iso(m.create_time) });
    }
    return { origin: `chatgpt:${c.conversation_id ?? c.id ?? c.title ?? ''}`, app: 'ChatGPT', title: (c.title ?? '').trim() || 'Untitled chat', createdAt: iso(c.create_time), updatedAt: iso(c.update_time), messages, left };
  });
}

// ---------- what a stored message is, for showing it ----------
// Chats brought in from a saved transcript can carry the app's own working steps (tool calls, code it ran, its
// hidden reasoning) and citation markers it writes for itself. They are kept in the library exactly as they came,
// and never shown as conversation. These read a stored message and say how to show it; nothing is changed.

const SPOKEN_TYPES = new Set(['text', 'multimodal_text']);

/**
 * How to show a stored message.
 * - talk: a real message from a person or an AI.
 * - behind: a behind-the-scenes step (a tool, code it ran, its reasoning), kept but not shown as conversation.
 * - continued: part of the message before it, split off when a heading inside it was misread as a new message.
 */
export function turnRole(t: { speaker_kind?: string; speaker_name?: string | null }): 'talk' | 'behind' | 'continued' {
  const name = String(t.speaker_name ?? '').trim();
  if (/^(tool|system)\b/i.test(name)) return 'behind';
  if (name.includes('|')) return 'continued';
  const type = name.match(/\(([^()]*)\)\s*$/)?.[1]?.trim();
  if (type && /^[a-z_.]+(\s*->\s*[\w.]+)?$/.test(type) && !SPOKEN_TYPES.has(type)) return 'behind';
  return 'talk';
}

/** The speaker's name as a person would say it: "YOLANDA (multimodal_text)" reads as "YOLANDA". */
export function speakerLabel(name: string | null | undefined): string {
  return String(name ?? '').replace(/\s*\((?:text|multimodal_text)\)\s*$/, '').trim();
}

/**
 * Who an AI line came from, in words: a chat app's own name when the line came in from one ("ChatGPT"),
 * otherwise "the collaborator", the one name Story Canon's own AI partner has everywhere on screen.
 */
export function aiName(name: string | null | undefined): string {
  const n = speakerLabel(name);
  return !n || /^(assistant|collaborator|the collaborator)$/i.test(n) ? 'the collaborator' : n;
}

/** For a "continued" message: the heading inside the earlier message that was misread as a speaker. */
export function continuedHeading(name: string | null | undefined): string {
  return String(name ?? '').replace(/\s*\([^()]*\|\s*\)\s*$/, '').trim();
}

/**
 * Character ranges in a message that are an app's own citation markers, not words anyone wrote:
 * ChatGPT's private-use markers (shown as garbled symbols, such as "filecite turn0file0") and its older
 * "【4:2†source】" notes. Returned as [start, end) pairs in the stored text, so the text itself never changes.
 */
export function markerRanges(text: string): [number, number][] {
  const out: [number, number][] = [];
  const re = /[^\n]{0,200}|【\d+(?::\d+)?†[^】\n]{0,80}】|[-]/g;
  for (const m of text.matchAll(re)) out.push([m.index!, m.index! + m[0].length]);
  return out;
}

/** The text with citation markers left out, for counting and showing. */
export function withoutMarkers(text: string): string {
  let out = '', pos = 0;
  for (const [s, e] of markerRanges(text)) { out += text.slice(pos, s); pos = e; }
  return out + text.slice(pos);
}

/** Read any export file's conversations list, newest first. Throws a plain message if it is not one. */
export function readExport(data: unknown, authorName = 'You'): ExportChat[] {
  const kind = exportKind(data);
  if (!kind) throw new Error('That file is not a Claude or ChatGPT conversations export.');
  const chats = kind === 'Claude' ? readClaude(data, authorName) : readChatGPT(data, authorName);
  return chats.filter((c) => c.messages.length).sort((a, b) => (b.updatedAt ?? b.createdAt ?? '').localeCompare(a.updatedAt ?? a.createdAt ?? ''));
}
