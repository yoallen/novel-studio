import { openAtPage } from './Pages';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';
import { when, valueText, statusWord } from './status';
import { readExport, turnRole, speakerLabel, continuedHeading, markerRanges, withoutMarkers, type ExportChat } from '../core/io/chat-exports';

// Conversations, kept word for word (R-A-054). Select words in any message to keep a line, add a
// possibility, raise a question or idea, or mark something not canon, in one action (R-A-055).
// The harvest gathers what came out of it, and nothing is decided for her (R-A-056).
/** Start a conversation focused on one record or scene and open it (the "Ask about this" entry points). */
export async function askAbout(ctx: Ctx, input: { title: string; elementId?: string | null; sceneId?: string | null }) {
  const c = await api.post(`/api/projects/${ctx.projectId}/conversations`, { title: input.title, focusElementId: input.elementId ?? null, mode: 'discuss' });
  try {
    sessionStorage.setItem('ns-conv', c.id);
    if (input.sceneId) sessionStorage.setItem(`ns-conv-scene-${c.id}`, input.sceneId);
  } catch { /* ignore */ }
  ctx.go('conversations');
}

export function ConversationsView({ ctx }: { ctx: Ctx }) {
  const [list, setList] = useState<any[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(() => { try { return sessionStorage.getItem('ns-conv'); } catch { return null; } });
  const [importing, setImporting] = useState(false);
  const [fromExport, setFromExport] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(() => api.get(`/api/projects/${ctx.projectId}/conversations`).then(setList).catch((e) => setError(e.message)), [ctx.projectId]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { try { if (openId) sessionStorage.setItem('ns-conv', openId); else sessionStorage.removeItem('ns-conv'); } catch { /* ignore */ } }, [openId]);

  if (openId) return <Conversation ctx={ctx} id={openId} onBack={() => { setOpenId(null); void load(); }} />;
  return (
    <div className="scroll"><div className="content">
      <h1>Conversations</h1>
      <p className="muted">Every conversation is kept whole, word for word. What you keep from it links back to the exact message.</p>
      {error && <div className="notice error">{error}</div>}
      <div className="row" style={{ marginBottom: '1rem' }}>
        <button className="btn" onClick={() => setFromExport(true)}>Bring in from a Claude or ChatGPT export</button>
        <button className="btn" onClick={() => setImporting(true)}>Bring in a conversation</button>
        <button className="btn" onClick={() => void api.post(`/api/projects/${ctx.projectId}/conversations`, { title: `Conversation, ${new Date().toLocaleDateString()}` }).then((c) => setOpenId(c.id)).catch((e) => setError(e.message))}>Start a new one</button>
      </div>
      {list && list.length === 0 && <p className="muted">None yet.</p>}
      <ul className="list">
        {list?.map((c) => (
          <li key={c.id} className="row">
            <button className="btn link grow" style={{ textAlign: 'left', fontSize: '1.05rem' }} onClick={() => setOpenId(c.id)}>{c.title}</button>
            <span className="faint small">{c.turn_count} messages, {c.mark_count} kept or marked{c.harvested_at ? ', harvested' : ''}, {when(c.started_at)}</span>
          </li>
        ))}
      </ul>
      {fromExport && <ExportPicker ctx={ctx} onClose={() => { setFromExport(false); void load(); }} onOpen={(id) => { setFromExport(false); setOpenId(id); }} />}
      {importing && <ImportDialog ctx={ctx} onClose={() => setImporting(false)} onDone={(id) => { setImporting(false); setOpenId(id); }} />}
    </div></div>
  );
}

function ImportDialog({ ctx, onClose, onDone }: { ctx: Ctx; onClose: () => void; onDone: (id: string) => void }) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState('');
  async function file(f: File) { setText(await f.text()); if (!title) setTitle(f.name.replace(/\.(md|txt)$/i, '')); }
  async function go() {
    setError('');
    try { setReport(await api.post(`/api/projects/${ctx.projectId}/conversations/import`, { title: title.trim() || 'Imported conversation', text })); }
    catch (e) { setError((e as Error).message); }
  }
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="ci-h"><div className="dialog">
      <h2 id="ci-h">Bring in a conversation</h2>
      {error && <div className="notice error">{error}</div>}
      {!report ? (
        <>
          <p className="small muted">Paste it, or choose a saved .md or .txt file. Every message is kept exactly as written, with who said it and when, if the file says.</p>
          <label className="field"><span>Name</span><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
          <label className="field"><span>The conversation</span><textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} /></label>
          <input type="file" accept=".md,.txt,text/plain,text/markdown" onChange={(e) => e.target.files?.[0] && void file(e.target.files[0])} />
          <div className="row" style={{ marginTop: '1rem' }}><button className="btn write" disabled={!text.trim()} onClick={() => void go()}>Bring it in</button><button className="btn" onClick={onClose}>Cancel</button></div>
        </>
      ) : (
        <>
          <div className={'notice' + (report.complete ? '' : ' error')} role="status">
            {report.complete ? 'Everything was kept.' : 'Some text may not have been kept. Check the conversation before relying on it.'} {report.turnsStored} messages ({report.byAuthor} from you), {report.charactersKept.toLocaleString()} characters, read as {report.format}.{report.behindTheScenes ? ` ${report.behindTheScenes} of them ${report.behindTheScenes === 1 ? 'is a behind-the-scenes step' : 'are behind-the-scenes steps'} (tools, code, the app's notes to itself), kept but not shown as conversation.` : ''}
          </div>
          <button className="btn write" onClick={() => onDone(report.conversation.id)}>Open it</button>
        </>
      )}
    </div></div>
  );
}

