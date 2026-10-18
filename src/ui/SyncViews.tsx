import { useCallback, useEffect, useState } from 'react';
import { api } from './api';

// Sharing between her computers: the settings, the notice above the page, and the Library's list of
// novels waiting on another computer.

const clock = (iso: string) => new Date(iso).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' });

/** Above every page: newer work from the other computer, or the other computer still holding unshared changes. */
export function SyncNotice({ projectId, onTook }: { projectId: string | null; onTook: (copyId?: string) => void }) {
  const [st, setSt] = useState<any>(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [hidden, setHidden] = useState('');
  const beat = useCallback(() => api.post('/api/sync/here', { projectId }).then(setSt).catch(() => setSt(null)), [projectId]);
  useEffect(() => { void beat(); const t = window.setInterval(() => void beat(), 60_000); return () => window.clearInterval(t); }, [beat]);
  if (!st?.on || !projectId) return msg ? <div className="notice sync-notice" role="status">{msg} <button className="btn link small" onClick={() => setMsg('')}>OK</button></div> : null;

  async function take() {
    setBusy(true);
    try {
      const r = await api.post(`/api/projects/${projectId}/sync/take`);
      if (r.result === 'took') { setMsg(`Brought in the newer work from your ${r.from}.`); onTook(); }
      else if (r.result === 'kept_both') { setMsg(`Both computers changed this novel before sharing, so nothing was overwritten. Yours is here as it was. The ${r.from} version is in your Library as "${r.copyTitle}".`); onTook(r.copyId); }
      await beat();
    } catch (e) { setMsg((e as Error).message); } finally { setBusy(false); }
  }

  const key = st.incoming ? `in-${st.incoming.sharedAt}` : st.busyElsewhere?.length ? `busy-${st.busyElsewhere[0].lastSeen}` : '';
  return (
    <>
      {msg && <div className="notice sync-notice" role="status">{msg} <button className="btn link small" onClick={() => setMsg('')}>OK</button></div>}
      {st.incoming && hidden !== key && (
        <div className="notice sync-notice" role="region" aria-label="Newer work from your other computer">
          Your {st.incoming.deviceName} shared newer work on this novel ({clock(st.incoming.sharedAt)}).{' '}
          {st.unshared ? 'This computer has changes of its own too; bringing it in keeps both versions, nothing overwritten.' : 'Bring it in before you write.'}{' '}
          <button className="btn small write" disabled={busy} onClick={() => void take()}>{busy ? 'Bringing it in…' : 'Bring it in'}</button>
        </div>
      )}
      {!st.incoming && st.busyElsewhere?.length > 0 && hidden !== key && (
        <div className="notice sync-notice" role="region" aria-label="Open on your other computer">
          This novel is open on your {st.busyElsewhere[0].name} with changes it has not shared yet (last seen {clock(st.busyElsewhere[0].lastSeen)}). If you write here now, both versions will be kept for you to choose from.{' '}
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
          <p className="muted small">Write on this computer and another, such as a laptop at home and a Surface at work. Both use a folder they can each see, like OneDrive. Each computer keeps its own copy of your novels and shares what changed every few minutes and when you close Story Canon; the other takes it in when it opens. Nothing is ever overwritten: if both computers change a novel before sharing, you keep both versions.</p>
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
