import { useEffect, useRef, useState } from 'react';
import { BRAND } from '../brand';
import { AboutYou } from './AboutYou';
import { api } from './api';

// All novels. A new novel starts from a title and, if she likes, one sentence. No questionnaire (S1-171).
export function Library({ onOpen }: { onOpen: (id: string) => void }) {
  const [projects, setProjects] = useState<any[] | null>(null);
  const [title, setTitle] = useState('');
  const [sentence, setSentence] = useState('');
  const [error, setError] = useState('');
  const [plan, setPlan] = useState<{ archive: unknown; plan: any } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => api.get('/api/library').then(setProjects).catch((e) => setError(e.message));
  const [askAbout, setAskAbout] = useState(false);
  useEffect(() => { api.get('/api/author-profile').then((p) => setAskAbout(!p.about?.asked)).catch(() => {}); }, []);
  const [seeds, setSeeds] = useState<any[]>([]);
  const [opening, setOpening] = useState('');
  const loadSeeds = () => api.get('/api/seeds').then(setSeeds).catch(() => setSeeds([]));
  useEffect(() => { void loadSeeds(); }, []);
  async function openSeed(file: string) {
    setOpening(file); setError('');
    try { const r = await api.post('/api/seeds/open', { file }); await load(); await loadSeeds(); onOpen(r.projectId); }
    catch (e) { setError((e as Error).message); } finally { setOpening(''); }
  }
  const [stages, setStages] = useState<string[]>([]);
  useEffect(() => { api.get('/api/stages').then(setStages).catch(() => {}); }, []);
  async function setStage(id: string, stage: string) { try { await api.put(`/api/projects/${id}/stage`, { stage }); await load(); } catch (e) { setError((e as Error).message); } }
  useEffect(() => { void load(); }, []);

  async function create(e: React.FormEvent, thenView?: string) {
    e.preventDefault();
    if (!title.trim()) { setError('Give the novel a working title. You can change it any time.'); return; }
    try {
      const p = await api.post('/api/projects', { title: title.trim(), profile: sentence.trim() ? { premise_sentence: sentence.trim() } : {} });
      if (sentence.trim()) await api.post(`/api/projects/${p.id}/capture`, { text: sentence.trim(), kind: 'idea' });
      if (thenView !== 'files') {
        const ch = await api.post(`/api/projects/${p.id}/chapters`, {});
        await api.post(`/api/chapters/${ch.id}/scenes`, {});
      }
      if (thenView) try { sessionStorage.setItem('ns-open-view', thenView); } catch { /* ignore */ }
      onOpen(p.id);
    } catch (err) { setError((err as Error).message); }
  }

  async function pickArchive(f: File) {
    setError('');
    try {
      const archive = JSON.parse(await f.text());
      const p = await api.post('/api/archive/plan', { archive });
      setPlan({ archive, plan: p });
    } catch (err) { setError(err instanceof SyntaxError ? `That file is not a ${BRAND.name} archive.` : (err as Error).message); }
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
    <div className="scroll library"><div className="content titlepage">
      <header className="title-page">
        <h1>{BRAND.name}</h1>
        <p className="sub">{BRAND.tagline}</p>
        <p className="motto" aria-hidden="true">&#10086;</p>
        <p className="motto">{BRAND.motto}</p>{BRAND.company && <p className="small muted">{BRAND.company}</p>}
      </header>
      {askAbout && <AboutYou first onDone={() => setAskAbout(false)} />}
      {seeds.map((sd) => (
        <section key={sd.file} className="section seed" aria-label={`${sd.title}, ready to bring in`}>
          <h2>{sd.title} is ready</h2>
          <p>Built from your planning: the Story Bible, both Character Breakthrough Archives, the planning conversation and the story data register. {Number(sd.counts.records).toLocaleString()} records, {Number(sd.counts.statements).toLocaleString()} facts, {Number(sd.counts.turns).toLocaleString()} conversation turns and {Number(sd.counts.passages).toLocaleString()} source passages.</p>
          <p className="small muted">Every fact keeps the status it has in your planning (decided, still developing, open, an example, or a suggestion you never accepted) and shows where it came from. Nothing was decided for you.</p>
          <div className="row">
            <button className="btn write" disabled={!!opening} onClick={() => void openSeed(sd.file)}>{opening === sd.file ? 'Bringing it in…' : `Bring in ${sd.title}`}</button>
            <button className="btn link" onClick={() => void api.post('/api/seeds/dismiss', { file: sd.file }).then(loadSeeds)}>Not now</button>
          </div>
        </section>
      ))}
      <h2>Your novels</h2>
      {error && <div className="notice error" role="alert">{error}</div>}
      {projects && projects.length > 0 && (
        <ul className="shelf" aria-label="Your novels">
          {projects.map((p) => (
            <li key={p.id} className="book">
              <button className="book-title" onClick={() => onOpen(p.id)}>{p.title}</button>
              <div className="row small" style={{ gap: '0.4rem 0.75rem' }}>
                <select aria-label={`Stage of ${p.title}`} value={p.stage ?? ''} onChange={(e) => void setStage(p.id, e.target.value)} style={{ width: 'auto' }}>
                  <option value="" disabled>Choose a stage</option>
                  {[...new Set([...(p.stage ? [p.stage] : []), ...stages])].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {p.draft.name !== p.stage && <span className="muted">{p.draft.name}</span>}
                <span className="muted">{Number(p.words).toLocaleString()} words{p.targetWords ? ` of ${Number(p.targetWords).toLocaleString()}` : ''}</span>
                {p.genres.length > 0 && <span className="faint">{p.genres.join(', ')}</span>}
              </div>
              <p className="small" style={{ margin: '0.35rem 0 0' }}><span className="faint">Next:</span> {p.next}</p>
            </li>
          ))}
        </ul>
      )}
      {projects && projects.length === 0 && <p className="muted">Nothing here yet. Start a novel below, or bring one in from an archive.</p>}

      <form onSubmit={create} className="section">
        <h2>Start a novel</h2>
        <label className="field"><span>Working title</span><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label className="field"><span>One sentence about it, if you have one (optional)</span><textarea value={sentence} onChange={(e) => setSentence(e.target.value)} rows={2} /></label>
        <div className="row">
          <button className="btn write" type="submit">Start writing</button>
          <button className="btn" type="button" onClick={(e) => void create(e, 'setup')}>Set it up first</button>
          <button className="btn link" type="button" onClick={(e) => void create(e, 'files')}>Start from a manuscript or story bible</button>
        </div>
      </form>

      <div className="section">
        <h2>Bring in an archive</h2>
        <p className="muted small">Opens a {BRAND.name} archive file. You will see exactly what it contains before anything is added, and nothing already in your library is overwritten.</p>
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
