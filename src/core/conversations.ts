// Conversations are kept whole, word for word (R-A-054). What comes out of them is linked back to the
// exact message (R-A-029), caught in one click while she talks (R-A-055), and gathered at the end in a
// harvest where nothing becomes a decision without her (R-A-056).

import { Store, Row, withFields, NotFoundError, ValidationError, newId, nowIso } from './store.js';
import { Brain } from './brain.js';

export interface ParsedTurn { speaker_kind: 'author' | 'assistant' | 'source'; speaker_name: string; text: string; said_at: string | null }

const AUTHOR_NAMES = /^(you|me|user|human|author|i)$/i;

/**
 * Read a pasted or exported conversation into turns without changing any words.
 * Understands her ChatGPT export headers ("### NAME | 2026-10-14 10:43 ET | text"), copied web chats
 * ("You said:" / "ChatGPT said:"), and "Name: text" transcripts. Anything else becomes one turn.
 */
export function parseConversation(raw: string, authorName = ''): { turns: ParsedTurn[]; format: string } {
  const text = raw.replace(/\r\n?/g, '\n');
  const isAuthor = (name: string) => AUTHOR_NAMES.test(name.trim()) || (!!authorName && name.trim().toLowerCase() === authorName.trim().toLowerCase());

  // 1. Export headers.
  const hdr = /^###\s+([^|\n]+?)\s*\|\s*([^|\n]*?)\s*\|\s*([^\n]*)$/gm;
  const heads = [...text.matchAll(hdr)];
  if (heads.length >= 1) {
    const turns: ParsedTurn[] = [];
    heads.forEach((m, i) => {
      const start = m.index! + m[0].length + 1;
      const end = i + 1 < heads.length ? heads[i + 1]!.index! : text.length;
      const body = text.slice(start, end).replace(/^\n+|\n+$/g, '');
      const name = m[1]!.trim();
      const type = m[3]!.trim();
      turns.push({ speaker_kind: isAuthor(name) || (authorName === '' && /yolanda/i.test(name)) ? 'author' : 'assistant', speaker_name: type && type !== 'text' ? `${name} (${type})` : name, text: body, said_at: parseWhen(m[2]!) });
    });
    return { turns, format: 'export headers' };
  }

  // 2. Copied web chat.
  const said = /^(You|ChatGPT|Claude|Gemini|Copilot|Assistant)\s+said:\s*$/gim;
  const saids = [...text.matchAll(said)];
  if (saids.length >= 2) {
    const turns = saids.map((m, i) => {
      const start = m.index! + m[0].length;
      const end = i + 1 < saids.length ? saids[i + 1]!.index! : text.length;
      const name = m[1]!;
      return { speaker_kind: /^you$/i.test(name) ? 'author' : 'assistant', speaker_name: name, text: text.slice(start, end).replace(/^\n+|\n+$/g, ''), said_at: null } as ParsedTurn;
    });
    return { turns, format: 'copied chat' };
  }

  // 3. "Name: text" lines.
  const line = /^([A-Z][\w .'-]{0,30}):\s/gm;
  const lines = [...text.matchAll(line)];
  const names = new Set(lines.map((m) => m[1]!.trim()));
  if (lines.length >= 2 && names.size >= 2 && names.size <= 6) {
    const turns = lines.map((m, i) => {
      const start = m.index! + m[0].length;
      const end = i + 1 < lines.length ? lines[i + 1]!.index! : text.length;
      const name = m[1]!.trim();
      return { speaker_kind: isAuthor(name) ? 'author' : /^(assistant|ai|claude|chatgpt|gpt)$/i.test(name) ? 'assistant' : 'source', speaker_name: name, text: text.slice(start, end).replace(/\n+$/g, ''), said_at: null } as ParsedTurn;
    });
    return { turns, format: 'named lines' };
  }

  return { turns: [{ speaker_kind: 'source', speaker_name: 'Pasted text', text: text.replace(/^\n+|\n+$/g, ''), said_at: null }], format: 'single block' };
}

function parseWhen(s: string): string | null {
  const m = s.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2})(?:\s*(ET|EDT|EST|UTC|Z))?/i);
  if (!m) return null;
  const tz = (m[6] ?? '').toUpperCase();
  const off = tz === 'UTC' || tz === 'Z' ? 'Z' : tz === 'EST' ? '-05:00' : '-04:00';
  const iso = `${m[1]}-${m[2]}-${m[3]}T${m[4]!.padStart(2, '0')}:${m[5]}:00${off}`;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export class Conversations {
  constructor(private store: Store, private brain: Brain) {}

  create(projectId: string, input: { title: string; focusElementId?: string | null; mode?: string; sourceId?: string | null; startedAt?: string }) {
    this.brain.project(projectId);
    if (input.focusElementId) this.brain.element(input.focusElementId, projectId);
    return this.store.batch({ projectId, actor: 'author', reason: `Start conversation "${input.title}"` }, (w) =>
      w.insert('conversations', { project_id: projectId, title: input.title.trim() || 'Conversation', mode: input.mode ?? 'discuss', focus_element_id: input.focusElementId ?? null, source_id: input.sourceId ?? null, started_at: input.startedAt ?? nowIso() }));
  }

  addTurn(conversationId: string, turn: { speaker_kind: 'author' | 'assistant' | 'source'; speaker_name?: string; text: string; said_at?: string | null }) {
    const c = this.get(conversationId);
    if (typeof turn.text !== 'string') throw new ValidationError('A message needs text.');
    const pos = (this.store.db.prepare('SELECT COALESCE(MAX(position),0)+1 AS n FROM turns WHERE conversation_id=?').get(conversationId) as { n: number }).n;
    return this.store.batch({ projectId: c.project_id as string, actor: turn.speaker_kind === 'assistant' ? 'assistant' : 'author', reason: `Message in "${c.title}"` }, (w) =>
      w.insert('turns', { conversation_id: conversationId, position: pos, speaker_kind: turn.speaker_kind, speaker_name: turn.speaker_name ?? '', text: turn.text, said_at: turn.said_at ?? nowIso() }));
  }

  /** Import a whole conversation verbatim. Reports what it found so she can confirm nothing was lost. */
  importText(projectId: string, input: { title: string; text: string; authorName?: string; focusElementId?: string | null }) {
    const { turns, format } = parseConversation(input.text, input.authorName ?? '');
    if (!turns.length || turns.every((t) => !t.text.trim())) throw new ValidationError('There is nothing to import in that text.');
    const src = this.brain.addSource(projectId, { kind: 'conversation', name: input.title, madeAt: turns.find((t) => t.said_at)?.said_at ?? null });
    const conv = this.create(projectId, { title: input.title, sourceId: src.id, focusElementId: input.focusElementId ?? null, startedAt: turns.find((t) => t.said_at)?.said_at ?? nowIso() });
    this.store.db.transaction(() => {
      const ins = this.store.db.prepare('INSERT INTO turns(id,conversation_id,position,speaker_kind,speaker_name,text,said_at) VALUES (?,?,?,?,?,?,?)');
      turns.forEach((t, i) => ins.run(newId(), conv.id, i + 1, t.speaker_kind, t.speaker_name, t.text, t.said_at ?? conv.started_at));
    })();
    const stored = this.store.db.prepare('SELECT COUNT(*) AS n, COALESCE(SUM(LENGTH(text)),0) AS chars FROM turns WHERE conversation_id=?').get(conv.id) as { n: number; chars: number };
    // SQLite counts characters (code points); JavaScript counts UTF-16 units. Count the same way so an emoji never reads as loss.
    const expectedChars = turns.reduce((a, t) => a + [...t.text].length, 0);
    return { conversation: this.get(conv.id), format, turnsFound: turns.length, turnsStored: stored.n, charactersKept: stored.chars, complete: stored.n === turns.length && stored.chars === expectedChars, byAuthor: turns.filter((t) => t.speaker_kind === 'author').length };
  }

  get(id: string) {
    const c = this.store.get('conversations', id);
    if (!c || c.deleted_at) throw new NotFoundError('conversation');
    return c;
  }

  list(projectId: string) {
    return this.store.db.prepare(
      `SELECT c.*, (SELECT COUNT(*) FROM turns t WHERE t.conversation_id=c.id) AS turn_count, (SELECT COUNT(*) FROM marks m WHERE m.conversation_id=c.id AND m.deleted_at IS NULL) AS mark_count
       FROM conversations c WHERE c.project_id=? AND c.deleted_at IS NULL ORDER BY c.started_at DESC`,
    ).all(projectId) as Row[];
  }

  full(id: string) {
    const c = this.get(id);
    const turns = this.store.db.prepare('SELECT * FROM turns WHERE conversation_id=? ORDER BY position').all(id) as Row[];
    const marks = this.store.db.prepare('SELECT * FROM marks WHERE conversation_id=? AND deleted_at IS NULL ORDER BY created_at').all(id) as Row[];
    return { conversation: c, turns, marks };
  }

  private turn(turnId: string) {
    const t = this.store.db.prepare('SELECT t.*, c.project_id, c.title AS conversation_title FROM turns t JOIN conversations c ON c.id=t.conversation_id WHERE t.id=?').get(turnId) as Row | undefined;
    if (!t) throw new NotFoundError('message');
    return t;
  }

  private quoteOf(t: Row, start: number, end: number) {
    const text = t.text as string;
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end > text.length || start >= end) throw new ValidationError('Select some words in the message first.');
    return text.slice(start, end);
  }

  private mark(t: Row, kind: string, start: number, end: number, quote: string, extra: { elementId?: string | null; statementId?: string | null; note?: string } = {}) {
    return this.store.batch({ projectId: t.project_id as string, actor: 'author', reason: `${kind.replace('_', ' ')}: "${quote.slice(0, 40)}"` }, (w) =>
      w.insert('marks', { conversation_id: t.conversation_id, turn_id: t.id, start_offset: start, end_offset: end, kind, quote, element_id: extra.elementId ?? null, statement_id: extra.statementId ?? null, note: extra.note ?? '' }));
  }

  /** Keep this line: saved verbatim, attributed, placement open, nothing placed (R-A-026, R-A-055). */
  keep(turnId: string, start: number, end: number, opts: { linkTo?: string[]; note?: string } = {}) {
    const t = this.turn(turnId);
    const quote = this.quoteOf(t, start, end);
    const pid = t.project_id as string;
    const title = quote.length > 80 ? quote.slice(0, 77).trimEnd() + '…' : quote;
    const el = this.brain.createElement(pid, { kind: 'line', title, body: quote, attrs: { written_by: t.speaker_kind, written_by_name: t.speaker_name, kept_by: 'author', placement: 'open', conversation_id: t.conversation_id, turn_id: t.id } });
    for (const to of opts.linkTo ?? []) this.brain.link(pid, { fromId: el.id, toId: to, relation: 'relates_to' });
    return this.mark(t, 'keep', start, end, quote, { elementId: el.id, note: opts.note });
  }

  /** Add as a possibility on a field: Developing, attributed to whoever said it, linked to the message. */
  possibility(turnId: string, start: number, end: number, target: { elementId: string; field: string }) {
    const t = this.turn(turnId);
    const quote = this.quoteOf(t, start, end);
    this.brain.element(target.elementId, t.project_id as string);
    const speaker = { kind: (t.speaker_kind === 'author' ? 'author' : t.speaker_kind === 'assistant' ? 'assistant' : 'source') as 'author' | 'assistant' | 'source', name: t.speaker_name as string };
    const st = this.brain.addStatement({ elementId: target.elementId, field: target.field, value: quote, status: speaker.kind === 'assistant' ? 'proposed' : 'developing', speaker, turnId: t.id as string, madeAt: t.said_at as string });
    return this.mark(t, 'possibility', start, end, quote, { elementId: target.elementId, statementId: st.id as string });
  }

  /** A question or idea from the conversation. Questions the assistant raised are suggestions until she adopts them (R-A-029). */
  capture(turnId: string, start: number, end: number, kind: 'question' | 'idea', opts: { linkTo?: string[] } = {}) {
    const t = this.turn(turnId);
    const quote = this.quoteOf(t, start, end);
    const pid = t.project_id as string;
    const fromAssistant = t.speaker_kind === 'assistant';
    const el = this.brain.createElement(pid, {
      kind, title: quote.length > 80 ? quote.slice(0, 77).trimEnd() + '…' : quote, body: quote,
      attrs: { origin: t.speaker_kind, origin_name: t.speaker_name, conversation_id: t.conversation_id, turn_id: t.id, ...(fromAssistant ? { suggested: true } : {}) },
    });
    for (const to of opts.linkTo ?? []) this.brain.link(pid, { fromId: el.id, toId: to, relation: 'relates_to' });
    return this.mark(t, kind, start, end, quote, { elementId: el.id });
  }

  /** Not canon: considered and set aside, kept in history. */
  notCanon(turnId: string, start: number, end: number, note = '') {
    const t = this.turn(turnId);
    return this.mark(t, 'not_canon', start, end, this.quoteOf(t, start, end), { note });
  }

  removeMark(markId: string) {
    const m = this.store.get('marks', markId);
    if (!m || m.deleted_at) throw new NotFoundError('mark');
    const c = this.get(m.conversation_id as string);
    this.store.batch({ projectId: c.project_id as string, actor: 'author', reason: 'Remove a conversation mark' }, (w) => w.remove('marks', markId));
  }

  /** The harvest: what came out of this conversation, with everything still hers to decide (R-A-056). */
  harvest(conversationId: string) {
    const { conversation, turns, marks } = this.full(conversationId);
    const pid = conversation.project_id as string;
    const byKind = (k: string) => marks.filter((m) => m.kind === k);
    const statementIds = marks.map((m) => m.statement_id).filter(Boolean) as string[];
    const statements = statementIds.map((id) => this.store.get('statements', id)).filter(Boolean).map((s) => withFields(s!, { value: JSON.parse(s!.value_json as string) as unknown, element_title: this.store.get('elements', s!.element_id as string)?.title }));
    const created = this.store.db.prepare("SELECT id, kind, title, body, state, attrs_json FROM elements WHERE project_id=? AND deleted_at IS NULL AND json_extract(attrs_json,'$.conversation_id')=? ORDER BY created_at").all(pid, conversationId) as Row[];
    const linkedIds = new Set<string>();
    for (const m of marks) if (m.element_id) linkedIds.add(m.element_id as string);
    if (conversation.focus_element_id) linkedIds.add(conversation.focus_element_id as string);
    for (const e of created) for (const l of this.brain.linksOf(e.id as string)) { linkedIds.add(l.from_id as string); linkedIds.add(l.to_id as string); }
    const implicated = [...linkedIds].map((id) => this.store.get('elements', id)).filter((e) => e && !e.deleted_at && !created.some((c) => c.id === e.id)).map((e) => ({ id: e!.id, title: e!.title, kind: e!.kind }));
    const pending = this.store.db.prepare("SELECT id FROM proposals WHERE conversation_id=? AND status='pending'").all(conversationId) as Row[];
    return {
      conversation, turnCount: turns.length,
      speakers: [...new Set(turns.map((t) => `${t.speaker_name || t.speaker_kind}`))],
      kept: byKind('keep'), possibilities: byKind('possibility'), questions: byKind('question'), ideas: byKind('idea'), notCanon: byKind('not_canon'),
      statements, created: created.map((c) => ({ ...c, attrs: JSON.parse(c.attrs_json as string) as Record<string, unknown> })), implicated,
      pendingSuggestions: pending.map((p) => this.brain.proposal(p.id as string)),
      decidedNothingForYou: statements.every((s) => s.status !== 'established' || s.speaker_kind === 'author'),
    };
  }

  markHarvested(conversationId: string) {
    this.get(conversationId);
    this.store.db.prepare('UPDATE conversations SET harvested_at=? WHERE id=?').run(nowIso(), conversationId);
  }

  /** Where did this come from? The message behind a statement, a kept line, a question or an idea. */
  originOf(input: { statementId?: string; elementId?: string }) {
    let turnId: string | null = null;
    if (input.statementId) turnId = (this.store.get('statements', input.statementId)?.turn_id as string | null) ?? null;
    if (!turnId && input.elementId) {
      const e = this.store.get('elements', input.elementId);
      turnId = e ? ((JSON.parse((e.attrs_json as string) || '{}') as Record<string, unknown>).turn_id as string | undefined) ?? null : null;
    }
    if (!turnId) return null;
    const t = this.turn(turnId);
    return { conversationId: t.conversation_id, conversationTitle: t.conversation_title, turnId: t.id, position: t.position, speaker: t.speaker_name || t.speaker_kind, speakerKind: t.speaker_kind, saidAt: t.said_at, text: t.text };
  }
}
