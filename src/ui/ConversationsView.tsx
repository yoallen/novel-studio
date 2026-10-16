import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';
import { when, valueText, statusWord } from './status';

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
            {report.complete ? 'Everything was kept.' : 'Some text may not have been kept. Check the conversation before relying on it.'} {report.turnsStored} messages ({report.byAuthor} from you), {report.charactersKept.toLocaleString()} characters, read as {report.format}.
          </div>
          <button className="btn write" onClick={() => onDone(report.conversation.id)}>Open it</button>
        </>
      )}
    </div></div>
  );
}

type Sel = { turnId: string; start: number; end: number; quote: string };

function Conversation({ ctx, id, onBack }: { ctx: Ctx; id: string; onBack: () => void }) {
  const [data, setData] = useState<any>(null);
  const [sel, setSel] = useState<Sel | null>(null);
  const [harvest, setHarvest] = useState<any>(null);
  const [error, setError] = useState('');
  const [all, setAll] = useState<any[]>([]);
  const [target, setTarget] = useState<{ elementId: string; field: string }>({ elementId: '', field: '' });
  const [fields, setFields] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [speaker, setSpeaker] = useState<'author' | 'assistant'>('author');
  const [note, setNote] = useState('');
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [ask, setAsk] = useState('');
  const [mode, setMode] = useState<string>('discuss');
  const [about, setAbout] = useState('');
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
  useEffect(() => { void load(); api.get(`/api/projects/${ctx.projectId}/elements`).then((e) => setAll(e.filter((x: any) => !['thought', 'guardrail'].includes(x.kind)))).catch(() => {}); }, [load, ctx.projectId]);
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
    const off = (node: Node, o: number) => { const x = document.createRange(); x.setStart(box, 0); x.setEnd(node, o); return x.toString().length; };
    const start = off(r.startContainer, r.startOffset), end = off(r.endContainer, r.endOffset);
    if (end <= start) return;
    const turn = data.turns.find((t: any) => t.id === box.dataset.turn);
    setSel({ turnId: box.dataset.turn!, start, end, quote: (turn.text as string).slice(start, end) });
  }

  async function act(path: string, body: Record<string, unknown>) {
    if (!sel) return;
    try { await api.post(`/api/turns/${sel.turnId}/${path}`, { start: sel.start, end: sel.end, ...body }); setSel(null); setNote(''); window.getSelection()?.removeAllRanges(); await load(); }
    catch (e) { setError((e as Error).message); }
  }
  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!msg.trim()) return;
    try { await api.post(`/api/conversations/${id}/turns`, { speaker_kind: speaker, speaker_name: speaker === 'author' ? (ctx.settings.authorName || 'You') : 'Assistant', text: msg }); setMsg(''); await load(); }
    catch (er) { setError((er as Error).message); }
  }

  const marksByTurn = useMemo(() => {
    const m: Record<string, any[]> = {};
    for (const k of data?.marks ?? []) (m[k.turn_id] ??= []).push(k);
    return m;
  }, [data]);

  if (!data) return <div className="content muted">{error || 'Opening…'}</div>;
  if (harvest) return <Harvest ctx={ctx} h={harvest} onBack={() => setHarvest(null)} onDone={async () => { await api.post(`/api/conversations/${id}/harvested`); onBack(); }} />;

  const markLabel: Record<string, string> = { keep: 'Kept', possibility: 'Possibility', question: 'Question', idea: 'Idea', not_canon: 'Not canon' };
  return (
    <div className="scroll" onMouseUp={onMouseUp}><div className="content" style={{ maxWidth: 860, paddingBottom: sel ? '14rem' : undefined }}>
      <div className="row"><button className="btn link small" onClick={onBack}>All conversations</button><span className="grow" /><button className="btn" onClick={() => void api.get(`/api/conversations/${id}/harvest`).then(setHarvest)}>Harvest</button></div>
      <h1>{data.conversation.title}</h1>
      <p className="muted small">{data.turns.length} messages, kept word for word. Select any words to keep them, explore them, or mark them not canon.</p>
      {error && <div className="notice error" role="alert">{error}</div>}
      {data.turns.map((t: any) => (
        <section key={t.id} className="section" aria-label={`Message ${t.position}`}>
          <div className="small muted">{t.speaker_name || (t.speaker_kind === 'author' ? 'You' : 'Assistant')}, {when(t.said_at)}</div>
          <div data-turn={t.id} style={{ whiteSpace: 'pre-wrap', fontFamily: t.speaker_kind === 'author' ? 'var(--prose)' : 'var(--ui)', lineHeight: 1.65, borderLeft: t.speaker_kind === 'author' ? '3px solid var(--yours)' : '3px solid var(--line)', paddingLeft: '0.75rem', marginTop: '0.25rem' }}>{withMarks(t.text, marksByTurn[t.id] ?? [])}</div>
          {(marksByTurn[t.id] ?? []).length > 0 && (
            <div className="row small" style={{ marginTop: '0.3rem' }}>
              {(marksByTurn[t.id] ?? []).map((m: any) => <span key={m.id} className="chip" title={m.quote}>{markLabel[m.kind]}: {m.quote.slice(0, 40)}{m.quote.length > 40 ? '…' : ''} <button className="btn link small" aria-label="Remove mark" onClick={() => void api.del(`/api/marks/${m.id}`).then(load)}>×</button></span>)}
            </div>
          )}
        </section>
      ))}
      {aiStatus?.enabled && aiStatus?.keySet ? (
        <form onSubmit={askIt} className="section" aria-label="Ask the collaborator">
          <div className="row small" role="radiogroup" aria-label="How should it help">
            {MODES.map(([k, label, hint]) => <label key={k} className="row" title={hint}><input type="radio" name="mode" checked={mode === k} onChange={() => setMode(k)} />{label}</label>)}
          </div>
          <div className="row small"><span className="muted">Start from:</span>{PRESETS.map(([label, m, text]) => <button key={label} type="button" className="btn link small" onClick={() => { setMode(m); setAsk(text); }}>{label}</button>)}</div>
          <label className="field"><span>Ask the collaborator</span><textarea rows={3} value={ask} onChange={(e) => setAsk(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) void askIt(e as unknown as React.FormEvent); }} /></label>
          <div className="row small">
            <select value={about} onChange={(e) => setAbout(e.target.value)} style={{ maxWidth: 260 }} aria-label="Focus on"><option value="">Focus on… (optional)</option>{all.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}</select>
            <span className="grow" />
            <button className="btn write" type="submit" disabled={thinking || !ask.trim()}>{thinking ? 'Thinking…' : 'Ask'}</button>
          </div>
          {lastSuggestions.length > 0 && <div className="notice small" role="status">{lastSuggestions.length === 1 ? 'One suggestion is' : `${lastSuggestions.length} suggestions are`} waiting for you. Nothing was decided. <button type="button" className="btn link small" onClick={() => ctx.go('brain')}>Look at them in the Story Brain</button></div>}
        </form>
      ) : (
        <p className="small muted section">The collaborator is {aiStatus?.keySet ? 'off for this novel' : 'not set up'}. <button className="btn link small" onClick={() => ctx.go('settings')}>Turn it on in Settings</button> when you are ready. Nothing is sent anywhere until you do.</p>
      )}
      <form onSubmit={send} className="section">
        <label className="field"><span>Add a message from elsewhere</span><textarea rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} /></label>
        <div className="row small"><label className="row"><input type="radio" checked={speaker === 'author'} onChange={() => setSpeaker('author')} />From me</label><label className="row"><input type="radio" checked={speaker === 'assistant'} onChange={() => setSpeaker('assistant')} />From the assistant</label><button className="btn" type="submit">Add</button></div>
      </form>

      {sel && (
        <div role="toolbar" aria-label="What to do with the selected words" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, background: 'var(--page)', borderTop: '1px solid var(--line-strong)', padding: '0.75rem 1rem', zIndex: 10 }}>
          <div className="content" style={{ padding: 0, maxWidth: 860 }}>
            <div className="small muted" style={{ marginBottom: '0.4rem' }}>"{sel.quote.length > 160 ? sel.quote.slice(0, 157) + '…' : sel.quote}"</div>
            <div className="row">
              <button className="btn write" onClick={() => void act('keep', { linkTo: target.elementId ? [target.elementId] : [] })}>Keep this line</button>
              <button className="btn" onClick={() => void act('capture', { kind: 'question', linkTo: target.elementId ? [target.elementId] : [] })}>It's a question</button>
              <button className="btn" onClick={() => void act('capture', { kind: 'idea', linkTo: target.elementId ? [target.elementId] : [] })}>It's an idea</button>
              <button className="btn" onClick={() => void act('not-canon', { note })}>Not canon</button>
              <button className="btn link" onClick={() => setSel(null)}>Cancel</button>
            </div>
            <div className="row small" style={{ marginTop: '0.5rem' }}>
              <select value={target.elementId} onChange={(e) => setTarget({ elementId: e.target.value, field: '' })} style={{ maxWidth: 260 }} aria-label="About">
                <option value="">About… (optional)</option>{all.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}
              </select>
              {target.elementId && (
                <>
                  <select value={target.field} onChange={(e) => setTarget({ ...target, field: e.target.value })} style={{ maxWidth: 240 }} aria-label="Field">
                    <option value="">Which part…</option>{fields.map((f) => <option key={f.field} value={f.field}>{f.group}: {f.label}</option>)}
                  </select>
                  <button className="btn" disabled={!target.field} onClick={() => void act('possibility', { elementId: target.elementId, field: target.field })}>Add as a possibility</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div></div>
  );
}

