import { useEffect, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';
import { DEFAULT_STATUS_LABELS } from '../core/labels';

// Everything here belongs to this novel and can be changed at any time (R-A-109).
export function SettingsView({ ctx }: { ctx: Ctx }) {
  const [s, setS] = useState<any>(() => JSON.parse(JSON.stringify(ctx.settings)));
  const [title, setTitle] = useState(ctx.project.title);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [theme, setTheme] = useState<string>(() => { try { return localStorage.getItem('novel-studio-theme') ?? 'system'; } catch { return 'system'; } });

  async function save() {
    setMsg(''); setError('');
    try {
      if (title.trim() && title !== ctx.project.title) await api.patch(`/api/projects/${ctx.projectId}`, { title });
      const { sceneLadder, authorName, guidanceWhileDrafting, guidanceWhilePlanning, goal, targetWords, wordsPerPage, statusLabels, ownedLabel, reservedMarkers, nextWritingAction } = s;
      await api.patch(`/api/projects/${ctx.projectId}/settings`, { sceneLadder, authorName, guidanceWhileDrafting, guidanceWhilePlanning, goal, targetWords: targetWords ? Number(targetWords) : null, wordsPerPage, statusLabels, ownedLabel, reservedMarkers, nextWritingAction });
      await ctx.refreshProject();
      setMsg('Settings saved.');
    } catch (e) { setError((e as Error).message); }
  }
  function setTheme2(t: string) {
    setTheme(t);
    try { if (t === 'system') localStorage.removeItem('novel-studio-theme'); else localStorage.setItem('novel-studio-theme', t); } catch { /* ignore */ }
    if (t === 'system') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t;
  }
  const ladder: any[] = s.sceneLadder;
  const setLadder = (l: any[]) => setS({ ...s, sceneLadder: l });
  const keyFor = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40) || 'step';

  async function downloadArchive() {
    try {
      const a = await api.get(`/api/projects/${ctx.projectId}/archive`);
      const blob = new Blob([JSON.stringify(a, null, 1)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = `${ctx.project.title.replace(/[^\w\- ]+/g, '').trim() || 'novel'} archive ${new Date().toISOString().slice(0, 10)}.json`;
      link.click(); URL.revokeObjectURL(url);
    } catch (e) { setError((e as Error).message); }
  }
  async function snapshot() { try { const r = await api.post('/api/backups/snapshot'); setMsg(`Backup made and checked (${Math.round(r.bytes / 1024).toLocaleString()} KB).`); } catch (e) { setError((e as Error).message); } }

  return (
    <div className="scroll"><div className="content">
      <h1>Settings for this novel</h1>
      {msg && <div className="notice" role="status">{msg}</div>}
      {error && <div className="notice error" role="alert">{error}</div>}

      <section className="cols">
        <label className="field"><span>Title</span><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label className="field"><span>Your first name (used in "{(s.ownedLabel as string).replace('{author}', s.authorName || 'Name')}")</span><input type="text" value={s.authorName} onChange={(e) => setS({ ...s, authorName: e.target.value })} /></label>
        <label className="field"><span>Target length in words (optional)</span><input type="number" value={s.targetWords ?? ''} onChange={(e) => setS({ ...s, targetWords: e.target.value ? Number(e.target.value) : null })} /></label>
        <label className="field"><span>Words per page for page estimates</span><input type="text" value={(s.wordsPerPage as number[]).join(', ')} onChange={(e) => setS({ ...s, wordsPerPage: e.target.value.split(',').map((x) => Number(x.trim())).filter((n) => n > 0) })} /></label>
      </section>

      <section className="section">
        <h2>Your next writing action</h2>
        <p className="muted small">Leave empty and the program suggests one from where you left off.</p>
        <input type="text" value={s.nextWritingAction} onChange={(e) => setS({ ...s, nextWritingAction: e.target.value })} placeholder="For example: Draft the opening scene in the driveway" />
      </section>

      <section className="section cols">
        <label className="field"><span>Guidance while drafting</span>
          <select value={s.guidanceWhileDrafting} onChange={(e) => setS({ ...s, guidanceWhileDrafting: e.target.value })}>
            <option value="quiet">Quiet: note concerns, never interrupt</option><option value="advisory">Advisory: subtle notices</option><option value="deep">Deep Analysis: full detail</option>
          </select></label>
        <label className="field"><span>Guidance while planning</span>
          <select value={s.guidanceWhilePlanning} onChange={(e) => setS({ ...s, guidanceWhilePlanning: e.target.value })}>
            <option value="quiet">Quiet</option><option value="advisory">Advisory</option><option value="deep">Deep Analysis</option>
          </select></label>
        <label className="field"><span>Goal</span>
          <select value={s.goal.type} onChange={(e) => setS({ ...s, goal: { ...s.goal, type: e.target.value } })}>
            <option value="none">No goals</option><option value="words">Words per day</option><option value="scenes">Scenes per week</option><option value="time">Minutes per day</option><option value="milestones">Milestones</option>
          </select></label>
        {s.goal.type !== 'none' && s.goal.type !== 'milestones' && <label className="field"><span>Goal amount</span><input type="number" value={s.goal.target ?? ''} onChange={(e) => setS({ ...s, goal: { ...s.goal, target: e.target.value ? Number(e.target.value) : null } })} /></label>}
      </section>

      <section className="section">
        <h2>Scene status steps</h2>
        <p className="muted small">Rename, add, reorder or remove steps. "Counts as drafted" marks steps where the scene has prose.</p>
        <ul className="list">
          {ladder.map((st, i) => (
            <li key={st.key + i} className="row">
              <input type="text" value={st.label} onChange={(e) => setLadder(ladder.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} style={{ maxWidth: 280 }} aria-label={`Step ${i + 1} name`} />
              <label className="row small"><input type="checkbox" checked={!!st.drafted} onChange={(e) => setLadder(ladder.map((x, j) => (j === i ? { ...x, drafted: e.target.checked } : x)))} />Counts as drafted</label>
              <button className="btn small" disabled={i === 0} onClick={() => { const l = [...ladder]; [l[i - 1], l[i]] = [l[i], l[i - 1]]; setLadder(l); }} aria-label="Move up">↑</button>
              <button className="btn small" disabled={i === ladder.length - 1} onClick={() => { const l = [...ladder]; [l[i + 1], l[i]] = [l[i], l[i + 1]]; setLadder(l); }} aria-label="Move down">↓</button>
              <button className="btn small" disabled={ladder.length < 2} onClick={() => setLadder(ladder.filter((_, j) => j !== i))}>Remove</button>
            </li>
          ))}
        </ul>
        <button className="btn small" onClick={() => { let label = 'New step', key = keyFor(label), n = 2; while (ladder.some((x) => x.key === key)) key = `${keyFor(label)}_${n++}`; setLadder([...ladder, { key, label, drafted: true }]); }}>Add a step</button>
      </section>

      <section className="section">
        <h2>Words for decisions</h2>
        <div className="cols">
          {(Object.keys(DEFAULT_STATUS_LABELS) as (keyof typeof DEFAULT_STATUS_LABELS)[]).map((k) => (
            <label key={k} className="field"><span>Shown instead of "{DEFAULT_STATUS_LABELS[k]}"</span>
              <input type="text" value={s.statusLabels[k] ?? DEFAULT_STATUS_LABELS[k]} onChange={(e) => setS({ ...s, statusLabels: { ...s.statusLabels, [k]: e.target.value } })} /></label>
          ))}
          <label className="field"><span>Yours to write or decide ({'{author}'} becomes your name)</span><input type="text" value={s.ownedLabel} onChange={(e) => setS({ ...s, ownedLabel: e.target.value })} /></label>
        </div>
        <label className="field"><span>Your other markers for work you keep (one per line)</span>
          <textarea rows={4} value={(s.reservedMarkers as string[]).join('\n')} onChange={(e) => setS({ ...s, reservedMarkers: e.target.value.split('\n').map((x) => x.trim()).filter(Boolean) })} /></label>
      </section>

      <div className="row" style={{ margin: '1.5rem 0' }}><button className="btn write" onClick={() => void save()}>Save settings</button></div>

      <AiSettings ctx={ctx} />

      <section className="section">
        <h2>Appearance</h2>
        <div className="row" role="radiogroup" aria-label="Theme">
          {[['system', 'Match Windows'], ['light', 'Light'], ['dark', 'Dark']].map(([k, l]) => <label key={k} className="row small"><input type="radio" name="theme" checked={theme === k} onChange={() => setTheme2(k!)} />{l}</label>)}
        </div>
      </section>

      <section className="section">
        <h2>Backups</h2>
        <p className="muted small">Backups are also made automatically while you work. An archive is one file with this whole novel and its history, which you can keep anywhere and bring back in from the Library.</p>
        <div className="row"><button className="btn" onClick={() => void snapshot()}>Make a backup now</button><button className="btn" onClick={() => void downloadArchive()}>Save an archive of this novel</button></div>
      </section>
    </div></div>
  );
}

// The collaborator is off until she turns it on, per novel; prose is shared only if she says so (R-A-108).
function AiSettings({ ctx }: { ctx: Ctx }) {
  const [st, setSt] = useState<any>(null);
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const load = () => api.get(`/api/projects/${ctx.projectId}/ai`).then(setSt).catch((e) => setError(e.message));
  useEffect(() => { void load(); }, [ctx.projectId]);
  const set = (patch: Record<string, unknown>) => api.patch(`/api/projects/${ctx.projectId}/ai`, patch).then(setSt).catch((e) => setError(e.message));
  const desktop = (window as any).storyCanon;
  async function saveKey(k: string | null) {
    setError('');
    try {
      if (desktop?.setApiKey) await desktop.setApiKey(k); else await api.put('/api/ai/key', { key: k });
      setKey(''); await load();
    } catch (e) { setError((e as Error).message); }
  }
  if (!st) return null;
  return (
    <section className="section" aria-label="The collaborator">
      <h2>The collaborator</h2>
      <p className="small muted">A thinking partner that reads your decisions, guardrails and open questions before it answers. It never writes into your manuscript, and its suggestions wait for you. It uses your own Claude API key.</p>
      {error && <div className="notice error" role="alert">{error}</div>}
      <div className="row">
        {st.keySet ? <span className="small">Your key is set.</span> : <input type="password" autoComplete="off" placeholder="Claude API key" value={key} onChange={(e) => setKey(e.target.value)} aria-label="Claude API key" style={{ maxWidth: 320 }} />}
        {st.keySet ? <button className="btn small" onClick={() => void saveKey(null)}>Remove key</button> : <button className="btn small" disabled={!key.trim()} onClick={() => void saveKey(key)}>Save key</button>}
      </div>
      <p className="small faint">{desktop?.setApiKey ? 'The key is kept in Windows secure storage.' : 'In this preview the key is kept only while the program is open.'}</p>
      <label className="row"><input type="checkbox" checked={st.enabled} onChange={(e) => void set({ enabled: e.target.checked })} />Use the collaborator for {ctx.project.title}. Story records you ask about are sent to Claude when you ask.</label>
      <label className="row"><input type="checkbox" checked={st.shareManuscript} disabled={!st.enabled} onChange={(e) => void set({ shareManuscript: e.target.checked })} />Also share the prose of a scene when I ask about that scene</label>
      <label className="field" style={{ maxWidth: 320 }}><span>Model</span>
        <select value={st.model} onChange={(e) => void set({ model: e.target.value })}>
          {['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5', 'claude-fable-5-1'].map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </label>
    </section>
  );
}
