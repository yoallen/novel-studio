import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';
import { aiName } from '../core/io/chat-exports';
import { RefText } from './RefText';

// Questions I Have, Things and Ideas I'm Thinking About, and the capture inbox (R-A-047 to R-A-050).
// Set aside means kept, never deleted. Questions the assistant raised wait apart from hers until she
// adopts them, so nothing is filed under her name that she did not ask (R-A-029).
const GROUPS = [
  { kind: 'question', title: 'Questions I have', short: 'Questions', states: [['open', 'Open'], ['answered', 'Answered'], ['not_relevant', 'No longer relevant']] },
  { kind: 'idea', title: "Things and ideas I'm thinking about", short: 'Ideas', states: [['considering', 'Considering'], ['adopted', 'Adopted'], ['set_aside', 'Set aside']] },
  { kind: 'thought', title: 'Captured thoughts', short: 'Captured thoughts', states: [['inbox', 'Not filed yet'], ['filed', 'Filed']] },
] as const;

export function NotesView({ ctx, embedded, onOpen }: { ctx: Ctx; embedded?: boolean; onOpen?: (id: string) => void }) {
  const [items, setItems] = useState<Record<string, any[]>>({});
  const [show, setShow] = useState<Record<string, string>>({ question: 'open', idea: 'considering', thought: 'inbox' });
  const [error, setError] = useState('');
  // Answering a question: the answer is written right where she marks it answered.
  const [answering, setAnswering] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');

  const load = useCallback(async () => {
    try {
      const out: Record<string, any[]> = {};
      for (const g of GROUPS) out[g.kind] = (await api.get(`/api/projects/${ctx.projectId}/elements?kind=${g.kind}`)).map((e: any) => ({ ...e, attrs: JSON.parse(e.attrs_json || '{}') }));
      setItems(out);
    } catch (e) { setError((e as Error).message); }
  }, [ctx.projectId]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { const f = () => void load(); window.addEventListener('ns-captured', f); return () => window.removeEventListener('ns-captured', f); }, [load]);

  async function run(p: Promise<unknown>) { try { await p; await load(); } catch (e) { setError((e as Error).message); } }
  const suggested = (items.question ?? []).filter((q) => q.attrs.suggested && q.state === 'open');
  async function markAnswered(n: any) {
    const text = answer.trim();
    // With an answer, it is kept as decided on the question (which moves it to Answered); without one, it simply moves.
    if (text) await run(api.post(`/api/elements/${n.id}/statements`, { field: 'answer', value: text, status: 'established' }));
    await run(api.patch(`/api/elements/${n.id}`, { state: 'answered' }));
    setAnswering(null); setAnswer('');
  }
  const jump = (kind: string) => document.getElementById(`notes-${kind}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const body = (
    <>
      <h1>Questions and ideas</h1>
      <nav className="jump-list" aria-label="On this page">
        <span className="jump-head">On this page</span>
        {GROUPS.map((g) => <a key={g.kind} href={`#notes-${g.kind}`} onClick={(e) => { e.preventDefault(); jump(g.kind); }}>{g.short} ({(items[g.kind] ?? []).filter((x) => !x.attrs.suggested).length})</a>)}
        {suggested.length > 0 && <a href="#notes-suggested" onClick={(e) => { e.preventDefault(); document.getElementById('notes-suggested')?.scrollIntoView({ behavior: 'smooth' }); }}>Raised by the assistant ({suggested.length})</a>}
      </nav>
      {error && <div className="notice error">{error}</div>}
      {GROUPS.map((g) => {
        const all = (items[g.kind] ?? []).filter((x) => !x.attrs.suggested);
        const list = all.filter((x) => x.state === show[g.kind]);
        return (
          <section key={g.kind} id={`notes-${g.kind}`} className="notes-group">
            <h2>{g.title}</h2>
            <div className="row" role="tablist" style={{ marginBottom: '0.5rem' }}>
              {g.states.map(([k, label]) => (
                <button key={k} role="tab" aria-selected={show[g.kind] === k} className={'btn small' + (show[g.kind] === k ? '' : ' link')} onClick={() => setShow({ ...show, [g.kind]: k })}>
                  {label} ({all.filter((x) => x.state === k).length})
                </button>
              ))}
            </div>
            {list.length === 0 ? <p className="muted small">Nothing here.</p> : (
              <ul className="list">
                {list.map((n) => (
                  <li key={n.id}>
                    <div className="st" data-s={g.kind === 'question' && n.state === 'open' ? 'unanswered' : n.state === 'adopted' || n.state === 'answered' ? 'established' : 'developing'} style={{ whiteSpace: 'pre-wrap' }}>
                      {onOpen ? <button className="btn link" style={{ textAlign: 'left', whiteSpace: 'pre-wrap' }} onClick={() => onOpen(n.id)}><RefText text={n.body || n.title} inert /></button> : <RefText text={n.body || n.title} projectId={ctx.projectId} />}
                    </div>
                    <div className="row small" style={{ marginTop: '0.3rem' }}>
                      <span className="faint">{new Date(n.created_at).toLocaleDateString()}{n.attrs.urgency === 'now' ? ', needed to keep writing' : ''}{n.attrs.origin === 'assistant' ? `, from a conversation (${aiName(n.attrs.origin_name)})` : n.attrs.conversation_id ? ', from a conversation' : ''}</span>
                      {g.states.filter(([k]) => k !== n.state).map(([k, label]) => <button key={k} className="btn small" aria-expanded={g.kind === 'question' && k === 'answered' ? answering === n.id : undefined}
                        onClick={() => { if (g.kind === 'question' && k === 'answered') { setAnswering(answering === n.id ? null : n.id); setAnswer(''); } else void run(api.patch(`/api/elements/${n.id}`, { state: k })); }}>{label}</button>)}
                      {g.kind === 'question' && answering === n.id && (
                        <form className="answer-form" onSubmit={(e) => { e.preventDefault(); void markAnswered(n); }}>
                          <label className="field"><span>The answer</span><textarea rows={2} autoFocus value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Optional. It is kept on the question as decided." /></label>
                          <div className="row"><button className="btn small write" type="submit">Mark answered</button><button className="btn link small" type="button" onClick={() => setAnswering(null)}>Cancel</button></div>
                        </form>
                      )}
                      {g.kind === 'thought' && <><button className="btn small" onClick={() => void run(api.post(`/api/elements/${n.id}/refile`, { kind: 'question' }))}>Make it a question</button><button className="btn small" onClick={() => void run(api.post(`/api/elements/${n.id}/refile`, { kind: 'idea' }))}>Make it an idea</button></>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
      {suggested.length > 0 && (
        <section id="notes-suggested" className="notes-group">
          <h2>Questions an AI raised</h2>
          <p className="muted small">From the collaborator, or from a chat you brought in. These are not yours until you adopt them.</p>
          <ul className="list">
            {suggested.map((n) => (
              <li key={n.id}>
                <div className="st" data-s="proposed" style={{ whiteSpace: 'pre-wrap' }}>{n.body || n.title}</div>
                <div className="row small" style={{ marginTop: '0.3rem' }}>
                  <button className="btn small" onClick={() => void run(api.patch(`/api/elements/${n.id}`, { attrs: { suggested: false, adopted_by: 'author' } }))}>Make it one of my questions</button>
                  <button className="btn small" onClick={() => void run(api.patch(`/api/elements/${n.id}`, { state: 'not_relevant' }))}>Not relevant</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
  return embedded ? body : <div className="scroll"><div className="content">{body}</div></div>;
}