const MODES: [string, string, string][] = [
  ['discuss', 'Talk it through', 'A creative partner; one question at a time'],
  ['teach', 'Teach it', 'Explain the idea fully, with examples that work and fail'],
  ['show', 'Show it', 'Two or three examples, each labeled One way it could be done'],
  ['hand', 'Hand it to me', 'Set up what is decided and open, then give the writing back to you'],
  ['critique', 'Critique', 'Honest: what works, what does not yet, and why'],
  ['resources', 'Where to learn more', 'Your shelf first; titles and authors only'],
];

// Interpretive questions the program cannot check by itself; the answer is interpretation, labeled as such.
const PRESETS: [string, string, string][] = [
  ['Does this cause and effect convince?', 'critique', 'Look at the cause and effect around this. Where is a link only asserted, not earned? Separate what the records say from your interpretation.'],
  ['Where is the dramatic gap?', 'critique', 'Where does what the character expects to happen part from what actually happens? Is the gap wide enough to matter?'],
  ['Is this character deep enough?', 'critique', 'Question this character the way a demanding editor would: want versus need, the Lie, contradictions, what they would never do. Ask; do not fill in answers.'],
  ['Do these voices sound different?', 'critique', 'Compare how these characters speak and think. Where would a reader confuse them?'],
  ['Does the comedy escalate?', 'critique', 'Does each comic beat raise the stakes for the character, or does it repeat? Where could it build?'],
];

