import { useEffect, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';
import { statusWord } from './status';

const ROLE_NAMES: Record<string, string> = { primary: 'Primary', secondary: 'Secondary', influence: 'Influence' };

// How this novel is set up: genres, Snyder story types, narrative characteristics, and the storytelling toolkit.
// Every list is optional, can change any time, and switches real parts of the program on (R-B-088 to R-B-095).
export function NovelSetup({ ctx }: { ctx: Ctx }) {
  const [d, setD] = useState<any>(null);
  const [active, setActive] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [customGenre, setCustomGenre] = useState('');
  const [customChar, setCustomChar] = useState('');
  const [customFw, setCustomFw] = useState('');
  const [carry, setCarry] = useState(true);
  const load = () => Promise.all([api.get(`/api/projects/${ctx.projectId}/setup`), api.get(`/api/projects/${ctx.projectId}/setup/active`)]).then(([s, a]) => { setD(s); setActive(a); }).catch((e) => setError(e.message));
  useEffect(() => { void load(); }, [ctx.projectId]);
  async function save(patch: Record<string, unknown>, note = '') {
    setError(''); setMsg('');
    try { setD(await api.patch(`/api/projects/${ctx.projectId}/setup`, patch)); setActive(await api.get(`/api/projects/${ctx.projectId}/setup/active`)); if (note) setMsg(note); await ctx.refreshProject(); }
    catch (e) { setError((e as Error).message); }
  }
  if (!d) return <div className="content muted">{error || 'Opening…'}</div>;
  const s = d.setup;
  const genreOf = (k: string) => s.genres.find((g: any) => g.key === k);
  const setGenre = (key: string, name: string, role: string | null) => save({ genres: role ? (genreOf(key) ? s.genres.map((g: any) => (g.key === key ? { ...g, role } : g)) : [...s.genres, { key, name, role }]) : s.genres.filter((g: any) => g.key !== key) });
  const typeOf = (k: string) => s.storyTypes.find((t: any) => t.key === k);
  const setType = (key: string, role: string | null) => save({ storyTypes: role ? (typeOf(key) ? s.storyTypes.map((t: any) => (t.key === key ? { ...t, role } : t)) : [...s.storyTypes, { key, role }]) : s.storyTypes.filter((t: any) => t.key !== key) });
  const fw: string[] = d.frameworks;
  const allFw = [...d.catalog.frameworks, ...s.customFrameworks.map((f: any) => ({ ...f, kind: 'custom' }))];
  const structures = fw.filter((k) => d.catalog.frameworks.find((f: any) => f.key === k)?.kind === 'structure');
  const groups = [...new Set([...d.catalog.characteristics.map((c: any) => c.group), ...s.customCharacteristics.map((c: any) => c.group)])] as string[];
  const chars = [...d.catalog.characteristics, ...s.customCharacteristics];

  return (
    <div className="scroll"><div className="content" style={{ maxWidth: 980 }}>
      <button className="btn link small" onClick={() => ctx.go('settings')}>Settings</button>
      <h1>How {d.title} is set up</h1>
      <p className="muted">Every list here is optional and can change whenever the story does. What you choose decides which fields, views and questions the program offers this novel. Nothing you have written is ever hidden or removed by a change here.</p>
      {error && <div className="notice error" role="alert">{error}</div>}
      {msg && <div className="notice" role="status">{msg}</div>}

      <section className="section">
        <h2>The one sentence</h2>
        <textarea rows={2} defaultValue={d.premise} aria-label="The one sentence" placeholder="The whole book, squeezed until only its central irony is left." onBlur={(e) => { if (e.target.value !== d.premise) void save({ premise: e.target.value }); }} />
      </section>

      <section className="section" aria-label="Genres">
        <h2>Genres</h2>
        <p className="small muted">Conventional genres. Mark one or more as primary, secondary, or an influence you borrow from without taking on its conventions.</p>
        <div className="cols" style={{ gap: '0.25rem 1.5rem' }}>
          {[...d.catalog.genres, ...s.genres.filter((g: any) => g.custom)].map((g: any) => {
            const cur = genreOf(g.key);
            return (
              <div key={g.key} className="row">
                <label className="row grow"><input type="checkbox" checked={!!cur} onChange={(e) => void setGenre(g.key, g.name, e.target.checked ? 'secondary' : null)} />{g.name}{g.custom && <span className="chip">yours</span>}</label>
                {cur && <select aria-label={`${g.name} role`} value={cur.role} onChange={(e) => void setGenre(g.key, g.name, e.target.value)} style={{ width: 'auto' }}>{Object.entries(ROLE_NAMES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>}
              </div>
            );
          })}
        </div>
        <form className="row" style={{ marginTop: '0.5rem' }} onSubmit={(e) => { e.preventDefault(); if (customGenre.trim()) { void setGenre('', customGenre.trim(), 'secondary'); setCustomGenre(''); } }}>
          <input type="text" value={customGenre} onChange={(e) => setCustomGenre(e.target.value)} placeholder="A genre or subgenre of your own" aria-label="Your own genre" style={{ maxWidth: 320 }} />
          <button className="btn small" type="submit" disabled={!customGenre.trim()}>Add</button>
        </form>
        {d.asks.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <h3 className="small" style={{ margin: '0 0 0.25rem' }}>What these genres ask of your story</h3>
            <ul className="small" style={{ margin: 0 }}>{d.asks.map((a: any) => <li key={a.question}><span className="muted">{a.genre}:</span> {a.question}</li>)}</ul>
          </div>
        )}
      </section>

      <section className="section" aria-label="Story types">
        <h2>Blake Snyder story types</h2>
        <p className="small muted">A separate list from genre, with its own roles. Each type names three ingredients your story needs.</p>
        <div className="cols" style={{ gap: '0.25rem 1.5rem' }}>
          {d.catalog.storyTypes.map((t: any) => {
            const cur = typeOf(t.key);
            return (
              <div key={t.key}>
                <div className="row">
                  <label className="row grow"><input type="checkbox" checked={!!cur} onChange={(e) => void setType(t.key, e.target.checked ? 'secondary' : null)} />{t.name}</label>
                  {cur && <select aria-label={`${t.name} role`} value={cur.role} onChange={(e) => void setType(t.key, e.target.value)} style={{ width: 'auto' }}>{Object.entries(ROLE_NAMES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>}
                </div>
                <div className="small faint" style={{ paddingLeft: '1.6rem' }}>{t.about}</div>
              </div>
            );
          })}
        </div>
        {d.ingredients.map((t: any) => (
          <div key={t.key} style={{ marginTop: '1rem' }} aria-label={`${t.name} ingredients`} role="group">
            <h3 className="small" style={{ margin: '0 0 0.4rem' }}>{t.name}: the three ingredients in your story</h3>
            {t.items.map((i: any) => <Ingredient key={i.key} ctx={ctx} worldId={d.storyWorldId} item={i} onSaved={load} />)}
          </div>
        ))}
      </section>

      <section className="section" aria-label="Narrative characteristics">
        <h2>Narrative characteristics</h2>
        <p className="small muted">How the story is told, apart from what kind of story it is. Some of these switch on tools, shown beside them.</p>
        <div className="cols" style={{ gap: '0.75rem 1.5rem' }}>
          {groups.map((g) => (
            <div key={g}>
              <h3 className="small" style={{ margin: '0 0 0.25rem' }}>{g}</h3>
              {chars.filter((c: any) => c.group === g).map((c: any) => (
                <label key={c.key} className="choice" style={{ padding: '0.15rem 0' }}>
                  <input type="checkbox" checked={s.characteristics.includes(c.key)} onChange={(e) => void save({ characteristics: e.target.checked ? [...s.characteristics, c.key] : s.characteristics.filter((x: string) => x !== c.key) })} />
                  <span>{c.name}{c.turnsOn && <small>Turns on: {c.turnsOn}</small>}</span>
                </label>
              ))}
            </div>
          ))}
        </div>
        <form className="row" style={{ marginTop: '0.5rem' }} onSubmit={(e) => { e.preventDefault(); const name = customChar.trim(); if (!name) return; const key = `custom_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 40)}`; void save({ customCharacteristics: [...s.customCharacteristics, { key, name, group: 'My own' }], characteristics: [...s.characteristics, key] }); setCustomChar(''); }}>
          <input type="text" value={customChar} onChange={(e) => setCustomChar(e.target.value)} placeholder="A characteristic of your own" aria-label="Your own characteristic" style={{ maxWidth: 320 }} />
          <button className="btn small" type="submit" disabled={!customChar.trim()}>Add</button>
        </form>
      </section>

      <section className="section" aria-label="Storytelling toolkit">
        <h2>My storytelling toolkit</h2>
        <p className="small muted">The frameworks and methods you use for this novel. None is required, and using several together is deliberate, never a conflict. Say what job each one does for you.</p>
        {allFw.map((f: any) => {
          const on = fw.includes(f.key);
          return (
            <div key={f.key} style={{ borderTop: '1px solid var(--line)', padding: '0.5rem 0' }}>
              <label className="choice">
                <input type="checkbox" checked={on} onChange={(e) => void save({ frameworks: e.target.checked ? [...fw, f.key] : fw.filter((x) => x !== f.key) }, e.target.checked && f.kind === 'structure' && !structures.length ? `${f.name} is now the beat sheet for this novel.` : '')} />
                <span><strong>{f.name}</strong>{f.own && <> <span className="chip">yours</span> <button type="button" className="btn link small" onClick={(e) => { e.preventDefault(); ctx.go('methods'); }}>Edit</button></>}<small>{f.job}</small>{on && f.questions?.length > 0 && <small>Asks: {f.questions.join(' ')}</small>}</span>
              </label>
              {on && <label className="field" style={{ margin: '0.4rem 0 0 1.6rem' }}><span>How I use it</span><textarea rows={2} defaultValue={s.frameworkNotes[f.key] ?? ''} onBlur={(e) => { if (e.target.value !== (s.frameworkNotes[f.key] ?? '')) void save({ frameworkNotes: { [f.key]: e.target.value } }); }} /></label>}
            </div>
          );
        })}
        <div className="row" style={{ marginTop: '0.5rem' }}>
          <button className="btn small" onClick={() => ctx.go('methods')}>Make a method of my own</button>
          <span className="small muted">From any teacher or book: its own beats, questions and fields. Every novel can use it.</span>
        </div>
        {structures.length > 1 && (
          <div className="row" style={{ marginTop: '1rem' }} role="group" aria-label="Beat sheet">
            <span>The beat sheet that drives the board:</span>
            <select aria-label="Spine" value={d.spine ?? ''} onChange={(e) => void save({ spine: e.target.value, carryPlacements: carry }, carry ? 'Your placed scenes are offered on the matching beats, waiting for you to decide.' : '')} style={{ width: 'auto' }}>
              {structures.map((k) => <option key={k} value={k}>{d.catalog.structures[k] ?? k}</option>)}
            </select>
            <label className="row small"><input type="checkbox" checked={carry} onChange={(e) => setCarry(e.target.checked)} />Offer my placed scenes on the matching beats</label>
          </div>
        )}
      </section>

      {active.length > 0 && (
        <section className="section" aria-label="What your choices switch on">
          <h2>What your choices switch on</h2>
          <ul className="small">{active.map((a) => <li key={a}>{a}</li>)}</ul>
        </section>
      )}

      <section className="section">
        <button className="btn" onClick={() => void api.post(`/api/projects/${ctx.projectId}/setup/save-as-defaults`).then(() => setMsg('Saved as your defaults. New novels start this way; your other novels are unchanged.')).catch((e) => setError(e.message))}>Make this my starting point for new novels</button>
        <p className="small muted">Your name, toolkit, "how I use it" notes, status words and writing preferences. Genres and story types stay with this novel.</p>
      </section>
    </div></div>
  );
}

function Ingredient({ ctx, worldId, item, onSaved }: { ctx: Ctx; worldId: string | null; item: any; onSaved: () => void }) {
  const [v, setV] = useState(item.value ?? '');
  const [status, setStatus] = useState('developing');
  const [err, setErr] = useState('');
  async function keep() {
    if (!worldId || !v.trim() || v === item.value) return;
    try { await api.post(`/api/elements/${worldId}/statements`, { field: item.field, value: v.trim(), status, supersedes: status === 'established' ? 'current' : null }); onSaved(); }
    catch (e) { setErr((e as Error).message); }
  }
  return (
    <div className="row" style={{ alignItems: 'flex-start', marginBottom: '0.4rem' }}>
      <label className="field grow" style={{ margin: 0 }}><span>{item.label}. {item.prompt}</span><input type="text" value={v} onChange={(e) => setV(e.target.value)} onBlur={() => void keep()} /></label>
      <select aria-label={`${item.label} status`} value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: 'auto', marginTop: '1.4rem' }}>
        {['established', 'developing', 'illustrative'].map((k) => <option key={k} value={k}>{statusWord(ctx.settings, k)}</option>)}
      </select>
      {err && <span className="small" role="alert">{err}</span>}
    </div>
  );
}
