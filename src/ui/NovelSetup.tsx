import { Pages } from './Pages';
import { useEffect, useRef, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';
import { statusWord } from './status';
import { groupTitle } from '../core/groupnames';

/** A tone that usually goes with a genre, so a book ticked Comic can be asked whether it is a Comedy. */
const TONE_GENRE: Record<string, string> = { comic_tone: 'comedy', romantic_tone: 'romance', suspenseful: 'suspense' };
const kindWords: Record<string, string> = { character: 'each character', arc: 'each arc', scene_plan: 'each scene card', storyworld: 'the story world', beat: 'each beat', clue: 'each clue', location: 'each place', relationship: 'each relationship' };

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
  const [adding, setAdding] = useState<string | null>(null);
  const [customFw, setCustomFw] = useState('');
  const [carry, setCarry] = useState(true);
  const [savedAt, setSavedAt] = useState('');
  const load = () => Promise.all([api.get(`/api/projects/${ctx.projectId}/setup`), api.get(`/api/projects/${ctx.projectId}/setup/active`)]).then(([s, a]) => { setD(s); setActive(a); }).catch((e) => setError(e.message));
  useEffect(() => { void load(); }, [ctx.projectId]);
  // Quick clicks build on each other: each change starts from the newest choices, not the last answer the
  // service sent back, and an older answer never overwrites a newer choice.
  const latest = useRef<any>(null);
  const seq = useRef(0);
  async function save(patch: Record<string, unknown>, note = '') {
    setError(''); setMsg('');
    latest.current = { ...(latest.current ?? d.setup), ...patch };
    setD((x: any) => (x ? { ...x, setup: latest.current } : x));
    const mine = ++seq.current;
    try { const res = await api.patch(`/api/projects/${ctx.projectId}/setup`, patch); if (mine !== seq.current) return; latest.current = null; setD(res); setActive(await api.get(`/api/projects/${ctx.projectId}/setup/active`)); if (note) setMsg(note); setSavedAt(new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit' })); await ctx.refreshProject(); }
    catch (e) { setError((e as Error).message); }
  }
  if (!d) return <div className="content muted">{error || 'Opening…'}</div>;
  const s = latest.current ?? d.setup;
  const genreOf = (k: string) => s.genres.find((g: any) => g.key === k);
  const setGenre = (key: string, name: string, role: string | null) => save({ genres: role ? (genreOf(key) ? s.genres.map((g: any) => (g.key === key ? { ...g, role } : g)) : [...s.genres, { key, name, role }]) : s.genres.filter((g: any) => g.key !== key) });
  const typeOf = (k: string) => s.storyTypes.find((t: any) => t.key === k);
  const setType = (key: string, role: string | null) => save({ storyTypes: role ? (typeOf(key) ? s.storyTypes.map((t: any) => (t.key === key ? { ...t, role } : t)) : [...s.storyTypes, { key, role }]) : s.storyTypes.filter((t: any) => t.key !== key) });
  const fw: string[] = d.frameworks;
  const allFw = [...d.catalog.frameworks, ...s.customFrameworks.map((f: any) => ({ ...f, kind: 'custom' }))];
  const structures = fw.filter((k) => d.catalog.frameworks.find((f: any) => f.key === k)?.kind === 'structure');
  const groupInfo: Record<string, { about: string; one?: boolean }> = Object.fromEntries((d.catalog.characteristicGroups ?? []).map((g: any) => [g.name, g]));
  const groupList = [...new Set([...(d.catalog.characteristicGroups ?? []).map((g: any) => g.name), ...d.catalog.characteristics.map((c: any) => c.group), ...s.customCharacteristics.map((c: any) => c.group)])] as string[];
  const chars = [...d.catalog.characteristics, ...s.customCharacteristics.map((c: any) => ({ ...c, custom: true }))];

  return (
    <div className="scroll"><div className="content" style={{ maxWidth: 980 }}>
      <button className="btn link small" onClick={() => ctx.go('settings')}>Settings</button>
      <h1>How {d.title} is set up</h1>
      <p className="muted">Every list here is optional and can change whenever the story does. What you choose decides which fields, views and questions the program offers this novel. Nothing you have written is ever hidden or removed by a change here.</p>
      <p className="small muted">Every choice here is kept the moment you make it. There is nothing else to save.</p>
      {error && <div className="notice error" role="alert">{error}</div>}
      {msg && <div className="notice" role="status">{msg}</div>}

      <Pages storeKey={`setup:${ctx.projectId}`} label="Novel setup" pages={[
        { title: 'The heart of the book', content: (<>
      <section className="section setup-heart" aria-label="The heart of the book">
        <h2>The heart of the book</h2>
        <p className="small muted">The one sentence and the one paragraph live in the story world. Change them here or there; it is the same place.{' '}
          {d.storyWorldId && <button className="btn link small" onClick={() => { try { sessionStorage.setItem('ns-brain-sel', JSON.stringify({ kind: 'element', id: d.storyWorldId })); } catch { /* ignore */ } ctx.go('brain'); }}>Open the story world</button>}</p>
        <label className="field"><span>The one sentence {d.premiseStatus && <span className="fact-status" data-s={d.premiseStatus}>{statusWord(ctx.settings, d.premiseStatus)}</span>}</span>
          <textarea rows={2} defaultValue={d.premise} key={`p-${d.premise}`} aria-label="The one sentence" placeholder="The whole book, squeezed until only its central irony is left." onBlur={(e) => { if (e.target.value.trim() && e.target.value !== d.premise) void save({ premise: e.target.value }); }} /></label>
        <label className="field"><span>The one paragraph {d.paragraphStatus && <span className="fact-status" data-s={d.paragraphStatus}>{statusWord(ctx.settings, d.paragraphStatus)}</span>}</span>
          <textarea rows={4} defaultValue={d.paragraph} key={`q-${d.paragraph}`} aria-label="The one paragraph" placeholder="Setup, three disasters, and the ending, one sentence each." onBlur={(e) => { if (e.target.value.trim() && e.target.value !== d.paragraph) void save({ paragraph: e.target.value }); }} /></label>
      </section>

        </>) },
        { title: 'Genres', content: (<>
      <section className="section" aria-label="Genres">
        <h2>Genres</h2>
        <p className="small muted">Conventional genres. Mark one or more as primary, secondary, or an influence you borrow from without taking on its conventions.</p>
        <div className="cols" style={{ gap: '0.25rem 1.5rem', alignItems: 'start' }}>
          {[...d.catalog.genres, ...s.genres.filter((g: any) => g.custom)].map((g: any) => {
            const cur = genreOf(g.key);
            return (
              <div key={g.key} className="row" style={{ alignItems: 'start' }}>
                <label className="choice grow"><input type="checkbox" aria-label={g.name} aria-describedby={g.about ? `about-g-${g.key}` : undefined} checked={!!cur} onChange={(e) => void setGenre(g.key, g.name, e.target.checked ? 'secondary' : null)} /><span>{g.name}{g.custom && <span className="chip">yours</span>}{g.about && <small id={`about-g-${g.key}`}>{g.about}</small>}</span></label>
                {cur && <select aria-label={`${g.name} role`} value={cur.role} onChange={(e) => void setGenre(g.key, g.name, e.target.value)} style={{ width: 'auto' }}>{Object.entries(ROLE_NAMES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>}
              </div>
            );
          })}
        </div>
        <form className="row" style={{ marginTop: '0.5rem' }} onSubmit={(e) => { e.preventDefault(); if (customGenre.trim()) { void setGenre('', customGenre.trim(), 'secondary'); setCustomGenre(''); } }}>
          <input type="text" value={customGenre} onChange={(e) => setCustomGenre(e.target.value)} placeholder="A genre or subgenre of your own" aria-label="Your own genre" style={{ maxWidth: 320 }} />
          <button className="btn small" type="submit" disabled={!customGenre.trim()}>Add</button>
        </form>
        {Object.entries(TONE_GENRE).filter(([t, g]) => s.characteristics.includes(t) && !genreOf(g)).map(([t, g]) => {
          const genre = d.catalog.genres.find((x: any) => x.key === g); const tone = d.catalog.characteristics.find((x: any) => x.key === t);
          return genre && tone ? (
            <p key={t} className="setup-ask small">Your tone is {tone.name}, but {genre.name} is not ticked as a genre. If this book is a {genre.name.toLowerCase()}, tick it so its questions and tools come on. <button className="btn link small" onClick={() => void setGenre(g, genre.name, 'primary')}>Mark {genre.name} as the primary genre</button></p>
          ) : null;
        })}
        {d.asks.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <h3 className="small" style={{ margin: '0 0 0.25rem' }}>What these genres ask of your story</h3>
            <ul className="small" style={{ margin: 0 }}>{d.asks.map((a: any) => <li key={a.question}><span className="muted">{a.genre}:</span> {a.question}</li>)}</ul>
          </div>
        )}
      </section>

        </>) },
        { title: 'Story types', content: (<>
      <section className="section" aria-label="Story types">
        <h2>Story types <span className="group-from">(Blake Snyder, Save the Cat)</span></h2>
        <p className="small muted">A separate list from genre, with its own roles. Each type names three ingredients your story needs. Tick one and a place to write each ingredient appears below.</p>
        <div className="cols" style={{ gap: '0.25rem 1.5rem' }}>
          {d.catalog.storyTypes.map((t: any) => {
            const cur = typeOf(t.key);
            return (
              <div key={t.key}>
                <div className="row">
                  <label className="row grow"><input type="checkbox" checked={!!cur} onChange={(e) => void setType(t.key, e.target.checked ? 'secondary' : null)} />{t.name}</label>
                  {cur && <select aria-label={`${t.name} role`} value={cur.role} onChange={(e) => void setType(t.key, e.target.value)} style={{ width: 'auto' }}>{Object.entries(ROLE_NAMES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>}
                </div>
                <div className="small faint" style={{ paddingLeft: '1.6rem' }}>{t.about}{t.needs?.length ? <> <span className="needs">Needs: {t.needs.map((n: string, i: number) => (i ? n.charAt(0).toLowerCase() + n.slice(1) : n)).join(', ')}.</span></> : null}</div>
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

        </>) },
        { title: 'How the story is told', content: (<>
      <section className="section" aria-label="Narrative characteristics">
        <h2>How the story is told</h2>
        <p className="small muted">Everything about the book apart from its genre: viewpoint, tense, setting, readership, tone and more. Some choices switch on tools, shown beside them. Each group takes your own entries too.</p>
        <div className="setup-groups">
          {groupList.map((g) => {
            const one = !!groupInfo[g]?.one;
            const inGroup = chars.filter((c: any) => c.group === g);
            const choose = (key: string, on: boolean) => {
              const others = one ? inGroup.map((c: any) => c.key).filter((k: string) => k !== key) : [];
              const next = on ? [...s.characteristics.filter((x: string) => !others.includes(x)), key] : s.characteristics.filter((x: string) => x !== key);
              return save({ characteristics: next });
            };
            return (
              <fieldset key={g} className="setup-group" data-long={inGroup.length > 10 || undefined}>
                <legend>{g}</legend>
                {groupInfo[g]?.about && <p className="small muted">{groupInfo[g].about}{one ? ' One choice.' : ''}</p>}
                <div className="setup-options">
                  {inGroup.map((c: any) => (
                    <label key={c.key} className="choice" style={{ padding: '0.15rem 0' }}>
                      <input type={one ? 'radio' : 'checkbox'} aria-label={c.name} aria-describedby={c.about ? `about-c-${c.key}` : undefined} name={one ? `group-${g}` : undefined} checked={s.characteristics.includes(c.key)} onChange={(e) => void choose(c.key, e.target.checked)} onClick={(e) => { if (one && s.characteristics.includes(c.key)) { e.preventDefault(); void choose(c.key, false); } }} />
                      <span>{c.name}{c.custom && <span className="chip">yours</span>}{c.about && <small id={`about-c-${c.key}`}>{c.about}</small>}{c.turnsOn && <small className="turns-on">Turns on: {c.turnsOn}</small>}</span>
                    </label>
                  ))}
                </div>
                {adding === g ? (
                  <form className="row" style={{ marginTop: '0.35rem' }} onSubmit={(e) => { e.preventDefault(); const name = customChar.trim(); if (!name) return; const key = `custom_${`${g}_${name}`.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 60)}`; void save({ customCharacteristics: [...s.customCharacteristics.filter((x: any) => x.key !== key), { key, name, group: g }] }).then(() => choose(key, true)); setCustomChar(''); setAdding(null); }}>
                    <input type="text" autoFocus value={customChar} onChange={(e) => setCustomChar(e.target.value)} placeholder={`Your own, under ${g}`} aria-label={`Your own ${g.toLowerCase()}`} style={{ maxWidth: 240 }} />
                    <button className="btn small" type="submit" disabled={!customChar.trim()}>Add</button>
                    <button className="btn link small" type="button" onClick={() => { setAdding(null); setCustomChar(''); }}>Cancel</button>
                  </form>
                ) : <button className="btn link small" onClick={() => { setAdding(g); setCustomChar(''); }}>Add your own</button>}
              </fieldset>
            );
          })}
        </div>
      </section>

        </>) },
        { title: 'My storytelling toolkit', content: (<>
      <section className="section" aria-label="Storytelling toolkit">
        <h2>My storytelling toolkit</h2>
        <p className="small muted">The frameworks and methods you use for this novel. None is required, and using several together is deliberate, never a conflict. Say what job each one does for you.</p>
        {allFw.map((f: any) => {
          const on = fw.includes(f.key);
          return (
            <div key={f.key} style={{ borderTop: '1px solid var(--line)', padding: '0.5rem 0' }}>
              <label className="choice">
                <input type="checkbox" checked={on} onChange={(e) => void save({ frameworks: e.target.checked ? [...fw, f.key] : fw.filter((x) => x !== f.key) }, e.target.checked && f.kind === 'structure' && !structures.length ? `${f.name} is now the beat sheet for this novel.` : '')} />
                <span><strong>{f.name}</strong>{f.own && <> <span className="chip">yours</span> <button type="button" className="btn link small" onClick={(e) => { e.preventDefault(); ctx.go('methods'); }}>Edit</button></>}<small>{f.job}</small>{f.fieldGroups?.length > 0 && <small className="turns-on">Adds: {f.fieldGroups.map((g: any) => `${groupTitle(g.group)} on ${kindWords[g.kind] ?? `each ${String(g.kind).replace(/_/g, ' ')}`}`).join('; ')}</small>}{on && f.questions?.length > 0 && <small>Asks: {f.questions.join(' ')}</small>}</span>
              </label>
              {on && <label className="field" style={{ margin: '0.4rem 0 0 1.6rem' }}><span>How I use it <span className="faint small">(your own note, yours to change)</span></span><textarea rows={2} defaultValue={s.frameworkNotes[f.key] ?? ''} placeholder="What this method does for you in this book" onBlur={(e) => { if (e.target.value !== (s.frameworkNotes[f.key] ?? '')) void save({ frameworkNotes: { [f.key]: e.target.value } }); }} /></label>}
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

        </>) },
        { title: 'What your choices switch on', hidden: active.length === 0, content: (

        <section className="section" aria-label="What your choices switch on">
          <h2>What your choices switch on</h2>
          <ul className="small">{active.map((a) => <li key={a}>{a}</li>)}</ul>
        </section>
              ) },
      ]} />

      <div className="save-bar" role="region" aria-label="Saving">
        <span aria-live="polite" className="save-bar-status">{savedAt ? `Saved at ${savedAt}. Every choice saves as you make it.` : 'Every choice saves as you make it.'}</span>
      </div>

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