function withMarks(text: string, marks: any[]) {
  if (!marks.length) return text;
  const sorted = [...marks].sort((a, b) => a.start_offset - b.start_offset);
  const out: React.ReactNode[] = [];
  let pos = 0;
  for (const m of sorted) {
    if (m.start_offset < pos) continue;
    out.push(text.slice(pos, m.start_offset));
    out.push(<mark key={m.id} data-kind={m.kind} style={{ background: m.kind === 'not_canon' ? 'transparent' : 'rgba(255,107,53,0.22)', textDecoration: m.kind === 'not_canon' ? 'line-through' : undefined, color: 'inherit' }}>{text.slice(m.start_offset, m.end_offset)}</mark>);
    pos = m.end_offset;
  }
  out.push(text.slice(pos));
  return out;
}

function Harvest({ ctx, h, onBack, onDone }: { ctx: Ctx; h: any; onBack: () => void; onDone: () => Promise<void> }) {
  const Section = ({ title, items, render }: { title: string; items: any[]; render: (x: any) => React.ReactNode }) => (
    <section className="section"><h2>{title}</h2>{items.length === 0 ? <p className="muted small">None.</p> : <ul className="list">{items.map((x, i) => <li key={x.id ?? i}>{render(x)}</li>)}</ul>}</section>
  );
  return (
    <div className="scroll"><div className="content">
      <button className="btn link small" onClick={onBack}>Back to the conversation</button>
      <h1>Harvest: {h.conversation.title}</h1>
      <p className="muted">{h.turnCount} messages between {h.speakers.join(', ')}. The full conversation stays saved word for word. Nothing here was decided for you.</p>
      <Section title="Lines you kept" items={h.kept} render={(m) => <span className="st" data-s="established" style={{ whiteSpace: 'pre-wrap' }}>{m.quote}</span>} />
      <Section title="Possibilities" items={h.statements} render={(s) => <span className="st" data-s={s.status}>{s.element_title}, {String(s.field).replace(/^x_/, '').replace(/_/g, ' ')}: {valueText(s.value)} <span className="faint small">({statusWord(ctx.settings, s.status)}{s.speaker_kind === 'assistant' ? ', the assistant said it' : ''})</span></span>} />
      <Section title="New questions" items={h.questions} render={(m) => <span className="st" data-s="unanswered">{m.quote}</span>} />
      <Section title="New ideas" items={h.ideas} render={(m) => <span className="st" data-s="developing">{m.quote}</span>} />
      <Section title="Not canon" items={h.notCanon} render={(m) => <span className="faint" style={{ textDecoration: 'line-through' }}>{m.quote}</span>} />
      <Section title="What this touches" items={h.implicated} render={(e) => <span>{e.title} <span className="faint small">({String(e.kind).replace(/_/g, ' ')})</span></span>} />
      {h.pendingSuggestions.length > 0 && <Section title="Suggestions still waiting" items={h.pendingSuggestions} render={(p) => <span className="st" data-s="proposed">{valueText(p.after?.value ?? p.after)}</span>} />}
      <div className="row" style={{ marginTop: '1.5rem' }}><button className="btn write" onClick={() => void onDone().then(() => window.dispatchEvent(new Event('ns-return-to-writing')))}>Done, back to writing</button><button className="btn" onClick={() => void onDone()}>Done</button></div>
    </div></div>
  );
}