/** Pick chats out of a Claude or ChatGPT data export and bring each in whole, word for word. */
function ExportPicker({ ctx, onClose, onOpen }: { ctx: Ctx; onClose: () => void; onOpen: (id: string) => void }) {
  const [chats, setChats] = useState<ExportChat[] | null>(null);
  const [reading, setReading] = useState('');
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [have, setHave] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState('');
  const [done, setDone] = useState<{ title: string; id?: string; ok: boolean; note: string }[]>([]);
  useEffect(() => { api.get(`/api/projects/${ctx.projectId}/conversations/origins`).then((o: string[]) => setHave(new Set(o))).catch(() => {}); }, [ctx.projectId]);

  async function pick(f: File) {
    setError(''); setChats(null); setReading(`Reading ${f.name}…`);
    try {
      const me = String(ctx.settings?.authorName || 'You');
      let all: ExportChat[] = [];
      if (/\.zip$/i.test(f.name)) {
        const JSZip = (await import('jszip')).default;
        const zip = await JSZip.loadAsync(f);
        const files = Object.values(zip.files).filter((z) => !z.dir && /(^|\/)conversations(-\d+)?\.json$/i.test(z.name));
        if (!files.length) throw new Error('That zip has no conversations file in it. Choose the export zip itself, as it arrived.');
        for (const z of files) all = all.concat(readExport(JSON.parse(await z.async('string')), me));
      } else all = readExport(JSON.parse(await f.text()), me);
      setChats(all.sort((a, b) => (b.updatedAt ?? b.createdAt ?? '').localeCompare(a.updatedAt ?? a.createdAt ?? '')));
    } catch (e) { setError(e instanceof SyntaxError ? 'That file could not be read as an export. Choose the .zip as it arrived, or the conversations.json inside it.' : (e as Error).message); }
    finally { setReading(''); }
  }

  // Search looks at names and inside every message. Lowercased once, so typing stays quick on a large export.
  const lowered = useMemo(() => (chats ?? []).map((c) => ({ title: c.title.toLowerCase(), body: c.messages.map((m) => m.text.toLowerCase()).join('\n') })), [chats]);
  const [term, setTerm] = useState('');
  useEffect(() => { const t = window.setTimeout(() => setTerm(q.trim().toLowerCase()), 250); return () => window.clearTimeout(t); }, [q]);
  const found = useMemo(() => {
    if (!chats) return [] as { c: ExportChat; inTitle: boolean; mentions: number }[];
    if (!term) return chats.map((c) => ({ c, inTitle: false, mentions: 0 }));
    const out: { c: ExportChat; inTitle: boolean; mentions: number }[] = [];
    chats.forEach((c, i) => {
      const inTitle = lowered[i]!.title.includes(term);
      let mentions = 0, at = lowered[i]!.body.indexOf(term);
      while (at >= 0) { mentions++; at = lowered[i]!.body.indexOf(term, at + term.length); }
      if (inTitle || mentions) out.push({ c, inTitle, mentions });
    });
    return out.sort((a, b) => Number(b.inTitle) - Number(a.inTitle) || b.mentions - a.mentions);
  }, [chats, lowered, term]);
  const LIMIT = 1000;
  const shown = found.slice(0, LIMIT);
  const matching = found.length;
  const span = useMemo(() => {
    const ds = (chats ?? []).map((c) => c.createdAt).filter(Boolean).sort() as string[];
    const f = (d: string) => new Date(d).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
    return ds.length ? `${f(ds[0]!)} and ${f(ds[ds.length - 1]!)}` : '';
  }, [chats]);
  const day = (d: string | null) => (d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '');

  async function bringIn() {
    if (!chats) return;
    const list = chats.filter((c) => picked.has(c.origin));
    const out: typeof done = [];
    for (const [i, c] of list.entries()) {
      setBusy(`Bringing in ${i + 1} of ${list.length}: ${c.title}`);
      try {
        const r = await api.post(`/api/projects/${ctx.projectId}/conversations/import-chat`, { title: c.title, app: c.app, origin: c.origin, turns: c.messages });
        out.push({ title: c.title, id: r.conversation.id, ok: r.complete, note: `${r.turnsStored} messages (${r.byAuthor} from you)${c.left ? `; ${c.left} behind-the-scenes step${c.left === 1 ? '' : 's'} (tools, reasoning) left out` : ''}` });
      } catch (e) { out.push({ title: c.title, ok: false, note: (e as Error).message }); }
    }
    setBusy(''); setDone(out); setPicked(new Set());
    api.get(`/api/projects/${ctx.projectId}/conversations/origins`).then((o: string[]) => setHave(new Set(o))).catch(() => {});
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="ex-h"><div className="dialog wide">
      <h2 id="ex-h">Bring in from a Claude or ChatGPT export</h2>
      {error && <div className="notice error" role="alert">{error}</div>}
      {done.length > 0 && (
        <div className="notice" role="status">
          <ul className="export-done">{done.map((d) => <li key={d.title + d.note}>{d.ok ? 'Everything kept' : 'Check this one'}: {d.id ? <button className="btn link" onClick={() => onOpen(d.id!)}>{d.title}</button> : d.title}, {d.note}.</li>)}</ul>
        </div>
      )}
      {!chats ? (
        <>
          <p className="small muted">Both apps can send you a copy of all your chats as a .zip file. Choose that file here, as it arrived (or the conversations.json inside it). It is read on this computer; only the chats you pick are added, each one word for word, with who said what and when.</p>
          <input type="file" accept=".zip,.json,application/zip,application/json" aria-label="Choose the export file" onChange={(e) => e.target.files?.[0] && void pick(e.target.files[0])} />
          {reading && <p className="small muted" role="status">{reading}</p>}
        </>
      ) : (
        <>
          <p className="small muted">{chats.length.toLocaleString()} chats in this export{span ? `, started between ${span}` : ''}, newest first. Check the ones that belong to this novel. A chat started outside those dates is in a different export.</p>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="A name, a character, a phrase" aria-label="Find chats by name or by what was said" />
          {term && <p className="small muted" role="status" style={{ margin: '0.4rem 0 0' }}>{matching === 0 ? 'No chat mentions that.' : `${matching.toLocaleString()} chat${matching === 1 ? '' : 's'} with "${q.trim()}", names first, then the most mentions.`}</p>}
          <ul className="export-list" aria-label="Chats in the export">
            {shown.map(({ c, mentions }) => (
              <li key={c.origin}>
                <label className="choice">
                  <input type="checkbox" aria-label={c.title} checked={picked.has(c.origin)} onChange={(e) => { const n = new Set(picked); if (e.target.checked) n.add(c.origin); else n.delete(c.origin); setPicked(n); }} />
                  <span>{c.title}{have.has(c.origin) && <span className="chip">already here</span>}<small>{c.app}, {day(c.updatedAt ?? c.createdAt)}, {c.messages.length} messages{mentions ? `, mentions it ${mentions} time${mentions === 1 ? '' : 's'}` : ''}</small></span>
                </label>
              </li>
            ))}
          </ul>
          {matching > shown.length && <p className="small faint">Showing {shown.length.toLocaleString()} of {matching.toLocaleString()}. Search to narrow the list.</p>}
        </>
      )}
      <div className="row" style={{ marginTop: '1rem' }}>
        {chats && <button className="btn write" disabled={!picked.size || !!busy} onClick={() => void bringIn()}>{picked.size ? `Bring in ${picked.size} chat${picked.size === 1 ? '' : 's'}` : 'Check a chat to bring in'}</button>}
        <button className="btn" onClick={onClose} disabled={!!busy}>{done.length ? 'Done' : 'Cancel'}</button>
        {busy && <span className="small muted" role="status">{busy}</span>}
      </div>
    </div></div>
  );
}

