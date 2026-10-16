import { BRAND } from '../brand';
import { useEffect, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';
import { AboutYou } from './AboutYou';
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
      const { sceneLadder, authorName, guidanceWhileDrafting, guidanceWhilePlanning, goal, push, targetWords, wordsPerPage, statusLabels, ownedLabel, reservedMarkers, nextWritingAction } = s;
      await api.patch(`/api/projects/${ctx.projectId}/settings`, { sceneLadder, authorName, guidanceWhileDrafting, guidanceWhilePlanning, goal, push: push && push.start && push.end ? { ...push, words: push.words ? Number(push.words) : null } : null, targetWords: targetWords ? Number(targetWords) : null, wordsPerPage, statusLabels, ownedLabel, reservedMarkers, nextWritingAction });
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
      <div className="notice" style={{ borderLeftColor: 'var(--struct)' }}>
        <strong>Novel setup</strong>: genres, Snyder story types, narrative characteristics and your storytelling toolkit. <button className="btn link small" onClick={() => ctx.go('setup')}>Open novel setup</button>
      </div>
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
        <label className="field"><span>Everyday goal</span>
          <select value={s.goal.type} onChange={(e) => setS({ ...s, goal: { ...s.goal, type: e.target.value } })}>
            <option value="none">No goals</option><option value="words">Words per day</option><option value="scenes">Scenes per week</option><option value="time">Minutes per day</option><option value="milestones">Milestones</option>
          </select></label>
        {s.goal.type !== 'none' && s.goal.type !== 'milestones' && <label className="field"><span>Goal amount</span><input type="number" value={s.goal.target ?? ''} onChange={(e) => setS({ ...s, goal: { ...s.goal, target: e.target.value ? Number(e.target.value) : null } })} /></label>}
      </section>

      <section className="section" aria-labelledby="push-h">
        <h2 id="push-h">A writing push</h2>
        <p className="muted small">A stretch of days with a word goal, such as November and 50,000 words. Where was I shows how you are tracking, from two weeks before it starts.</p>
        {s.push ? (<>
          <div className="cols">
            <label className="field"><span>Name it</span><input type="text" value={s.push.name} maxLength={60} onChange={(e) => setS({ ...s, push: { ...s.push, name: e.target.value } })} placeholder="November" /></label>
            <label className="field"><span>First day</span><input type="date" value={s.push.start} onChange={(e) => setS({ ...s, push: { ...s.push, start: e.target.value } })} /></label>
            <label className="field"><span>Last day</span><input type="date" value={s.push.end} onChange={(e) => setS({ ...s, push: { ...s.push, end: e.target.value } })} /></label>
            <label className="field"><span>Words to write in it</span><input type="number" value={s.push.words ?? ''} onChange={(e) => setS({ ...s, push: { ...s.push, words: e.target.value ? Number(e.target.value) : null } })} /></label>
          </div>
          {(() => {
            const days = s.push.start && s.push.end ? Math.round((Date.parse(s.push.end) - Date.parse(s.push.start)) / 86400000) + 1 : 0;
            const perDay = days > 0 && s.push.words ? Math.ceil(Number(s.push.words) / days) : 0;
            return (
              <div className="row small">
                {perDay > 0 && <span>That is about {perDay.toLocaleString()} words a day for {days} days. It is your daily goal on those days only; the rest of the time, your everyday goal applies.</span>}
                <button className="btn link small" onClick={() => setS({ ...s, push: null })}>No push</button>
              </div>
            );
          })()}
        </>) : (
          <button className="btn small" onClick={() => { const y = new Date().getMonth() === 11 ? new Date().getFullYear() + 1 : new Date().getFullYear(); setS({ ...s, push: { name: 'November', start: `${y}-11-01`, end: `${y}-11-30`, words: 50000 } }); }}>Plan a writing push</button>
        )}
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

      <AuthorLevel ctx={ctx} />

      <section className="section">
        <h2>Appearance</h2>
        <div className="row" role="radiogroup" aria-label="Theme">
          {[['system', 'Match Windows'], ['light', 'Light'], ['dark', 'Dark']].map(([k, l]) => <label key={k} className="row small"><input type="radio" name="theme" checked={theme === k} onChange={() => setTheme2(k!)} />{l}</label>)}
        </div>
      </section>

      <section className="section">
        <h2>Backups</h2>
        <p className="muted small">Backups are also made automatically while you work. An archive is one file with this whole novel and its history, which you can keep anywhere and bring back in from the Library.</p>
        <BackupPlace onMsg={setMsg} onError={setError} />
        <div className="row"><button className="btn" onClick={() => void snapshot()}>Make a backup now</button><button className="btn" onClick={() => void downloadArchive()}>Save an archive of this novel</button></div>
      </section>

      <p className="small faint" style={{ margin: '2rem 0 1rem' }}>{BRAND.name}, version {__APP_VERSION__}</p>
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
  async function saveKey(k: string | null) {
    setError('');
    try {
      const r = await api.put('/api/ai/key', { key: k });
      setKey(''); await load();
      if (k && r.kept === false) setError('Your key works for now, but this computer could not store it securely, so you will need to enter it again next time.');
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
      <p className="small faint">{(window as any).storyCanon?.isDesktop ? 'The key is kept in Windows secure storage.' : 'In this preview the key is kept only while the program is open.'}</p>
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

// Settings that belong to her, not to one novel: her craft shelf, her methods, and the stages a book can be in.
function AuthorLevel({ ctx }: { ctx: Ctx }) {
  const [books, setBooks] = useState<any[] | null>(null);
  const [stages, setStages] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    api.get('/api/shelf').then(setBooks).catch((e) => setError(e.message));
    api.get('/api/stages').then((s: string[]) => setStages(s.join('\n'))).catch(() => {});
  }, []);
  async function saveShelf() {
    try { setBooks(await api.put('/api/shelf', { books: (books ?? []).filter((b) => b.title.trim()) })); setMsg('Your craft shelf is saved. The collaborator points you here first.'); } catch (e) { setError((e as Error).message); }
  }
  async function saveStages() {
    try { await api.patch('/api/author-profile', { stages: stages.split('\n').map((x) => x.trim()).filter(Boolean) }); setMsg('Stages saved for all your books.'); } catch (e) { setError((e as Error).message); }
  }
  const set = (i: number, patch: any) => setBooks((b) => (b ?? []).map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <>
    <AboutYou />
    <section className="section" aria-label="For all my novels">
      <h2>For all my novels</h2>
      {msg && <div className="notice" role="status">{msg}</div>}
      {error && <div className="notice error" role="alert">{error}</div>}
      <h3 className="small">My craft shelf</h3>
      <p className="small muted">The books and teachers you learn from. The collaborator starts here when it points you to where to learn more, by title and author only.</p>
      {books && (
        <div role="group" aria-label="My craft shelf">
          {books.map((b, i) => (
            <div key={i} className="row" style={{ marginBottom: '0.3rem' }}>
              <input type="text" aria-label="Title" value={b.title} onChange={(e) => set(i, { title: e.target.value })} placeholder="Title" style={{ maxWidth: 280 }} />
              <input type="text" aria-label="Author" value={b.author} onChange={(e) => set(i, { author: e.target.value })} placeholder="Author" style={{ maxWidth: 200 }} />
              <input type="text" aria-label="I use it for" value={b.useFor} onChange={(e) => set(i, { useFor: e.target.value })} placeholder="What I use it for" className="grow" />
              <button className="btn link small" onClick={() => setBooks((x) => (x ?? []).filter((_, j) => j !== i))}>Remove</button>
            </div>
          ))}
          <div className="row"><button className="btn small" onClick={() => setBooks((x) => [...(x ?? []), { title: '', author: '', useFor: '' }])}>Add a book</button><button className="btn small write" onClick={() => void saveShelf()}>Save my shelf</button></div>
        </div>
      )}
      <h3 className="small" style={{ marginTop: '1.25rem' }}>My methods</h3>
      <p className="small muted">Methods from any teacher or book, with their own beats, questions and fields. <button className="btn link small" onClick={() => ctx.go('methods')}>Open my methods</button></p>
      <h3 className="small" style={{ marginTop: '1.25rem' }}>Stages a book can be in</h3>
      <textarea rows={6} aria-label="Stages, one per line" value={stages} onChange={(e) => setStages(e.target.value)} style={{ maxWidth: 360 }} />
      <div><button className="btn small" onClick={() => void saveStages()}>Save stages</button></div>
    </section>
    </>
  );
}

/** Where backups go. In the desktop app she picks the folder with the system's own picker; anywhere she can write is fine. */
function BackupPlace({ onMsg, onError }: { onMsg: (m: string) => void; onError: (m: string) => void }) {
  const [loc, setLoc] = useState<any>(null);
  const [typed, setTyped] = useState('');
  const load = () => api.get('/api/backups/location').then(setLoc).catch((e) => onError(e.message));
  useEffect(() => { void load(); }, []);
  const desktop = (window as any).storyCanon;
  async function use(dir: string | null) {
    try {
      const r = await api.put('/api/backups/location', { dir });
      onMsg(dir ? `Backups now go to ${r.dir}. The first one is already there, checked.` : 'Backups go to the usual place again.');
      setTyped(''); await load();
    } catch (e) { onError((e as Error).message); }
  }
  async function choose() {
    const dir = await desktop.chooseFolder();
    if (dir) await use(dir);
  }
  if (!loc) return null;
  return (
    <div className="backup-place">
      <p className="small" style={{ margin: '0 0 0.4rem' }}><span className="muted">Backups go to</span> <code>{loc.dir}</code>{!loc.chosen && <span className="muted">, the usual place</span>}</p>
      <div className="row">
        {desktop?.chooseFolder ? <button className="btn small" onClick={() => void choose()}>Choose a folder</button> : (
          <>
            <input type="text" aria-label="Backup folder" placeholder="A folder path, such as D:\\Backups" value={typed} onChange={(e) => setTyped(e.target.value)} style={{ maxWidth: 360 }} />
            <button className="btn small" disabled={!typed.trim()} onClick={() => void use(typed)}>Use this folder</button>
          </>
        )}
        {loc.chosen && <button className="btn link small" onClick={() => void use(null)}>Back to the usual place</button>}
      </div>
      <p className="small faint" style={{ margin: '0.3rem 0 0.8rem' }}>A second drive, a USB stick or a synced folder such as OneDrive keeps a copy safe even if this computer is not.</p>
    </div>
  );
}
