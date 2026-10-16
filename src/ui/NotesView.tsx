import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';

// Questions I Have, Things and Ideas I'm Thinking About, and the capture inbox.
// Set aside means kept, never deleted. The full Story Brain builds on this.
const GROUPS = [
  { kind: 'question', title: 'Questions I have', states: [['open', 'Open'], ['answered', 'Answered'], ['not_relevant', 'No longer relevant']] },
  { kind: 'idea', title: "Things and ideas I'm thinking about", states: [['considering', 'Considering'], ['adopted', 'Adopted'], ['set_aside', 'Set aside']] },
  { kind: 'thought', title: 'Captured thoughts', states: [['inbox', 'Not filed yet'], ['filed', 'Filed']] },
] as const;

export function NotesView({ ctx }: { ctx: Ctx }) {
  const [items, setItems] = useState<Record<string, any[]>>({});
  const [show, setShow] = useState<Record<string, string>>({ question: 'open', idea: 'considering', thought: 'inbox' });
  const [error, setError] = useState('');
  const [newChar, setNewChar] = useState('');
  const [chars, setChars] = useState<any[]>([]);

  const load = useCallback(async () => {
    try {
      const out: Record<string, any[]> = {};
      for (const g of GROUPS) out[g.kind] = await api.get(`/api/projects/${ctx.projectId}/elements?kind=${g.kind}`);
      setItems(out);
      setChars(await api.get(`/api/projects/${ctx.projectId}/elements?kind=character`));
    } catch (e) { setError((e as Error).message); }
  }, [ctx.projectId]);
  useEffect(() => { void load(); }, [load]);

  async function setState(id: string, state: string) { await api.patch(`/api/elements/${id}`, { state }).catch((e) => setError(e.message)); await load(); }
  async function refile(id: string, kind: string) { await api.post(`/api/elements/${id}/refile`, { kind }).catch((e) => setError(e.message)); await load(); }
  async function addChar(e: React.FormEvent) { e.preventDefault(); if (!newChar.trim()) return; await api.post(`/api/projects/${ctx.projectId}/elements`, { kind: 'character', title: newChar }).catch((er) => setError(er.message)); setNewChar(''); await load(); }

  return (
    <div className="scroll"><div className="content">
      <h1>Questions and ideas</h1>
      {error && <div className="notice error">{error}</div>}
      {GROUPS.map((g) => {
        const list = (items[g.kind] ?? []).filter((x) => x.state === show[g.kind]);
        return (
          <section key={g.kind} style={{ marginBottom: '2rem' }}>
            <h2>{g.title}</h2>
            <div className="row" role="tablist" style={{ marginBottom: '0.5rem' }}>
              {g.states.map(([k, label]) => (
                <button key={k} role="tab" aria-selected={show[g.kind] === k} className={'btn small' + (show[g.kind] === k ? '' : ' link')} onClick={() => setShow({ ...show, [g.kind]: k })}>
                  {label} ({(items[g.kind] ?? []).filter((x) => x.state === k).length})
                </button>
              ))}
            </div>
            {list.length === 0 ? <p className="muted small">Nothing here.</p> : (
              <ul className="list">
                {list.map((n) => (
                  <li key={n.id}>
                    <div className="st" data-s={g.kind === 'question' && n.state === 'open' ? 'unanswered' : n.state === 'adopted' || n.state === 'answered' ? 'established' : 'developing'} style={{ whiteSpace: 'pre-wrap' }}>{n.body || n.title}</div>
                    <div className="row small" style={{ marginTop: '0.3rem' }}>
                      <span className="faint">{new Date(n.created_at).toLocaleDateString()}</span>
                      {g.states.filter(([k]) => k !== n.state).map(([k, label]) => <button key={k} className="btn small" onClick={() => void setState(n.id, k)}>{label}</button>)}
                      {g.kind === 'thought' && <><button className="btn small" onClick={() => void refile(n.id, 'question')}>Make it a question</button><button className="btn small" onClick={() => void refile(n.id, 'idea')}>Make it an idea</button></>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
      <section>
        <h2>Characters</h2>
        <p className="muted small">A name is enough to start. Everything else about them comes later, in your words.</p>
        <ul className="list">{chars.map((c) => <li key={c.id}>{c.title}</li>)}</ul>
        <form className="row" onSubmit={addChar} style={{ marginTop: '0.5rem' }}><input type="text" value={newChar} onChange={(e) => setNewChar(e.target.value)} aria-label="New character name" style={{ maxWidth: 320 }} /><button className="btn" type="submit">Add character</button></form>
      </section>
    </div></div>
  );
}