type Sel = { turnId: string; start: number; end: number; quote: string };

/** Open the Story Brain on one of its lists. */
function openBrain(ctx: Ctx, kind: 'suggestions' | 'notes') {
  try { sessionStorage.setItem('ns-brain-sel', JSON.stringify({ kind })); } catch { /* ignore */ }
  ctx.go('brain');
}

/** Records for a picker, grouped under their kind's name, so a long list reads like a table of contents. */
function RecordOptions({ all, kinds }: { all: any[]; kinds: any[] }) {
  const groups = useMemo(() => {
    const byKind = new Map<string, any[]>();
    for (const x of all) { const l = byKind.get(x.kind); if (l) l.push(x); else byKind.set(x.kind, [x]); }
    const order = kinds.map((k) => k.key as string);
    const rank = (k: string) => (order.indexOf(k) < 0 ? 999 : order.indexOf(k));
    const keys = [...byKind.keys()].sort((a, b) => rank(a) - rank(b));
    const inStoryOrder = new Set(['beat', 'scene_plan']);
    return keys.map((k) => {
      const items = byKind.get(k)!;
      const label = kinds.find((x) => x.key === k)?.plural ?? String(k).replace(/_/g, ' ');
      return [label, inStoryOrder.has(k) ? items : [...items].sort((a, b) => String(a.title).localeCompare(String(b.title), undefined, { numeric: true, sensitivity: 'base' }))] as [string, any[]];
    });
  }, [all, kinds]);
  return <>{groups.map(([label, items]) => <optgroup key={label} label={label}>{items.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}</optgroup>)}</>;
}

