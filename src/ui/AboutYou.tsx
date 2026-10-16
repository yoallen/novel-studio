import { useEffect, useState } from 'react';
import { api } from './api';
import { BRAND } from '../brand';

const PRONOUNS = ['she/her', 'he/him', 'they/them', 'she/they', 'he/they', 'ze/zir', 'any pronouns', 'just my name'];
const APPROACH = ['I plot first', 'I find the story as I write', 'Somewhere in between'];

/** Who the author is, in the author's own words. Asked once in the Library; always editable in Settings. */
export function AboutYou({ first, onDone }: { first?: boolean; onDone?: () => void }) {
  const [a, setA] = useState<any>(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { api.get('/api/author-profile').then((p) => setA(p.about ?? {})).catch((e) => setError(e.message)); }, []);
  if (!a) return null;
  const set = (k: string, v: string) => setA({ ...a, [k]: v });
  async function save(asked = true) {
    setError('');
    try {
      await api.patch('/api/author-profile', { about: { ...a, asked } });
      setMsg(first ? '' : 'Saved. The collaborator reads this before every conversation.');
      onDone?.();
    } catch (e) { setError((e as Error).message); }
  }
  const chips = (k: string, words: string[]) => (
    <div className="suggest" role="group" aria-label={`Suggestions`}>
      {words.map((w) => <button key={w} type="button" className="chip" aria-pressed={a[k] === w} onClick={() => set(k, w)}>{w}</button>)}
      <span className="faint small">or your own words</span>
    </div>
  );
  return (
    <section className={first ? 'section seed about' : 'section about'} aria-label="About you">
      <h2>{first ? `Before we begin, tell ${BRAND.name} about you` : 'About you'}</h2>
      <p className="small muted">Every answer is optional. It stays on this computer, goes to the collaborator only when you talk with it, and shapes nothing but how it speaks with you. Change it any time in Settings.</p>
      {error && <div className="notice error" role="alert">{error}</div>}
      {msg && <div className="notice" role="status">{msg}</div>}
      <div className="cols">
        <label className="field"><span>What should I call you?</span><input type="text" value={a.name ?? ''} onChange={(e) => set('name', e.target.value)} /></label>
        <div className="field"><label><span className="small muted">Your pronouns</span><input type="text" value={a.pronouns ?? ''} onChange={(e) => set('pronouns', e.target.value)} /></label>{chips('pronouns', PRONOUNS)}</div>
      </div>
      <div className="cols">
        <div className="field"><label><span className="small muted">How do you find your story?</span><input type="text" value={a.approach ?? ''} onChange={(e) => set('approach', e.target.value)} /></label>{chips('approach', APPROACH)}</div>
        <label className="field"><span>How long have you been writing?</span><input type="text" value={a.experience ?? ''} onChange={(e) => set('experience', e.target.value)} placeholder="Years, books finished, or this is my first" /></label>
      </div>
      <label className="field"><span>How do you like to be helped and taught?</span><textarea rows={2} value={a.helpStyle ?? ''} onChange={(e) => set('helpStyle', e.target.value)} placeholder="For example: teach the idea fully before you show me an example, and don't talk down to me." /></label>
      <label className="field"><span>Anything that drains you, or that the collaborator should stay away from?</span><textarea rows={2} value={a.avoid ?? ''} onChange={(e) => set('avoid', e.target.value)} /></label>
      <label className="field"><span>Anything else about you as a writer</span><textarea rows={2} value={a.more ?? ''} onChange={(e) => set('more', e.target.value)} /></label>
      <div className="row">
        <button className="btn write" onClick={() => void save(true)}>Save</button>
        {first && <button className="btn link" onClick={() => void save(true)}>Not now</button>}
      </div>
    </section>
  );
}
