import { useEffect, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';

const KINDS: [string, string][] = [['character', 'Each character'], ['arc', 'Each character arc'], ['scene_plan', 'Each scene card'], ['beat', 'Each beat'], ['storyworld', 'The story world'], ['relationship', 'Each relationship'], ['location', 'Each place'], ['storyline', 'Each storyline'], ['set_piece', 'Each set piece']];
const STARTS: [string, string][] = [['', 'A blank page'], ['save_the_cat', 'Save the Cat'], ['heros_journey', "The Hero's Journey"], ['story_circle', 'Story Circle'], ['seven_point', 'Seven-Point Structure'], ['three_act', 'Three-Act Structure']];
const ACTS: [string, string][] = [['I', 'Act 1'], ['IIA', 'Act 2, first half'], ['IIB', 'Act 2, second half'], ['III', 'Act 3']];
const blankBeat = () => ({ name: '', at: [0, 0], act: 'I', description: '', test: '', moment: '' });

// Methods of her own, from any teacher or book. They live with her, not with one novel, so any novel can use them.
export function MethodsView({ ctx }: { ctx: Ctx }) {
  const [list, setList] = useState<any[]>([]);
  const [moments, setMoments] = useState<any[]>([]);
  const [edit, setEdit] = useState<any>(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const load = () => api.get('/api/methods').then((r) => { setList(r.methods); setMoments(r.moments); }).catch((e) => setError(e.message));
  useEffect(() => { void load(); }, []);
  const inThisBook = (key: string) => ((ctx.project?.profile?.frameworks ?? []) as string[]).includes(key);

  async function save() {
    setError(''); setMsg('');
    const beats = edit.beats.filter((b: any) => b.name.trim()).map((b: any) => ({ ...b, at: [Number(b.at[0]) / 100, Number(b.at[1] === '' ? b.at[0] : b.at[1]) / 100], moment: b.moment || null }));
    try {
      const m = await api.post('/api/methods', { key: edit.key, name: edit.name, job: edit.job, source: edit.source, beats, questions: String(edit.questionsText ?? '').split('\n').map((q) => q.trim()).filter(Boolean), fields: edit.fields.filter((f: any) => f.label.trim()) });
      if (inThisBook(m.key) && m.beats.length) await api.post(`/api/projects/${ctx.projectId}/methods/${m.key}/refresh`);
      setMsg(`${m.name} is saved.${inThisBook(m.key) ? ' This novel has been updated to match; anything placed on its beats stays where it is.' : ' Turn it on for any novel in Novel setup.'}`);
      setEdit(null); await load(); await ctx.refreshProject();
    } catch (e) { setError((e as Error).message); }
  }
  async function startFrom(key: string) {
    if (!key) { setEdit({ ...edit, beats: [blankBeat()] }); return; }
    const r = await api.get(`/api/methods/start/${key}`);
    setEdit({ ...edit, source: edit.source || r.source || '', beats: r.beats.map((b: any) => ({ ...b, at: [Math.round(b.at[0] * 1000) / 10, Math.round(b.at[1] * 1000) / 10], moment: b.moment ?? '', test: b.test ?? '' })) });
  }
  const open = (m: any) => setEdit(m ? { ...m, questionsText: m.questions.join('\n'), beats: m.beats.map((b: any) => ({ ...b, at: [Math.round(b.at[0] * 1000) / 10, Math.round(b.at[1] * 1000) / 10], moment: b.moment ?? '', test: b.test ?? '' })), fields: [...m.fields] } : { name: '', job: '', source: '', beats: [], questionsText: '', fields: [] });
  const setBeat = (i: number, patch: any) => setEdit({ ...edit, beats: edit.beats.map((b: any, j: number) => (j === i ? { ...b, ...patch } : b)) });
  const move = (i: number, d: number) => { const b = [...edit.beats]; const [x] = b.splice(i, 1); b.splice(i + d, 0, x); setEdit({ ...edit, beats: b }); };

  if (edit) return (
    <div className="scroll"><div className="content" style={{ maxWidth: 1080 }}>
      <button className="btn link small" onClick={() => setEdit(null)}>All my methods</button>
      <h1>{edit.key ? edit.name : 'A method of my own'}</h1>
      {error && <div className="notice error" role="alert">{error}</div>}
      <div className="cols">
        <label className="field"><span>Name</span><input type="text" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></label>
        <label className="field"><span>Where it comes from (teacher, book, course)</span><input type="text" value={edit.source} onChange={(e) => setEdit({ ...edit, source: e.target.value })} /></label>
      </div>
      <label className="field"><span>What it does for me</span><textarea rows={2} value={edit.job} onChange={(e) => setEdit({ ...edit, job: e.target.value })} /></label>

      <section className="section" aria-label="Beats">
        <h2>Its beats</h2>
        <p className="small muted">Leave this empty for a method that is a lens or a habit rather than a beat sheet. With beats, it can drive the board, placement and Narrative Zoom just like Save the Cat. "Lines up with" lets the program translate between it and your other beat sheets.</p>
        {!edit.beats.length && (
          <div className="row small"><span>Start from</span>{STARTS.map(([k, l]) => <button key={k} className="btn small link" onClick={() => void startFrom(k)}>{l}</button>)}</div>
        )}
        {edit.beats.map((b: any, i: number) => (
          <div key={i} className="beat-row" role="group" aria-label={`Beat ${i + 1}`}>
            <div className="row">
              <span className="faint small" style={{ width: '1.5rem' }}>{i + 1}.</span>
              <input type="text" aria-label="Beat name" placeholder="Beat name" value={b.name} onChange={(e) => setBeat(i, { name: e.target.value })} style={{ maxWidth: 220 }} />
              <label className="row small">at<input type="number" aria-label="Starts at percent" min={0} max={100} step={0.5} value={b.at[0]} onChange={(e) => setBeat(i, { at: [e.target.value, b.at[1]] })} style={{ width: 62 }} />%</label>
              <label className="row small">to<input type="number" aria-label="Ends at percent" min={0} max={100} step={0.5} value={b.at[1]} onChange={(e) => setBeat(i, { at: [b.at[0], e.target.value] })} style={{ width: 62 }} />%</label>
              <select aria-label="Act" value={b.act} onChange={(e) => setBeat(i, { act: e.target.value })} style={{ width: 'auto' }}>{ACTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
              <select aria-label="Lines up with" value={b.moment} onChange={(e) => setBeat(i, { moment: e.target.value })} style={{ width: 'auto', maxWidth: 210 }}><option value="">Lines up with… (optional)</option>{moments.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}</select>
              <span className="grow" />
              <button className="btn link small" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
              <button className="btn link small" aria-label="Move down" disabled={i === edit.beats.length - 1} onClick={() => move(i, 1)}>↓</button>
              <button className="btn link small" onClick={() => setEdit({ ...edit, beats: edit.beats.filter((_: any, j: number) => j !== i) })}>Remove</button>
            </div>
            <textarea aria-label="What this beat is" rows={2} placeholder="What this beat is and what job it does" value={b.description} onChange={(e) => setBeat(i, { description: e.target.value })} />
            <input type="text" aria-label="A test for this beat" placeholder="A test it must pass (optional)" value={b.test} onChange={(e) => setBeat(i, { test: e.target.value })} />
          </div>
        ))}
        {edit.beats.length > 0 && <button className="btn small" onClick={() => setEdit({ ...edit, beats: [...edit.beats, blankBeat()] })}>Add a beat</button>}
      </section>

      <section className="section" aria-label="Questions">
        <h2>Questions it asks of a story</h2>
        <textarea rows={4} aria-label="Questions, one per line" value={edit.questionsText} onChange={(e) => setEdit({ ...edit, questionsText: e.target.value })} placeholder="One per line. The collaborator and Novel setup will ask them." />
      </section>

      <section className="section" aria-label="Fields">
        <h2>Fields it adds</h2>
        <p className="small muted">Places to write what this method asks you to know. They appear, grouped under the method's name, in any novel that uses it.</p>
        {edit.fields.map((f: any, i: number) => (
          <div key={i} className="row">
            <select aria-label="On" value={f.kind} onChange={(e) => setEdit({ ...edit, fields: edit.fields.map((x: any, j: number) => (j === i ? { ...x, kind: e.target.value } : x)) })} style={{ width: 'auto' }}>{KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
            <input type="text" aria-label="Field name" placeholder="Field name" value={f.label} onChange={(e) => setEdit({ ...edit, fields: edit.fields.map((x: any, j: number) => (j === i ? { ...x, label: e.target.value } : x)) })} style={{ maxWidth: 240 }} />
            <input type="text" aria-label="Prompt" placeholder="A prompt (optional)" value={f.prompt ?? ''} onChange={(e) => setEdit({ ...edit, fields: edit.fields.map((x: any, j: number) => (j === i ? { ...x, prompt: e.target.value } : x)) })} className="grow" />
            <button className="btn link small" onClick={() => setEdit({ ...edit, fields: edit.fields.filter((_: any, j: number) => j !== i) })}>Remove</button>
          </div>
        ))}
        <button className="btn small" onClick={() => setEdit({ ...edit, fields: [...edit.fields, { kind: 'character', label: '', prompt: '' }] })}>Add a field</button>
      </section>

      <div className="row" style={{ position: 'sticky', bottom: 0, background: 'var(--page)', padding: '0.75rem 0', borderTop: '1px solid var(--line)' }}>
        <button className="btn write" disabled={!edit.name.trim()} onClick={() => void save()}>Save this method</button>
        <button className="btn link" onClick={() => setEdit(null)}>Cancel</button>
      </div>
    </div></div>
  );

  return (
    <div className="scroll"><div className="content">
      <button className="btn link small" onClick={() => ctx.go('setup')}>Novel setup</button>
      <h1>My methods</h1>
      <p className="muted">Methods from any teacher or book, made yours. A method can be a full beat sheet, a lens with its own questions and fields, or both. They belong to you, so every novel can use them; each novel chooses its own in Novel setup.</p>
      {error && <div className="notice error" role="alert">{error}</div>}
      {msg && <div className="notice" role="status">{msg}</div>}
      <ul className="list">
        {list.map((m) => (
          <li key={m.key} className="row">
            <button className="btn link grow" style={{ textAlign: 'left' }} onClick={() => open(m)}>{m.name}</button>
            <span className="small faint">{m.source ? `${m.source}, ` : ''}{m.beats.length ? `${m.beats.length} beats` : 'no beat sheet'}{m.fields.length ? `, ${m.fields.length} fields` : ''}{inThisBook(m.key) ? ', in this novel' : ''}</span>
          </li>
        ))}
      </ul>
      {!list.length && <p className="muted">None yet.</p>}
      <button className="btn write" onClick={() => open(null)}>Make a method of my own</button>
    </div></div>
  );
}