function Conversation({ ctx, id, onBack }: { ctx: Ctx; id: string; onBack: () => void }) {
  const [data, setData] = useState<any>(null);
  const [sel, setSel] = useState<Sel | null>(null);
  const [harvest, setHarvest] = useState<any>(null);
  const [error, setError] = useState('');
  const [all, setAll] = useState<any[]>([]);
  const [kinds, setKinds] = useState<any[]>([]);
  const [target, setTarget] = useState<{ elementId: string; field: string }>({ elementId: '', field: '' });
  const [fields, setFields] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [speaker, setSpeaker] = useState<'author' | 'assistant'>('author');
  const [note, setNote] = useState('');
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [ask, setAsk] = useState('');
  const [mode, setMode] = useState<string>('discuss');
  const [about, setAbout] = useState('');
  const [showBehind, setShowBehind] = useState(false);
  const [asPossibility, setAsPossibility] = useState(false);
  const sceneId = useMemo(() => { try { return sessionStorage.getItem(`ns-conv-scene-${id}`); } catch { return null; } }, [id]);
  useEffect(() => { if (data?.conversation?.focus_element_id) setAbout((a) => a || data.conversation.focus_element_id); }, [data]);
  const [thinking, setThinking] = useState(false);
  const [lastSuggestions, setLastSuggestions] = useState<any[]>([]);
  useEffect(() => { api.get(`/api/projects/${ctx.projectId}/ai`).then(setAiStatus).catch(() => setAiStatus(null)); }, [ctx.projectId]);
  async function askIt(e: React.FormEvent) {
    e.preventDefault();
    if (!ask.trim() || thinking) return;
    setThinking(true); setError('');
    try { const r = await api.post(`/api/conversations/${id}/ask`, { text: ask, mode, focusElementId: about || null, sceneId }); setAsk(''); setLastSuggestions(r.suggestions); await load(); }
    catch (er) { setError((er as Error).message); await load(); }
    finally { setThinking(false); }
  }

  const load = useCallback(() => api.get(`/api/conversations/${id}`).then(setData).catch((e) => setError(e.message)), [id]);
  // Arriving from Search: bring the found message into view and mark it.
  const [found, setFound] = useState<string | null>(() => { try { const t = sessionStorage.getItem('ns-conv-turn'); sessionStorage.removeItem('ns-conv-turn'); return t; } catch { return null; } });
  useEffect(() => {
    if (!found || !data) return;
    const t = data.turns.find((x: any) => x.id === found);
    if (t && turnRole(t) === 'behind' && !showBehind) { setShowBehind(true); return; }
    const el = document.querySelector(`[data-turn="${found}"]`);
    if (el) el.closest('section')?.scrollIntoView({ block: 'center' });
  }, [found, data, showBehind]);
  useEffect(() => {
    void load();
    api.get(`/api/projects/${ctx.projectId}/elements`).then((e) => setAll(e.filter((x: any) => !['thought', 'guardrail'].includes(x.kind)))).catch(() => {});
    api.get(`/api/projects/${ctx.projectId}/kinds`).then(setKinds).catch(() => {});
  }, [load, ctx.projectId]);
  useEffect(() => {
    const el = all.find((x) => x.id === target.elementId);
    if (!el) { setFields([]); return; }
    api.get(`/api/projects/${ctx.projectId}/fields?kind=${encodeURIComponent(el.kind)}`).then(setFields).catch(() => setFields([]));
  }, [target.elementId, all, ctx.projectId]);

  function onMouseUp() {
    const s = window.getSelection();
    if (!s || s.isCollapsed || !s.rangeCount) { return; }
    const r = s.getRangeAt(0);
    const box = (r.startContainer.parentElement?.closest('[data-turn]') as HTMLElement | null);
    const box2 = (r.endContainer.parentElement?.closest('[data-turn]') as HTMLElement | null);
    if (!box || box !== box2) { setSel(null); return; }
    // Offsets count every stored character, hidden citation markers included, so they always point into the exact text.
    const off = (node: Node, o: number) => { const x = document.createRange(); x.setStart(box, 0); x.setEnd(node, o); return x.toString().length; };
    const start = off(r.startContainer, r.startOffset), end = off(r.endContainer, r.endOffset);
    if (end <= start) return;
    const turn = data.turns.find((t: any) => t.id === box.dataset.turn);
    setSel({ turnId: box.dataset.turn!, start, end, quote: (turn.text as string).slice(start, end) });
  }

  async function act(path: string, body: Record<string, unknown>) {
    if (!sel) return;
    try { await api.post(`/api/turns/${sel.turnId}/${path}`, { start: sel.start, end: sel.end, ...body }); setSel(null); setNote(''); setAsPossibility(false); window.getSelection()?.removeAllRanges(); await load(); }
    catch (e) { setError((e as Error).message); }
  }
  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!msg.trim()) return;
    try { await api.post(`/api/conversations/${id}/turns`, { speaker_kind: speaker, speaker_name: speaker === 'author' ? (ctx.settings.authorName || 'You') : 'AI', text: msg }); setMsg(''); await load(); }
    catch (er) { setError((er as Error).message); }
  }

  const marksByTurn = useMemo(() => {
    const m: Record<string, any[]> = {};
    for (const k of data?.marks ?? []) (m[k.turn_id] ??= []).push(k);
    return m;
  }, [data]);
  const roles = useMemo(() => new Map<string, ReturnType<typeof turnRole>>((data?.turns ?? []).map((t: any) => [t.id, turnRole(t)])), [data]);
  const behindCount = [...roles.values()].filter((r) => r === 'behind').length;
  const talkCount = [...roles.values()].filter((r) => r === 'talk').length;

  if (!data) return <div className="content muted">{error || 'Opening…'}</div>;
  if (harvest) return <Harvest ctx={ctx} h={harvest} onBack={() => setHarvest(null)} onDone={async () => { await api.post(`/api/conversations/${id}/harvested`); onBack(); }} />;

  const markLabel: Record<string, string> = { keep: 'Kept', possibility: 'Possibility', question: 'Question', idea: 'Idea', not_canon: 'Not canon' };
  const who = (t: any) => speakerLabel(t.speaker_name) || (t.speaker_kind === 'author' ? 'You' : t.speaker_kind === 'assistant' ? 'Collaborator' : 'Pasted text');
  const linkTo = target.elementId ? [target.elementId] : [];
  const questionsRaised = lastSuggestions.filter((s) => s.kind === 'question').length;
  const otherSuggestions = lastSuggestions.length - questionsRaised;
  return (
    <div className="scroll" onMouseUp={onMouseUp}><div className="content conversation" style={{ maxWidth: 860, paddingBottom: sel ? '14rem' : undefined }}>
      <div className="row"><button className="btn link small" onClick={onBack}>All conversations</button><span className="grow" /><button className="btn" onClick={() => void api.get(`/api/conversations/${id}/harvest`).then(setHarvest)}>Harvest</button></div>
      <h1>{data.conversation.title}</h1>
      <p className="muted small">{talkCount} message{talkCount === 1 ? '' : 's'}, kept word for word. Select any words to keep them, explore them, or mark them not canon.</p>
      {behindCount > 0 && (
        <p className="muted small" role="note">
          {behindCount} behind-the-scenes step{behindCount === 1 ? '' : 's'} (tools, code and the app's notes to itself) {behindCount === 1 ? 'is' : 'are'} kept too, {showBehind ? 'shown faintly' : 'out of sight'}, because {behindCount === 1 ? 'it is' : 'they are'} not conversation.{' '}
          <button className="btn link small" aria-pressed={showBehind} onClick={() => setShowBehind((v) => !v)}>{showBehind ? 'Hide them' : 'Show them'}</button>
        </p>
      )}
      {error && <div className="notice error" role="alert">{error}</div>}
      {data.turns.map((t: any) => {
        const role = roles.get(t.id);
        if (role === 'behind' && !showBehind) return null;
        const marks = marksByTurn[t.id] ?? [];
        const continued = role === 'continued';
        return (
          <section key={t.id} className={'section turn' + (found === t.id ? ' found' : '') + (continued ? ' continued' : '') + (role === 'behind' ? ' behind' : '')} aria-label={`Message ${t.position}`} onClick={() => found === t.id && setFound(null)}>
            {continued
              ? <div className="turn-heading">{continuedHeading(t.speaker_name)}</div>
              : <div className="small muted turn-who">{role === 'behind' ? `Behind the scenes: ${t.speaker_name}` : who(t)}, <span className="turn-when">{when(t.said_at)}</span></div>}
            <div data-turn={t.id} className="turn-text" style={{ whiteSpace: 'pre-wrap', fontFamily: t.speaker_kind === 'author' ? 'var(--prose)' : 'var(--ui)', lineHeight: 1.65, borderLeft: t.speaker_kind === 'author' ? '3px solid var(--yours)' : '3px solid var(--line)', paddingLeft: '0.75rem', marginTop: '0.25rem' }}>{renderText(t.text, marks)}</div>
            {marks.length > 0 && (
              <div className="row small" style={{ marginTop: '0.3rem' }}>
                {marks.map((m: any) => <span key={m.id} className="chip" title={m.quote}>{markLabel[m.kind]}: {m.quote.slice(0, 40)}{m.quote.length > 40 ? '…' : ''} <button className="btn link small" aria-label="Remove mark" onClick={() => void api.del(`/api/marks/${m.id}`).then(load)}>×</button></span>)}
              </div>
            )}
          </section>
        );
      })}
      {aiStatus?.enabled && aiStatus?.keySet ? (
        <form onSubmit={askIt} className="section ask-form" aria-label="Ask the collaborator">
          <h2>Ask the collaborator</h2>
          <div className="cols ask-modes" role="radiogroup" aria-label="How should it help">
            {MODES.map(([k, label, hint]) => (
              <label key={k} className="choice">
                <input type="radio" name="mode" checked={mode === k} onChange={() => setMode(k)} aria-labelledby={`mode-${k}`} aria-describedby={`mode-${k}-d`} />
                <span><strong id={`mode-${k}`}>{label}</strong><small id={`mode-${k}-d`}>{hint}</small></span>
              </label>
            ))}
          </div>
          <div className="row small ask-presets"><span className="muted">Start from:</span>{PRESETS.map(([label, m, text]) => <button key={label} type="button" className="btn link small" onClick={() => { setMode(m); setAsk(text); }}>{label}</button>)}</div>
          <label className="field"><span>Your question</span><textarea rows={3} aria-label="Ask the collaborator" value={ask} onChange={(e) => setAsk(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) void askIt(e as unknown as React.FormEvent); }} /></label>
          <div className="row small">
            <select value={about} onChange={(e) => setAbout(e.target.value)} style={{ maxWidth: 300 }} aria-label="Focus on"><option value="">Focus on… (optional)</option><RecordOptions all={all} kinds={kinds} /></select>
            <span className="grow" />
            <button className="btn write" type="submit" disabled={thinking || !ask.trim()}>{thinking ? 'Thinking…' : 'Ask'}</button>
          </div>
          {lastSuggestions.length > 0 && (
            <div className="notice small" role="status">
              {lastSuggestions.length === 1 ? 'One suggestion is' : `${lastSuggestions.length} suggestions are`} waiting for you. Nothing was decided.{' '}
              <button type="button" className="btn link small" onClick={() => openBrain(ctx, 'suggestions')}>Look at {lastSuggestions.length === 1 ? 'it' : 'them'} in Suggestions waiting</button>
            </div>
          )}
        </form>
      ) : (
        <p className="small muted section">The collaborator is {aiStatus?.keySet ? 'off for this novel' : 'not set up'}. <button className="btn link small" onClick={() => { openAtPage(`settings:${ctx.projectId}`, 3); ctx.go('settings'); }}>Turn it on in Settings</button> when you are ready. Nothing is sent anywhere until you do.</p>
      )}
      <form onSubmit={send} className="section">
        <label className="field"><span>Add a message from elsewhere</span><textarea rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} /></label>
        <p className="small muted" style={{ margin: '0 0 0.4rem' }}>Paste something said in another chat, an email or a note, so it sits in this conversation, word for word.</p>
        <div className="row small"><label className="row"><input type="radio" name="speaker" checked={speaker === 'author'} onChange={() => setSpeaker('author')} />From me</label><label className="row"><input type="radio" name="speaker" checked={speaker === 'assistant'} onChange={() => setSpeaker('assistant')} />From an AI, such as ChatGPT</label><button className="btn" type="submit">Add</button></div>
      </form>

      {sel && (
        <div role="toolbar" aria-label="What to do with the selected words" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, background: 'var(--page)', borderTop: '1px solid var(--line-strong)', padding: '0.75rem 1rem', zIndex: 10 }}>
          <div className="content" style={{ padding: 0, maxWidth: 860 }}>
            <div className="small muted" style={{ marginBottom: '0.4rem' }}>"{withoutMarkers(sel.quote.length > 160 ? sel.quote.slice(0, 157) + '…' : sel.quote)}"</div>
            <div className="row">
              <button className="btn write" onClick={() => void act('keep', { linkTo })}>Keep this line</button>
              <button className="btn" onClick={() => void act('capture', { kind: 'question', linkTo })}>It's a question</button>
              <button className="btn" onClick={() => void act('capture', { kind: 'idea', linkTo })}>It's an idea</button>
              <button className="btn" aria-pressed={asPossibility} onClick={() => setAsPossibility((v) => !v)}>Add as a possibility</button>
              <button className="btn" onClick={() => void act('not-canon', { note })}>Not canon</button>
              <button className="btn link" onClick={() => { setSel(null); setAsPossibility(false); }}>Cancel</button>
            </div>
            <div className="row small" style={{ marginTop: '0.5rem' }}>
              <span className="muted">{asPossibility ? 'Add it in pencil to' : 'Link it to a record (optional)'}</span>
              <select value={target.elementId} onChange={(e) => setTarget({ elementId: e.target.value, field: '' })} style={{ maxWidth: 260 }} aria-label={asPossibility ? 'Which record' : 'Link it to a record'}>
                <option value="">{asPossibility ? 'Which record…' : 'No record'}</option><RecordOptions all={all} kinds={kinds} />
              </select>
              {asPossibility && (
                <>
                  <select value={target.field} disabled={!target.elementId} onChange={(e) => setTarget({ ...target, field: e.target.value })} style={{ maxWidth: 240 }} aria-label="Field">
                    <option value="">Which part…</option>{fields.map((f) => <option key={f.field} value={f.field}>{f.group}: {f.label}</option>)}
                  </select>
                  <button className="btn write" disabled={!target.elementId || !target.field} onClick={() => void act('possibility', { elementId: target.elementId, field: target.field })}>Add it</button>
                </>
              )}
            </div>
            <p className="small faint" style={{ margin: '0.35rem 0 0' }}>{asPossibility ? 'A possibility is a maybe written on that record, linked back to these words. Nothing is decided.' : 'Linked, it also shows on that record, so you find it where you work.'}</p>
          </div>
        </div>
      )}
    </div></div>
  );
}

