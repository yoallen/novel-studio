import { useEffect, useRef, useState } from 'react';
import { api } from './api';

// All novels. A new novel starts from a title and, if she likes, one sentence. No questionnaire (S1-171).
export function Library({ onOpen }: { onOpen: (id: string) => void }) {
  const [projects, setProjects] = useState<any[] | null>(null);
  const [title, setTitle] = useState('');
  const [sentence, setSentence] = useState('');
  const [error, setError] = useState('');
  const [plan, setPlan] = useState<{ archive: unknown; plan: any } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => api.get('/api/projects').then(setProjects).catch((e) => setError(e.message));
  useEffect(() => { void load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('Give the novel a working title. You can change it any time.'); return; }
    try {
      const p = await api.post('/api/projects', { title: title.trim(), profile: sentence.trim() ? { premise_sentence: sentence.trim() } : {} });
      if (sentence.trim()) await api.post(`/api/projects/${p.id}/capture`, { text: sentence.trim(), kind: 'idea' });
      const ch = await api.post(`/api/projects/${p.id}/chapters`, {});
      await api.post(`/api/chapters/${ch.id}/scenes`, {});
      onOpen(p.id);
    } catch (err) { setError((err as Error).message); }
  }

  async function pickArchive(f: File) {
    setError('');
    try {
      const archive = JSON.parse(await f.text());
      const p = await api.post('/api/archive/plan', { archive });
      setPlan({ archive, plan: p });
    } catch (err) { setError(err instanceof SyntaxError ? 'That file is not a Novel Studio archive.' : (err as Error).message); }
  }

  async function doImport(asCopy: boolean) {
    if (!plan) return;
    try {
      const r = await api.post('/api/archive/import', { archive: plan.archive, asCopy });
      setPlan(null); await load();
      if (r.imported) onOpen(r.projectId);
    } catch (err) { setError((err as Error).message); }
  }

  return (
    <div className="scroll"><div className="content">
      <h1>Your novels</h1>
      {error && <div className="notice error" role="alert">{error}</div>}
      {projects && projects.length > 0 && (
        <ul className="list" style={{ marginBottom: '2rem' }}>
          {projects.map((p) => (
            <li key={p.id} className="row">
              <button className="btn link grow" style={{ textAlign: 'left', fontFamily: 'var(--prose)', fontSize: '1.25rem' }} onClick={() => onOpen(p.id)}>{p.title}</button>
              <span className="faint small">Last changed {new Date(p.updated_at).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      )}
      {projects && projects.length === 0 && <p className="muted">Nothing here yet. Start a novel below, or bring one in from an archive.</p>}

      <form onSubmit={create} className="section">
        <h2>Start a novel</h2>
        <label className="field"><span>Working title</span><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label className="field"><span>One sentence about it, if you have one (optional)</span><textarea value={sentence} onChange={(e) => setSentence(e.target.value)} rows={2} /></label>
        <button className="btn write" type="submit">Start writing</button>
      </form>

      <div className="section">
        <h2>Bring in an archive</h2>
        <p className="muted small">Opens a Novel Studio archive file. You will see exactly what it contains before anything is added, and nothing already in your library is overwritten.</p>
        <input ref={fileRef} type="file" accept=".json,application/json" onChange={(e) => e.target.files?.[0] && void pickArchive(e.target.files[0])} />
      </div>

      {plan && (
        <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="imp-h">
          <div className="dialog">
            <h2 id="imp-h">Import "{plan.plan.title}"?</h2>
            {plan.plan.problems.length > 0 && <div className="notice error"><strong>This archive cannot be imported safely.</strong><ul>{plan.plan.problems.map((p: string) => <li key={p}>{p}</li>)}</ul></div>}
            {plan.plan.warnings.map((w: string) => <div key={w} className="notice">{w}</div>)}
            <p className="small muted">Contents: {Object.entries(plan.plan.counts).filter(([, n]) => (n as number) > 0).map(([t, n]) => `${n} ${t.replace(/_/g, ' ')}`).join(', ')}</p>
            <div className="row">
              {plan.plan.ok && plan.plan.mode === 'restore' && <button className="btn write" onClick={() => void doImport(false)}>Import</button>}
              {plan.plan.ok && plan.plan.mode !== 'restore' && <button className="btn write" onClick={() => void doImport(true)}>Import as a separate copy</button>}
              <button className="btn" onClick={() => setPlan(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div></div>
  );
}
