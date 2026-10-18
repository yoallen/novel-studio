import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api';
import { flushEditor } from './flush';

// Sharing between her computers: the settings, the notice above the page, and the Library's list of
// novels waiting on another computer.

const clock = (iso: string) => new Date(iso).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' });

/** Above every page: newer work from the other computer, a choice when both changed it, or the other computer still holding unshared changes. */
export function SyncNotice({ projectId, onTook }: { projectId: string | null; onTook: () => void }) {
  const [st, setSt] = useState<any>(null);
  const [msg, setMsg] = useState(() => { try { const m = sessionStorage.getItem('ns-sync-msg') ?? ''; sessionStorage.removeItem('ns-sync-msg'); return m; } catch { return ''; } });
  const [busy, setBusy] = useState(false);
  const [hidden, setHidden] = useState('');
  const firstTook = useRef<string | null | undefined>(undefined);
  const beat = useCallback(() => api.post('/api/sync/here', { projectId }).then(async (s) => {
    // Something the window shows was replaced in the background (only possible just after opening): show the new version.
    if (firstTook.current === undefined) firstTook.current = s?.tookAt ?? null;
    else if (s?.tookAt && s.tookAt !== firstTook.current) { await flushEditor(); window.location.reload(); return; }
    if (s?.notesIn > 0) {
      setMsg(`${s.notesIn === 1 ? 'A note' : `${s.notesIn} notes`} from the road came in. ${s.notesIn === 1 ? 'It is' : 'They are'} under Thoughts you saved, on Where was I.`);
      window.dispatchEvent(new Event('ns-captured'));
    }
    setSt(s);
  }).catch(() => setSt(null)), [projectId]);
  useEffect(() => { firstTook.current = undefined; void beat(); const t = window.setInterval(() => void beat(), 30_000); return () => window.clearInterval(t); }, [beat]);
  if (!st?.on || !projectId) return msg ? <div className="notice sync-notice" role="status">{msg} <button className="btn link small" onClick={() => setMsg('')}>OK</button></div> : null;

  async function act(path: string, body: unknown = {}) {
    setBusy(true);
    try {
      await flushEditor(); // the last words typed are saved before anything is decided
      const r = await api.post(`/api/projects/${projectId}/sync/${path}`, body);
      if (r.result === 'retry') { setMsg('You were typing, so nothing was changed. Try again in a moment.'); return; }
      if (r.result === 'took') { onTook(); return; }
      if (r.result === 'kept_both') {
        // Reload at once, so nothing is typed into a page that was just replaced; the message waits on the other side.
        try { sessionStorage.setItem('ns-sync-msg', `Done. Both versions are kept: the other one is in your Library as "${r.copyTitle}", on both computers.`); } catch { /* ignore */ }
        onTook(); return;
      }
      if (r.result === 'nothing' && path === 'resolve') setMsg('You already made this choice on your other computer, so it stands. Both versions are kept: the other one is in your Library beside the main one.');
      if (r.result === 'changed') setMsg('Something newer just arrived from your other computer. Look again before choosing.');
      if (r.result === 'diverged') setMsg('Both computers changed this novel, so it needs your choice below.');
      await beat();
    } catch (e) { setMsg((e as Error).message); } finally { setBusy(false); }
  }

  const key = st.incoming ? `in-${st.incoming.sharedAt}` : st.busyElsewhere?.length ? `busy-${st.busyElsewhere[0].lastSeen}` : '';
  return (
    <>
      {msg && <div className="notice sync-notice" role="status">{msg} <button className="btn link small" onClick={() => setMsg('')}>OK</button></div>}
      {st.diverged && (
        <div className="notice sync-notice" role="region" aria-label="Both computers changed this novel">
          <p style={{ margin: '0 0 0.5rem' }}><strong>This computer and your {st.diverged.deviceName} both changed this novel</strong> since they last shared ({st.diverged.deviceName}'s copy is from {clock(st.diverged.sharedAt)}). Nothing is lost either way: whichever you choose becomes the main version on both computers, and the other is kept beside it in your Library, on both.</p>
          <div className="row">
            <button className="btn small write" disabled={busy} onClick={() => void act('resolve', { keep: 'mine', file: st.diverged.file })}>Keep this computer's as the main version</button>
            <button className="btn small" disabled={busy} onClick={() => void act('resolve', { keep: 'theirs', file: st.diverged.file })}>Make the {st.diverged.deviceName}'s the main version</button>
          </div>
        </div>
      )}
      {!st.diverged && st.incoming && hidden !== key && (
        <div className="notice sync-notice" role="region" aria-label="Newer work from your other computer">
          Your {st.incoming.deviceName} shared newer work on this novel ({clock(st.incoming.sharedAt)}). Bring it in before you write.{' '}
          <button className="btn small write" disabled={busy} onClick={() => void act('take')}>{busy ? 'Bringing it in…' : 'Bring it in'}</button>
        </div>
      )}
      {!st.diverged && !st.incoming && st.busyElsewhere?.length > 0 && hidden !== key && (
        <div className="notice sync-notice" role="region" aria-label="Open on your other computer">
          This novel is open on your {st.busyElsewhere[0].name} with changes it has not shared yet (last seen {clock(st.busyElsewhere[0].lastSeen)}). If you write here too, Story Canon will ask you which version to keep as the main one; nothing is lost.{' '}
          <button className="btn link small" onClick={() => setHidden(key)}>Write here anyway</button>
        </div>
      )}
    </>
  );
}

/** Settings: turn sharing on with a folder both computers can see, and name this computer. */
export function SyncSettings({ projectId, onMsg, onError }: { projectId: string; onMsg: (m: string) => void; onError: (m: string) => void }) {
  const [st, setSt] = useState<any>(null);
  const [typed, setTyped] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const desktop = (window as any).storyCanon;
  const load = useCallback(() => api.get(`/api/sync?project=${encodeURIComponent(projectId)}`).then((s) => { setSt(s); if (s.device) setName(s.device); }).catch((e) => onError(e.message)), [projectId, onError]);
  useEffect(() => { void load(); }, [load]);

  async function use(dir: string) {
    setBusy(true);
    try {
      await api.put('/api/sync', { dir, name: name.trim() || undefined });
      onMsg('Sharing is on. Your novels are in the shared folder now; install Story Canon on your other computer and choose the same folder there.');
      setTyped(''); await load();
    } catch (e) { onError((e as Error).message); } finally { setBusy(false); }
  }
  async function choose() { const dir = await desktop.chooseFolder('Choose a folder both computers can see, such as your OneDrive'); if (dir) await use(dir); }
  async function shareNow() { setBusy(true); try { const r = await api.post('/api/sync/share'); onMsg(r.shared.length ? 'Shared.' : 'Nothing new to share; your other computer already has everything.'); await load(); } catch (e) { onError((e as Error).message); } finally { setBusy(false); } }
  async function off() { if (!window.confirm('Stop sharing from this computer? Nothing is deleted here or in the shared folder.')) return; await api.del('/api/sync'); await load(); }
  if (!st) return null;

  return (
    <section className="section" aria-labelledby="sync-h">
      <h2 id="sync-h">Your other computers</h2>
      {!st.on ? (
        <>
          <p className="muted small">Write on this computer and another, such as a laptop at home and a Surface at work. Both use a folder they can each see, like OneDrive. Each computer keeps its own copy of your novels and shares what changed every few minutes and when you close Story Canon; the other takes it in when it opens. Nothing is ever overwritten: if both computers change a novel before sharing, Story Canon asks you which is the main version and keeps the other beside it.</p>
          <label className="field" style={{ maxWidth: 360 }}><span>Call this computer</span><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Laptop, Surface…" maxLength={60} /></label>
          <div className="row">
            {desktop?.chooseFolder ? <button className="btn" disabled={busy} onClick={() => void choose()}>Choose the shared folder</button> : (
              <>
                <input type="text" aria-label="Shared folder" placeholder="A folder path, such as C:\\Users\\you\\OneDrive" value={typed} onChange={(e) => setTyped(e.target.value)} style={{ maxWidth: 420 }} />
                <button className="btn" disabled={!typed.trim() || busy} onClick={() => void use(typed)}>Share through this folder</button>
              </>
            )}
          </div>
        </>
      ) : (
        <>
          <p className="small" style={{ margin: '0 0 0.4rem' }}><span className="muted">This computer is</span> <strong>{st.device}</strong><span className="muted">, sharing through</span> <code>{st.folder}</code></p>
          <p className="small" style={{ margin: '0 0 0.4rem' }}>
            {st.unshared ? 'This novel has changes not shared yet. They go out within a few minutes, and when you close Story Canon.' : st.sharedAt ? `This novel was last shared ${clock(st.sharedAt)}. Nothing new since.` : 'This novel is up to date.'}
            {st.tookAt ? ` Last brought in from another computer ${clock(st.tookAt)}.` : ''}
          </p>
          {st.others.length > 0
            ? <p className="small muted" style={{ margin: '0 0 0.6rem' }}>Also sharing: {st.others.map((o: any) => `${o.name} (last seen ${clock(o.lastSeen)})`).join(', ')}.</p>
            : <p className="small muted" style={{ margin: '0 0 0.6rem' }}>No other computer has joined yet. Install Story Canon there and choose this same folder.</p>}
          <label className="choice" style={{ maxWidth: 640, marginBottom: '0.6rem' }}>
            <input type="checkbox" checked={st.ask} onChange={(e) => void api.put('/api/sync/ask', { ask: e.target.checked }).then(load).catch((er) => onError(er.message))} />
            <span>Ask me before bringing in work from my other computer<small>On: nothing changes until you click Bring it in. Off: newer work comes in on its own when there is nothing to choose (a backup is made first). Either way, when both computers changed a novel, you always choose.</small></span>
          </label>
          <RoadNotesInfo projectId={projectId} />
          <div className="row">
            <button className="btn" disabled={busy} onClick={() => void shareNow()}>Share now</button>
            {desktop?.chooseFolder && <button className="btn link small" onClick={() => void choose()}>Change folder</button>}
            <button className="btn link small" onClick={() => void off()}>Stop sharing</button>
          </div>
        </>
      )}
    </section>
  );
}

/** Where this novel's notes file is, and how to use it from her phone. */
function RoadNotesInfo({ projectId }: { projectId: string }) {
  const [at, setAt] = useState<{ path: string | null; folder?: string; file?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => { api.get(`/api/projects/${projectId}/road-notes`).then(setAt).catch(() => setAt(null)); }, [projectId]);
  if (!at?.path) return null;
  return (
    <section className="section" aria-label="Notes from the road" style={{ margin: '0.75rem 0' }}>
      <h3 style={{ marginTop: 0 }}>Notes from the road</h3>
      <p className="small" style={{ margin: '0 0 0.4rem' }}>This novel has its own notes file in your shared folder: <code>{at.path}</code></p>
      <p className="small muted" style={{ margin: '0 0 0.4rem' }}>On your phone, open it from OneDrive in Word and tap the microphone to dictate. Start each note on a new line. When Story Canon has this novel open, each new paragraph arrives under Thoughts you saved, usually within a minute of the file syncing. Your file is never changed, and a note that is already in comes in only once, so you can leave old notes in the file or delete them; either is fine.</p>
      <button className="btn link small" onClick={() => { void navigator.clipboard?.writeText(at.path!).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 2000); }); }}>{copied ? 'Copied' : 'Copy where it is'}</button>
    </section>
  );
}

/** Library: novels another computer shared that are not on this one yet. */
export function Elsewhere({ onOpen }: { onOpen: (id: string) => void }) {
  const [list, setList] = useState<any[]>([]);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { api.get('/api/sync/elsewhere').then(setList).catch(() => setList([])); }, []);
  if (!list.length) return null;
  async function bring(pid: string) {
    setBusy(pid); setError('');
    try { await api.post('/api/sync/bring', { projectId: pid }); onOpen(pid); } catch (e) { setError((e as Error).message); } finally { setBusy(''); }
  }
  return (
    <section className="section" aria-label="On your other computers">
      <h2>On your other computers</h2>
      <p className="muted small">Shared from another computer and not on this one yet. Bring one here and the two stay one book.</p>
      {error && <div className="notice error" role="alert">{error}</div>}
      <ul className="removed-books">
        {list.map((x) => (
          <li key={x.projectId} className="row small">
            <span>{x.title}</span>
            <span className="faint">from {x.deviceName}, {clock(x.sharedAt)}</span>
            <button className="btn link small" disabled={!!busy} aria-label={`Bring ${x.title} to this computer`} onClick={() => void bring(x.projectId)}>{busy === x.projectId ? 'Bringing it…' : 'Bring to this computer'}</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
