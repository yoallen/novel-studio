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
interface ClaudeBlock { type?: string; text?: string }
interface ClaudeMsg { uuid?: string; sender?: string; text?: string; content?: ClaudeBlock[]; created_at?: string; attachments?: { file_name?: string; extracted_content?: string }[]; files?: { file_name?: string }[] }
interface ClaudeChat { uuid?: string; name?: string; created_at?: string; updated_at?: string; chat_messages?: ClaudeMsg[] }

function claudeText(m: ClaudeMsg): { text: string; left: number } {
  let left = 0;
  let body: string;
  if (Array.isArray(m.content) && m.content.length) {
    const parts: string[] = [];
    for (const b of m.content) {
      if (b.type === 'text' && typeof b.text === 'string') parts.push(b.text);
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
  for (const f of m.files ?? []) if (f.file_name) extra.push(`[File: ${f.file_name}]`);
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

/** Read any export file's conversations list, newest first. Throws a plain message if it is not one. */
export function readExport(data: unknown, authorName = 'You'): ExportChat[] {
  const kind = exportKind(data);
  if (!kind) throw new Error('That file is not a Claude or ChatGPT conversations export.');
  const chats = kind === 'Claude' ? readClaude(data, authorName) : readChatGPT(data, authorName);
  return chats.filter((c) => c.messages.length).sort((a, b) => (b.updatedAt ?? b.createdAt ?? '').localeCompare(a.updatedAt ?? a.createdAt ?? ''));
}
