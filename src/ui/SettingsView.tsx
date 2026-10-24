import { Pages } from './Pages';
import { BRAND } from '../brand';
import { useEffect, useState } from 'react';
import { api } from './api';
import { SyncSettings } from './SyncViews';
import { DoorSetting } from './Door';
import type { Ctx } from './App';
import { AboutYou } from './AboutYou';
import { DEFAULT_STATUS_LABELS } from '../core/labels';

const GUIDANCE: [string, string][] = [['quiet', 'Quiet: note concerns, never interrupt'], ['advisory', 'Advisory: small notices you can ignore'], ['deep', 'Deep: full detail on everything it notices']];
const MODELS: [string, string, string][] = [
  ['claude-opus-5-5', 'Opus', 'The most careful reader and thinker. Slower, and costs the most per question.'],
  ['claude-sonnet-5-5', 'Sonnet', 'Thoughtful and quicker. A good everyday choice at a middle cost.'],
  ['claude-haiku-5-5', 'Haiku', 'The fastest and least costly. Good for quick checks and short questions.'],
  ['claude-fable-5-1', 'Fable', 'Another Claude model your key may reach. Check its price with Anthropic before you choose it.'],
];

// Everything here belongs to this novel and can be changed at any time (R-A-109).
export function SettingsView({ ctx }: { ctx: Ctx }) {
  const [s, setS] = useState<any>(() => JSON.parse(JSON.stringify(ctx.settings)));
  const [title, setTitle] = useState(ctx.project.title);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [syncMsg, setSyncMsg] = useState('');
  const [backupMsg, setBackupMsg] = useState('');
  // Things kept for her across all novels, saved with the same button.
  const [books, setBooks] = useState<any[] | null>(null);
  const [stages, setStages] = useState<string | null>(null);
  const [about, setAbout] = useState<any>(null);
  const [orig, setOrig] = useState<{ books: string; stages: string; about: string }>({ books: '', stages: '', about: '' });
  useEffect(() => {
    Promise.all([api.get('/api/shelf'), api.get('/api/stages'), api.get('/api/author-profile')]).then(([b, st, a]) => {
      setBooks(b); setStages((st as string[]).join('\n')); setAbout(a.about ?? {});
      setOrig({ books: JSON.stringify(b), stages: (st as string[]).join('\n'), about: JSON.stringify(a.about ?? {}) });
    }).catch((e) => setError(e.message));
  }, []);
  const callName: string = (about?.name ?? '').trim() || String(s.authorName ?? '').trim().split(/\s+/)[0] || '';
  // The "on you now" marker, shown with her name in it; stored with {author} so it follows her name.
  const fillName = (label: string) => callName ? label.replace(/\{author\}/g, callName) : label.replace(/\{author\},\s*/g, '').replace(/\{author\}/g, '');
  const unfillName = (text: string) => callName && text.includes(callName) ? text.split(callName).join('{author}') : text;
  const [base, setBase] = useState(() => JSON.stringify(ctx.settings) + ctx.project.title);
  const dirty = JSON.stringify(s) + title !== base
    || (books != null && JSON.stringify(books) !== orig.books) || (stages != null && stages !== orig.stages) || (about != null && JSON.stringify(about) !== orig.about);
  const [theme, setTheme] = useState<string>(() => { try { return localStorage.getItem('novel-studio-theme') ?? 'system'; } catch { return 'system'; } });

  async function save() {
    setMsg(''); setError(''); setSaved('');
    try {
      if (books != null && JSON.stringify(books) !== orig.books) { const b = await api.put('/api/shelf', { books: books.filter((x) => x.title.trim()) }); setBooks(b); setOrig((o) => ({ ...o, books: JSON.stringify(b) })); }
      if (stages != null && stages !== orig.stages) { await api.patch('/api/author-profile', { stages: stages.split('\n').map((x) => x.trim()).filter(Boolean) }); setOrig((o) => ({ ...o, stages })); }
      if (about != null && JSON.stringify(about) !== orig.about) { await api.patch('/api/author-profile', { about: { ...about, asked: true } }); setOrig((o) => ({ ...o, about: JSON.stringify(about) })); }
      if (title.trim() && title !== ctx.project.title) await api.patch(`/api/projects/${ctx.projectId}`, { title });
      const { sceneLadder, authorName, byline, guidanceWhileDrafting, guidanceWhilePlanning, goal, push, nextPush, targetWords, wordsPerPage, statusLabels, ownedLabel, reservedMarkers, nextWritingAction, coach } = s;
      await api.patch(`/api/projects/${ctx.projectId}/settings`, { sceneLadder, authorName, byline, guidanceWhileDrafting, guidanceWhilePlanning, goal, push: push && push.start && push.end ? { ...push, words: push.words ? Number(push.words) : null } : null, nextPush: nextPush && nextPush.start && nextPush.end ? { ...nextPush, words: nextPush.words ? Number(nextPush.words) : null } : null, targetWords: targetWords ? Number(targetWords) : null, wordsPerPage, statusLabels, ownedLabel, reservedMarkers, nextWritingAction, coach: coach !== false });
      await ctx.refreshProject();
      setBase(JSON.stringify(s) + title);
      setSaved(`Saved at ${new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}.`);
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
  async function snapshot() { try { const r = await api.post('/api/backups/snapshot'); setBackupMsg(`Backup made and checked (${Math.round(r.bytes / 1024).toLocaleString()} KB).`); } catch (e) { setError((e as Error).message); } }
  const SECTIONS: [string, string][] = [['set-novel', 'This novel'], ['set-goals', 'Guidance and goals'], ['set-push', 'Writing push'], ['set-steps', 'Scene status steps'], ['set-words', 'Words for decisions'], ['set-collab', 'The collaborator'], ['set-about', 'About you'], ['set-all', 'For all my novels'], ['set-look', 'Appearance'], ['set-sync', 'Your other computers'], ['set-backups', 'Backups']];
  const GOAL_HELP: Record<string, string> = {
    none: 'No daily number. Where was I? still shows what you wrote.',
    words: 'A number of words each day. Where was I? tracks it every day you write.',
    scenes: 'A number of scenes each week. It is kept as your goal; Where was I? counts words for now.',
    time: 'Minutes of writing each day. It is kept as your goal; Where was I? counts words for now.',
    milestones: 'No daily number. Write the milestones you are working toward, such as Act One drafted by March. They are yours to tick off.',
  };

  return (
    <div className="scroll"><div className="content">
      <h1>Settings for this novel</h1>
      <div className="notice" style={{ borderLeftColor: 'var(--struct)' }}>
        <strong>Novel setup</strong>: genres, story types, how the story is told, and your storytelling toolkit. <button className="btn link small" onClick={() => ctx.go('setup')}>Open novel setup</button>
      </div>
      <p className="small muted settings-model">Changes on this page are kept when you press <strong>Save settings</strong> at the bottom of the window. A few things take effect the moment you change them; those sections say so.</p>
      {msg && <div className="notice" role="status">{msg}</div>}
      {error && <div className="notice error" role="alert">{error}</div>}

      <Pages storeKey={`settings:${ctx.projectId}`} label="Settings" pages={[
        { title: 'This novel', content: (<>
      <section className="cols settings-section" id="set-novel" aria-label="This novel">
        <label className="field"><span>Title</span><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label className="field"><span>Your name</span><input type="text" value={s.authorName} onChange={(e) => setS({ ...s, authorName: e.target.value })} /><small className="muted">{(about?.name ?? '').trim() ? `${BRAND.name} calls you ${callName}, the name in About you (page 5).` : `${BRAND.name} calls you by your first name here, unless you give it another in About you (page 5).`}</small></label>
        <label className="field"><span>Author name on this book (your pen name, if it has one)</span><input type="text" value={s.byline ?? ''} placeholder={s.authorName || 'Your name'} onChange={(e) => setS({ ...s, byline: e.target.value })} /><small className="muted">Printed on the title page when you export. Leave it empty to use your name.</small></label>
        <label className="field"><span>Target length in words (optional)</span><input type="number" value={s.targetWords ?? ''} onChange={(e) => setS({ ...s, targetWords: e.target.value ? Number(e.target.value) : null })} /></label>
        <label className="field"><span>Words per page for page estimates</span><input type="text" value={(s.wordsPerPage as number[]).join(', ')} onChange={(e) => setS({ ...s, wordsPerPage: e.target.value.split(',').map((x) => Number(x.trim())).filter((n) => n > 0) })} /></label>
      </section>

      <section className="section settings-section">
        <h2>Your next writing action</h2>
        <p className="muted small">Leave empty and the program suggests one from where you left off.</p>
        <input type="text" value={s.nextWritingAction} onChange={(e) => setS({ ...s, nextWritingAction: e.target.value })} placeholder="For example: Draft the opening scene" />
      </section>

        </>) },
        { title: 'Goals and focused efforts', content: (<>
      <section className="section settings-section" id="set-goals" aria-label="Guidance and goals">
        <h2>Guidance and goals</h2>
        <p className="small muted">How much the collaborator speaks up about concerns, while you draft and while you plan.</p>
        <div className="cols">
          <label className="field"><span>Guidance while drafting</span>
            <select value={s.guidanceWhileDrafting} onChange={(e) => setS({ ...s, guidanceWhileDrafting: e.target.value })}>
              {GUIDANCE.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select></label>
          <label className="field"><span>Guidance while planning</span>
            <select value={s.guidanceWhilePlanning} onChange={(e) => setS({ ...s, guidanceWhilePlanning: e.target.value })}>
              {GUIDANCE.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select></label>
          <label className="field"><span>Everyday goal</span>
            <select value={s.goal.type} onChange={(e) => setS({ ...s, goal: { ...s.goal, type: e.target.value } })}>
              <option value="none">No goals</option><option value="words">Words per day</option><option value="scenes">Scenes per week</option><option value="time">Minutes per day</option><option value="milestones">Milestones</option>
            </select><small className="muted">{GOAL_HELP[s.goal.type] ?? ''}</small></label>
          {s.goal.type !== 'none' && s.goal.type !== 'milestones' && <label className="field"><span>Goal amount</span><input type="number" value={s.goal.target ?? ''} onChange={(e) => setS({ ...s, goal: { ...s.goal, target: e.target.value ? Number(e.target.value) : null } })} /></label>}
          {s.goal.type === 'milestones' && <label className="field"><span>My milestones</span><textarea rows={3} value={s.goal.note ?? ''} onChange={(e) => setS({ ...s, goal: { ...s.goal, note: e.target.value } })} placeholder="One per line" /></label>}
        </div>
      </section>

      <section className="section settings-section" id="set-push" aria-labelledby="push-h">
        <h2 id="push-h">A writing push</h2>
        <p className="muted small">A stretch of days with a word goal: thirty days of focus, a month like November and 50,000 words, or any dates you choose. Where was I? shows how you are tracking, from two weeks before it starts.</p>
        <PushSettings ctx={ctx} s={s} setS={setS} onAction={(next) => {
          // A pause or an early end is saved at once; keep everything else she has typed and not saved.
          const keep = (o: any) => ({ ...o, push: next.push, pastPushes: next.pastPushes, nextPush: next.nextPush });
          setS(keep(s));
          setBase((b0) => { try { const t = b0.slice(0, b0.length - title.length); return JSON.stringify(keep(JSON.parse(t))) + title; } catch { return b0; } });
          void ctx.refreshProject();
        }} />
        <label className="small coach-check"><input type="checkbox" checked={s.coach !== false} onChange={(e) => setS({ ...s, coach: e.target.checked })} /><span><b>Coach me through the push.</b> On Where was I?, a note for each day of the push, the milestones as you reach them, and plain help when you are behind or stuck.</span></label>
        <OwnCoachNotes ctx={ctx} />
      </section>

      <DoorSetting ctx={ctx} onError={setError} />

        </>) },
        { title: 'Writing', content: (<>
      <section className="section settings-section" id="set-steps">
        <h2>Scene status steps</h2>
        <p className="muted small">Rename, add, reorder or remove steps. Tick "Counts as drafted" for steps where the scene has prose. In the binder, a scene before the first drafted step shows an empty circle, the first drafted step (Drafting) a half-filled one, and every step after it a full circle.</p>
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

      <section className="section settings-section" id="set-words">
        <h2>Words for decisions</h2>
        <p className="muted small">The words shown everywhere for how settled something is. Change any of them to your own.</p>
        <div className="cols">
          {(Object.keys(DEFAULT_STATUS_LABELS) as (keyof typeof DEFAULT_STATUS_LABELS)[]).map((k) => (
            <label key={k} className="field"><span>Shown instead of "{DEFAULT_STATUS_LABELS[k]}"</span>
              <input type="text" value={s.statusLabels[k] ?? DEFAULT_STATUS_LABELS[k]} onChange={(e) => setS({ ...s, statusLabels: { ...s.statusLabels, [k]: e.target.value } })} /></label>
          ))}
          <label className="field"><span>The marker for what is yours to write or decide</span><input type="text" value={fillName(s.ownedLabel)} onChange={(e) => setS({ ...s, ownedLabel: unfillName(e.target.value) })} /><small className="muted">{callName ? `Your name, ${callName}, comes from ${(about?.name ?? '').trim() ? 'About you' : 'Your name above'} and follows it if it changes.` : 'Add your name in About you and it appears here.'}</small></label>
        </div>
        <label className="field"><span>Other markers for work you keep (one per line)</span><small className="muted" style={{ display: 'block', marginBottom: '0.3rem' }}>Different kinds of work you keep for yourself, such as Mine to build or Mine to choreograph. Marking a record or scene with one shows at a glance what kind of work waits for you there.</small>
          <textarea rows={4} value={(s.reservedMarkers as string[]).join('\n')} onChange={(e) => setS({ ...s, reservedMarkers: e.target.value.split('\n').map((x) => x.trim()).filter(Boolean) })} /></label>
      </section>

        </>) },
        { title: 'The collaborator', content: (<>
      <AiSettings ctx={ctx} />
        </>) },
        { title: 'About you', content: (<>
      <div id="set-about" className="settings-section">{about && <AboutYou value={about} onChange={setAbout} />}</div>

        </>) },
        { title: 'All my novels', content: (<>
      <AuthorLevel ctx={ctx} books={books} setBooks={setBooks} stages={stages} setStages={setStages} />

        </>) },
        { title: 'Appearance', content: (<>
      <section className="section settings-section" id="set-look">
        <h2>Appearance <span className="saves-now">Takes effect right away</span></h2>
        <div className="row" role="radiogroup" aria-label="Theme">
          {[['system', 'Match Windows'], ['light', 'Light'], ['dark', 'Dark']].map(([k, l]) => <label key={k} className="row small"><input type="radio" name="theme" checked={theme === k} onChange={() => setTheme2(k!)} />{l}</label>)}
        </div>
      </section>

        </>) },
        { title: 'Other computers and backups', content: (<>
      <div id="set-sync" className="settings-section">
        <SyncSettings projectId={ctx.projectId} onMsg={setSyncMsg} onError={setError} />
        {syncMsg && <div className="notice" role="status">{syncMsg}</div>}
      </div>

      <section className="section settings-section" id="set-backups">
        <h2>Backups <span className="saves-now">Takes effect right away</span></h2>
        <p className="muted small">Backups are also made automatically while you work. An archive is one file with this whole novel and its history, which you can keep anywhere and bring back in from the Library.</p>
        <BackupPlace onMsg={setBackupMsg} onError={setError} />
        <div className="row"><button className="btn" onClick={() => void snapshot()}>Make a backup now</button><button className="btn" onClick={() => void downloadArchive()}>Save an archive of this novel</button></div>
        {backupMsg && <div className="notice" role="status" style={{ marginTop: '0.75rem' }}>{backupMsg}</div>}
      </section>

        </>) },
      ]} />

      <p className="small faint" style={{ margin: '2rem 0 1rem' }}>{BRAND.name}, version {__APP_VERSION__}</p>

      <div className="save-bar" role="region" aria-label="Save settings">
        <button className="btn write" onClick={() => void save()}>Save settings</button>
        <span role="status" className="save-bar-status">{saved && !dirty ? saved : dirty ? 'You have changes not saved yet.' : 'Everything here is saved.'}</span>
      </div>
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
    <section className="section settings-section" id="set-collab" aria-label="The collaborator">
      <h2>The collaborator <span className="saves-now">Takes effect right away</span></h2>
      <p className="small muted">A thinking partner that reads your decisions, guardrails and open questions before it answers. It never writes into your manuscript, and its suggestions wait for you. It uses your own Claude API key.</p>
      {error && <div className="notice error" role="alert">{error}</div>}
      <div className="row">
        {st.keySet ? <span className="small">Your key is set.</span> : <input type="password" autoComplete="off" placeholder="Claude API key" value={key} onChange={(e) => setKey(e.target.value)} aria-label="Claude API key" style={{ maxWidth: 320 }} />}
        {st.keySet ? <button className="btn small" onClick={() => void saveKey(null)}>Remove key</button> : <button className="btn small" disabled={!key.trim()} onClick={() => void saveKey(key)}>Use this key</button>}
      </div>
      <p className="small faint">{(window as any).storyCanon?.isDesktop ? 'The key is kept in Windows secure storage.' : 'In this preview the key is kept only while the program is open.'}</p>
      <label className="row"><input type="checkbox" checked={st.enabled} onChange={(e) => void set({ enabled: e.target.checked })} />Use the collaborator for {ctx.project.title}. Story records you ask about are sent to Claude when you ask.</label>
      <label className="row"><input type="checkbox" checked={st.shareManuscript} disabled={!st.enabled} onChange={(e) => void set({ shareManuscript: e.target.checked })} />Also share the prose of a scene when I ask about that scene</label>
      <fieldset className="model-choice">
        <legend>Which Claude answers</legend>
        <p className="small muted">Each question is billed to your own key. Longer questions and longer answers cost more.</p>
        {MODELS.map(([m, name, help]) => (
          <label key={m} className="choice">
            <input type="radio" name="model" checked={st.model === m} onChange={() => void set({ model: m })} />
            <span><strong>{name}</strong><small>{help}</small></span>
          </label>
        ))}
      </fieldset>
    </section>
  );
}

// Settings that belong to her, not to one novel: her craft shelf, her methods, and the stages a book can be in.
function AuthorLevel({ ctx, books, setBooks, stages, setStages }: { ctx: Ctx; books: any[] | null; setBooks: (f: (b: any[] | null) => any[] | null) => void; stages: string | null; setStages: (s: string) => void }) {
  const set = (i: number, patch: any) => setBooks((b) => (b ?? []).map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <section className="section settings-section" id="set-all" aria-label="For all my novels">
      <h2>For all my novels</h2>
      <h3 className="small">My craft shelf</h3>
      <p className="small muted">The books and teachers you learn from. The collaborator starts here when it points you to where to learn more, by title and author only.</p>
      {books && (
        <div role="group" aria-label="My craft shelf" className="craft-shelf">
          <div className="shelf-row shelf-head" aria-hidden="true"><span>Title</span><span>Author</span><span>What I use it for</span><span /></div>
          {books.map((b, i) => (
            <div key={i} className="shelf-row">
              <input type="text" aria-label="Title" value={b.title} onChange={(e) => set(i, { title: e.target.value })} placeholder="Title" />
              <input type="text" aria-label="Author" value={b.author} onChange={(e) => set(i, { author: e.target.value })} placeholder="Author" />
              <textarea rows={2} aria-label="I use it for" value={b.useFor} onChange={(e) => set(i, { useFor: e.target.value })} placeholder="What I use it for" />
              <button className="btn link small" onClick={() => setBooks((x) => (x ?? []).filter((_, j) => j !== i))}>Remove</button>
            </div>
          ))}
          <div className="row"><button className="btn small" onClick={() => setBooks((x) => [...(x ?? []), { title: '', author: '', useFor: '' }])}>Add a book</button></div>
        </div>
      )}
      <h3 className="small" style={{ marginTop: '1.5rem' }}>My methods</h3>
      <p className="small muted">Methods from any teacher or book, with their own beats, questions and fields. <button className="btn link small" onClick={() => ctx.go('methods')}>Open my methods</button></p>
      <h3 className="small" style={{ marginTop: '1.5rem' }}>Stages a book can be in</h3>
      <p className="small muted">The stages you choose from on each book's cover, one per line.</p>
      <textarea rows={6} aria-label="Stages, one per line" value={stages ?? ''} onChange={(e) => setStages(e.target.value)} style={{ maxWidth: 360 }} />
    </section>
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

/** Her own notes for the push coach: one per line. They mix in with the coach's notes, about one ordinary day in four. */
function OwnCoachNotes({ ctx }: { ctx: Ctx }) {
  const [text, setText] = useState<string | null>(null);
  const [saved, setSaved] = useState('');
  const [msg, setMsg] = useState('');
  useEffect(() => { api.get(`/api/projects/${ctx.projectId}/coach/own-notes`).then((r) => { const t = r.notes.join('\n'); setText(t); setSaved(t); }).catch(() => setText('')); }, [ctx.projectId]);
  if (text == null) return null;
  async function save() {
    const r = await api.put(`/api/projects/${ctx.projectId}/coach/own-notes`, { notes: (text ?? '').split('\n') });
    const t = r.notes.join('\n'); setText(t); setSaved(t);
    setMsg(r.notes.length ? `Saved. ${r.notes.length === 1 ? 'Your note' : `Your ${r.notes.length} notes`} will mix in with the coach's.` : 'Saved. The coach will use only its own notes.');
  }
  return (
    <div className="field" style={{ marginTop: '0.75rem' }}>
      <span><b>Your own notes for the coach</b></span>
      <p className="small muted" style={{ margin: '0.15rem 0 0.35rem' }}>One per line. A line that keeps you going, something a mentor told you, why this book matters. They mix in with the coach's notes on ordinary days, and they come with this novel to your other computer.</p>
      <textarea rows={4} value={text} onChange={(e) => { setText(e.target.value); setMsg(''); }} aria-label="Your own notes for the coach" placeholder="For example: Finish the draft. Fix it later." />
      <div className="row small" style={{ marginTop: '0.35rem' }}>
        <button className="btn small" disabled={text === saved} onClick={() => void save()}>Save my notes</button>
        {msg && <span className="muted" role="status">{msg}</span>}
      </div>
    </div>
  );
}

const localDay = (x = new Date()) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
const plusDays = (d: string, n: number) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
const longDate = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString(undefined, { month: 'long', day: 'numeric', timeZone: 'UTC' });
const spanDays = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000) + 1;

/** The fields of a push: its name, days, words and whether it has a real deadline. */
function PushFields({ p, set }: { p: any; set: (p: any) => void }) {
  const days = p.start && p.end ? spanDays(p.start, p.end) : 0;
  const perDay = days > 0 && p.words ? Math.ceil(Number(p.words) / days) : 0;
  return (<>
    <div className="cols">
      <label className="field"><span>Name it</span><input type="text" value={p.name} maxLength={60} onChange={(e) => set({ ...p, name: e.target.value })} placeholder="For example: Spring push" /></label>
      <label className="field"><span>First day</span><input type="date" value={p.start} onChange={(e) => set({ ...p, start: e.target.value })} /></label>
      <label className="field"><span>Last day</span><input type="date" value={p.end} onChange={(e) => set({ ...p, end: e.target.value })} /></label>
      <label className="field"><span>Words to write in it</span><input type="number" value={p.words ?? ''} onChange={(e) => set({ ...p, words: e.target.value ? Number(e.target.value) : null })} /></label>
    </div>
    <label className="small coach-check deadline-check"><input type="checkbox" checked={!!p.deadline} onChange={(e) => set({ ...p, deadline: e.target.checked })} /><span><b>This push has a real deadline</b> (a contest, a due date, November). Its end date stays put if you pause.</span></label>
    {perDay > 0 && <p className="small push-perday">That is about {perDay.toLocaleString()} words a day for {days} day{days === 1 ? '' : 's'}. It is your daily goal on those days only; the rest of the time, your everyday goal applies. If a day comes up short, the difference is shared by the days after it, and on Where was I? you can set a lighter day or a rest day ahead of time.</p>}
  </>);
}

/** Starting points for a push: change anything after. `from` is the first day it may begin. */
function PushStarts({ from, onPick }: { from: string; onPick: (p: any) => void }) {
  const y = Number(from.slice(0, 4)) + (from > `${from.slice(0, 4)}-11-01` ? 1 : 0);
  return (
    <div className="row small">
      <button className="btn small" onClick={() => onPick({ name: 'Thirty days', start: from, end: plusDays(from, 29), words: 30000, deadline: false })}>30 days from {from === localDay() ? 'today' : longDate(from)}</button>
      <button className="btn small" onClick={() => onPick({ name: 'November', start: `${y}-11-01`, end: `${y}-11-30`, words: 50000, deadline: true })}>November, 50,000 words</button>
      <button className="btn small" onClick={() => onPick({ name: '', start: from, end: from, words: null, deadline: false })}>My own dates</button>
    </div>
  );
}

/**
 * A writing push in Settings. A push that is running can be changed, paused or ended early, never replaced:
 * a new push waits until it ends. Its next push can be planned to begin after it.
 */
function PushSettings({ ctx, s, setS, onAction }: { ctx: Ctx; s: any; setS: (x: any) => void; onAction: (next: any) => void }) {
  const today = localDay();
  const p = s.push;
  const running = !!p && !p.endedEarly && p.start <= today && today <= p.end;
  const pause = running ? (p.pauses ?? []).find((x: any) => x.from <= today && today < x.back) : null;
  // A push that ended (or was ended early) is shown as done, with what it came to, until a new one is set.
  const lastEarly = !p && s.pastPushes?.length && s.pastPushes[s.pastPushes.length - 1].endedEarly ? s.pastPushes[s.pastPushes.length - 1] : null;
  const shown = p ?? lastEarly;
  const ended = !!shown && (!!shown.endedEarly || today > shown.end);
  const [mode, setMode] = useState<'' | 'pause' | 'end'>('');
  const [back, setBack] = useState(() => plusDays(today, 3));
  const [extend, setExtend] = useState<boolean | null>(null);
  const [err, setErr] = useState('');
  const [endedSaid, setEndedSaid] = useState('');
  useEffect(() => {
    if (!ended || !shown) { setEndedSaid(''); return; }
    api.get(`/api/projects/${ctx.projectId}/shelves`).then((list: any[]) => {
      const sh = list.find((x) => x.start === shown.start && x.name === shown.name);
      if (sh) {
        const t = Math.max(0, sh.total), g = sh.goal;
        setEndedSaid(!g ? `${t.toLocaleString()} words.` : t > g ? `${t.toLocaleString()} words. Goal of ${g.toLocaleString()} met, ${(t - g).toLocaleString()} extra.` : t === g ? `${t.toLocaleString()} words. Goal met.` : `${t.toLocaleString()} of ${g.toLocaleString()} words.`);
      }
    }).catch(() => setEndedSaid(''));
  }, [ctx.projectId, ended, shown?.start, shown?.name]); // eslint-disable-line react-hooks/exhaustive-deps
  const name = shown?.name || 'your push';
  const extendOn = extend ?? !p?.deadline;
  const away = back > today ? spanDays(today, back) - 1 : 0;
  async function act(path: string, body: any) {
    setErr('');
    try { const next = await api.post(`/api/projects/${ctx.projectId}/push/${path}`, body); setMode(''); onAction(next); }
    catch (e) { setErr((e as Error).message); }
  }
  const nextFrom = p && !ended ? plusDays(p.end, 1) : today;
  return (<>
    {running && <>
      <p className="settings-sub">The push you're in</p>
      {pause && <div className="push-slip"><p className="pen-title">{name} is paused until {longDate(pause.back)}.</p><p className="small" style={{ margin: '4px 0 0' }}>Nothing is asked of you until then. <button className="btn link small" onClick={() => void act('resume', {})}>Come back now</button></p></div>}
      <PushFields p={p} set={(x) => setS({ ...s, push: x })} />
      <p className="muted small">Changing these edits this push; fixing its name or moving its last day never makes a second book.</p>
      {mode === '' && <div className="row small">
        {!pause && <button className="btn small" onClick={() => { setMode('pause'); setExtend(null); }}>Pause this push</button>}
        <button className="btn small" onClick={() => setMode('end')}>End this push early</button>
        <span className="grow" />
        {!s.nextPush && <button className="btn link small" onClick={() => setS({ ...s, nextPush: { name: '', start: nextFrom, end: plusDays(nextFrom, 29), words: null, deadline: false } })}>Plan your next push</button>}
      </div>}
      {mode === 'pause' && <div className="push-slip" role="group" aria-label={`Pause ${name}`}>
        <p className="pen-title">Pause {name}</p>
        <p className="coach-body">Stepping away is allowed. Coming back is the promise. Pick the day you'll be back.</p>
        <label className="field" style={{ maxWidth: '16rem' }}><span>Back on</span><input type="date" value={back} min={plusDays(today, 1)} onChange={(e) => setBack(e.target.value)} /></label>
        <p className="small" style={{ margin: '0.6rem 0 0.2rem' }}><b>When you come back:</b></p>
        <label className="small push-choice"><input type="radio" name="push-end" checked={extendOn} onChange={() => setExtend(true)} /><span>{p.deadline ? 'Move the last day anyway' : 'Move the last day out by the days I pause, so I keep the full push'}{away > 0 ? <span className="muted"> (it would end {longDate(plusDays(p.end, away))})</span> : null}.</span></label>
        <label className="small push-choice"><input type="radio" name="push-end" checked={!extendOn} onChange={() => setExtend(false)} /><span>Keep the last day, {longDate(p.end)}, and share the words left over the days that remain.{p.deadline ? ' This push has a real deadline, so this is chosen for you.' : ''}</span></label>
        <p className="muted small" style={{ margin: '0.5rem 0 0' }}>While it's paused there is no daily goal and the coach stays quiet. Anything you write still counts toward the push.</p>
        <div className="row small"><button className="btn small" disabled={!(back > today)} onClick={() => void act('pause', { back, extend: extendOn })}>Pause until {back > today ? longDate(back) : '...'}</button><button className="btn link small" onClick={() => setMode('')}>Never mind</button></div>
      </div>}
      {mode === 'end' && <div className="push-slip" role="group" aria-label={`End ${name} early`}>
        <p className="pen-title">End {name} early?</p>
        <p className="coach-body">Only end it if you need to. Needing a few days off is what a pause is for.</p>
        <p className="small" style={{ margin: '0.4rem 0' }}>{name} goes to your Finished shelf as it stands, marked ended early. Every word stays in your book.</p>
        <div className="row small"><button className="btn small" onClick={() => void act('end', {})}>Yes, end this push</button><button className="btn link small" onClick={() => setMode('')}>Keep going</button>{!pause && <button className="btn link small" onClick={() => { setMode('pause'); setExtend(null); }}>Pause it instead</button>}</div>
      </div>}
      {s.nextPush && <>
        <p className="settings-sub">Your next push</p>
        <p className="muted small">It begins on its own first day, after {name} ends.</p>
        <PushFields p={s.nextPush} set={(x) => setS({ ...s, nextPush: x })} />
        <div className="row small"><button className="btn link small" onClick={() => setS({ ...s, nextPush: null })}>Don't plan a next push</button></div>
      </>}
    </>}
    {p && !running && !ended && <>
      <p className="settings-sub">Your next push</p>
      <PushFields p={p} set={(x) => setS({ ...s, push: x })} />
      <div className="row small"><button className="btn link small" onClick={() => setS({ ...s, push: null })}>Don't plan this push</button></div>
    </>}
    {ended && <>
      <div className="push-slip"><p className="pen-title">{name} {shown.endedEarly ? 'ended early' : 'ended'} {longDate(shown.endedEarly ? shown.endedEarly.on : shown.end)}.</p>{endedSaid && <p className="pen-line">{endedSaid} It's on your Finished shelf.</p>}</div>
      <p className="small" style={{ margin: '0.6rem 0 0.4rem' }}><b>Plan your next push.</b> Start from one of these, then change anything:</p>
      <PushStarts from={today} onPick={(x) => setS({ ...s, push: x })} />
    </>}
    {!p && !ended && <div className="push-starts">
      <p className="small" style={{ margin: '0 0 0.4rem' }}><b>Plan a writing push.</b> Start from one of these, then change anything:</p>
      <PushStarts from={today} onPick={(x) => setS({ ...s, push: x })} />
    </div>}
    {err && <p className="notice error small">{err}</p>}
  </>);
}