const MODES: [string, string, string][] = [
  ['discuss', 'Talk it through', 'A creative partner who asks one question at a time.'],
  ['teach', 'Teach it', 'A full explanation, with examples that work and examples that do not.'],
  ['show', 'Show it', 'Two or three examples, each labeled "One way it could be done."'],
  ['hand', 'Hand it to me', 'What is decided and what is open, then the writing comes back to you.'],
  ['critique', 'Critique', 'An honest read: what works, what does not yet, and why.'],
  ['resources', 'Where to learn more', 'Books and teachers to look up, starting with your own shelf.'],
];

// Interpretive questions the program cannot check by itself; the answer is interpretation, labeled as such.
const PRESETS: [string, string, string][] = [
  ['Does this cause and effect convince?', 'critique', 'Look at the cause and effect around this. Where is a link only asserted, not earned? Separate what the records say from your interpretation.'],
  ['Does what happens surprise the character?', 'critique', 'Where does what the character expects to happen part from what actually happens? Is that surprise big enough to matter?'],
  ['Is this character deep enough?', 'critique', 'Question this character the way a demanding editor would: want versus need, the Lie, contradictions, what they would never do. Ask; do not fill in answers.'],
  ['Do these voices sound different?', 'critique', 'Compare how these characters speak and think. Where would a reader confuse them?'],
  ['Does the comedy escalate?', 'critique', 'Does each comic beat raise the stakes for the character, or does it repeat? Where could it build?'],
];

