import { useEffect, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';

// A blank novel's first page: six short questions, every one optional, kept in pencil.
// Shown once, until she plants it or says not now.
const QUESTIONS: { key: string; label: string; hint: string; long?: boolean }[] = [
  { key: 'name', label: 'Who is this story about?', hint: 'Their name, or a working name.' },
  { key: 'who', label: 'Who are they, in a sentence?', hint: 'Where they are in life when the story finds them.', long: true },
  { key: 'want', label: 'What do they want?', hint: 'Something concrete: you would know it if they got it.', long: true },
  { key: 'obstacle', label: 'What stands in the way?', hint: 'A person, a force, or something inside them.', long: true },
  { key: 'stakes', label: 'What do they stand to lose?', hint: 'If they fail, what is gone for good?', long: true },
  { key: 'ending', label: 'How might it end?', hint: 'A guess is fine. You can change it any time.', long: true },
];

export function SeedStart({ ctx, onPlanted }: { ctx: Ctx; onPlanted: () => void }) {
  const [show, setShow] = useState(false);
  const [a, setA] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  useEffect(() => {
    if (ctx.project?.profile?.seedStart) { setShow(false); return; }
    api.get(`/api/projects/${ctx.projectId}/elements?kind=character`).then((cs: any[]) => setShow(cs.length === 0)).catch(() => setShow(false));
  }, [ctx.projectId, ctx.project?.profile?.seedStart]);
  if (!show) return null;
  const any = Object.values(a).some((v) => v.trim());

  async function plant() {
    setError('');
    try { await api.post(`/api/projects/${ctx.projectId}/seed`, a); await ctx.refreshProject(); setShow(false); onPlanted(); }
    catch (e) { setError((e as Error).message); }
  }
  async function skip() { await api.post(`/api/projects/${ctx.projectId}/seed/skip`).catch(() => {}); await ctx.refreshProject(); setShow(false); }

  return (
    <section className="seed" aria-labelledby="seed-h">
      <h3 id="seed-h">Plant the seed</h3>
      <p className="small muted">Six questions to start a blank novel. Answer any you like; skip the rest. Your answers go into the Story Brain in pencil, as developing, so nothing is decided until you say so.</p>
      {error && <div className="notice error" role="alert">{error}</div>}
      <div className="seed-qs">
        {QUESTIONS.map((q) => (
          <label key={q.key} className="field">
            <span>{q.label}</span>
            {q.long
              ? <textarea rows={2} value={a[q.key] ?? ''} onChange={(e) => setA({ ...a, [q.key]: e.target.value })} placeholder={q.hint} />
              : <input type="text" value={a[q.key] ?? ''} onChange={(e) => setA({ ...a, [q.key]: e.target.value })} placeholder={q.hint} maxLength={80} />}
          </label>
        ))}
      </div>
      <div className="row">
        <button className="btn" disabled={!any} onClick={() => void plant()}>Plant it</button>
        <button className="btn link small" onClick={() => void skip()}>Not now</button>
      </div>
    </section>
  );
}