/**
 * A stored message, shown: her marks highlighted, and an app's own citation markers left in the page but not shown.
 * Every stored character stays in the page, so selecting words always maps to the exact stored text.
 */
function renderText(text: string, marks: any[]) {
  const hide = markerRanges(text);
  const piece = (s: number, e: number, key: string): React.ReactNode[] => {
    const out: React.ReactNode[] = [];
    let pos = s;
    for (const [hs, he] of hide) {
      if (he <= pos || hs >= e) continue;
      const a = Math.max(hs, pos), b = Math.min(he, e);
      if (a > pos) out.push(text.slice(pos, a));
      out.push(<span key={`${key}-h${a}`} className="cite-marker" aria-hidden="true" style={{ display: 'none' }}>{text.slice(a, b)}</span>);
      pos = b;
    }
    if (pos < e) out.push(text.slice(pos, e));
    return out;
  };
  if (!marks.length && !hide.length) return text;
  const sorted = [...marks].sort((a, b) => a.start_offset - b.start_offset);
  const out: React.ReactNode[] = [];
  let pos = 0;
  for (const m of sorted) {
    if (m.start_offset < pos) continue;
    out.push(...piece(pos, m.start_offset, `p${pos}`));
    out.push(<mark key={m.id} data-kind={m.kind} style={{ background: m.kind === 'not_canon' ? 'transparent' : 'rgba(255,107,53,0.22)', textDecoration: m.kind === 'not_canon' ? 'line-through' : undefined, color: 'inherit' }}>{piece(m.start_offset, m.end_offset, m.id)}</mark>);
    pos = m.end_offset;
  }
  out.push(...piece(pos, text.length, `p${pos}`));
  return out;
}

const joinNames = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

function Harvest({ ctx, h, onBack, onDone }: { ctx: Ctx; h: any; onBack: () => void; onDone: () => Promise<void> }) {
  const Section = ({ title, about, items, render }: { title: string; about?: string; items: any[]; render: (x: any) => React.ReactNode }) => (
    <section className="section harvest-section"><h2>{title}</h2>{about && <p className="small muted harvest-about">{about}</p>}{items.length === 0 ? <p className="muted small">None.</p> : <ul className="list">{items.map((x, i) => <li key={x.id ?? i}>{render(x)}</li>)}</ul>}</section>
  );
  const questions = [...h.questions.map((m: any) => ({ id: m.id, text: m.quote, raised: false })), ...(h.raised ?? []).map((q: any) => ({ id: q.id, text: q.text, raised: true }))];
  return (
    <div className="scroll"><div className="content harvest">
      <button className="btn link small" onClick={onBack}>Back to the conversation</button>
      <h1>Harvest: {h.conversation.title}</h1>
      <p className="muted">{h.turnCount} messages between {joinNames(h.speakers)}. The full conversation stays saved word for word. Nothing here was decided for you.</p>
      <p className="harvest-what">The harvest gathers what you caught in this conversation: lines you kept, possibilities, questions, ideas and what you set aside as not canon, plus anything the collaborator left for you. To catch more, go back and select words in any message.</p>
      <Section title="Lines you kept" items={h.kept} render={(m) => <span className="st" data-s="established" style={{ whiteSpace: 'pre-wrap' }}>{withoutMarkers(m.quote)}</span>} />
      <Section title="Possibilities" items={h.statements} render={(s) => <span className="st" data-s={s.status}>{s.element_title}, {String(s.field).replace(/^x_/, '').replace(/_/g, ' ')}: {valueText(s.value)} <span className="faint small">({statusWord(ctx.settings, s.status)}{s.speaker_kind === 'assistant' ? `, ${speakerLabel(s.speaker_name) || 'the collaborator'} said it` : ''})</span></span>} />
      <Section title="New questions" items={questions} render={(q) => <span className="st" data-s="unanswered">{withoutMarkers(q.text)}{q.raised && <span className="faint small"> (the collaborator raised it; it waits in Questions and ideas)</span>}</span>} />
      <Section title="New ideas" items={h.ideas} render={(m) => <span className="st" data-s="developing">{withoutMarkers(m.quote)}</span>} />
      <Section title="Not canon" items={h.notCanon} render={(m) => <span className="faint" style={{ textDecoration: 'line-through' }}>{withoutMarkers(m.quote)}</span>} />
      <Section title="What this touches" about="The characters, scenes and other records that what you caught is linked to, and the record this conversation was about. These are the places to look next." items={h.implicated} render={(e) => <span>{e.title} <span className="faint small">({String(e.kind).replace(/_/g, ' ')})</span></span>} />
      {h.pendingSuggestions.length > 0 && <Section title="Suggestions still waiting" items={h.pendingSuggestions} render={(p) => <span className="st" data-s="proposed">{valueText(p.after?.value ?? p.after)}</span>} />}
      <div className="row harvest-done"><button className="btn write" onClick={() => void onDone().then(() => window.dispatchEvent(new Event('ns-return-to-writing')))}>Done, back to writing</button><button className="btn" onClick={() => void onDone()}>Done, back to conversations</button></div>
    </div></div>
  );
}
