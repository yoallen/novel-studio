import { Pages } from './Pages';
import { CoachCard } from './Coach';
import { useEffect, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';
import { DraftingProgress } from './Progress';
import { SeedStart } from './SeedStart';
import { LaterList } from './LaterList';

// "Where was I?" (R-B-018) with the Next Writing Action as the one thing that stands out (R-B-015).
export function Home({ ctx }: { ctx: Ctx }) {
  const [w, setW] = useState<any>(null);
  const [week, setWeek] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = () => Promise.all([api.get(`/api/projects/${ctx.projectId}/where-was-i`), api.get(`/api/projects/${ctx.projectId}/this-week`)])
      .then(([a, b]) => { setW(a); setWeek(b); }).catch((e) => setError(e.message));
    void load();
    // Notes from the road can arrive while this page is open.
    const f = () => void load();
    window.addEventListener('ns-captured', f);
    return () => window.removeEventListener('ns-captured', f);
  }, [ctx.projectId]);

  // A question, decision or thought opens its own record in the Story Brain.
  function openRecord(id: string) {
    try { sessionStorage.setItem('ns-brain-sel', JSON.stringify({ kind: 'element', id })); } catch { /* ignore */ }
    ctx.go('brain');
  }

  async function write() {
    if (w?.nextAction?.sceneId) { ctx.openScene(w.nextAction.sceneId); return; }
    // The next planned scene: its page is made where the plan puts it, then opened.
    if (w?.nextAction?.planId) { const s = await api.post(`/api/elements/${w.nextAction.planId}/write-scene`, {}); ctx.openScene(s.id); return; }
    // Make a place to write and go straight there: planning is never required first (R-B-013).
    const o = await api.get(`/api/projects/${ctx.projectId}/outline`);
    let chapterId = o.chapters[o.chapters.length - 1]?.id;
    if (!chapterId) chapterId = (await api.post(`/api/projects/${ctx.projectId}/chapters`, {})).id;
    const s = await api.post(`/api/chapters/${chapterId}/scenes`, {});
    ctx.openScene(s.id);
  }

  if (error) return <div className="content"><div className="notice error">{error}</div></div>;
  if (!w) return <div className="content muted">Gathering where you left off…</div>;

  return (
    <div className="scroll"><div className="content">
      <header className="home-intro">
        <h1>Where was I</h1>
        <p className="home-intro-sub">This is <em>{ctx.project?.title ?? 'your novel'}</em>'s home page.</p>
        <p className="home-intro-text">Story Canon opens here every time you come back to this book. It picks up where you left off: the next thing to write, how your words are going, notes you left for later, questions still open, and what you decided most recently. Whenever you lose your place, come back here.</p>
      </header>
      <section className="hero" aria-labelledby="next-h">
        <h2 id="next-h" className="muted small" style={{ fontFamily: 'var(--ui)', fontWeight: 400 }}>Next</h2>
        <p className="next">{w.nextAction.text}</p>
        <div className="row">
          <button className="btn write" onClick={() => void write()}>Write</button>
          {w.nextAction.detail && <span className="muted small">{w.nextAction.detail}</span>}
        </div>
      </section>

      {w.recoveries.length > 0 && (
        <div className="notice" role="status">
          Unsaved typing was kept for {w.recoveries.map((r: any) => `"${r.title}"`).join(', ')}. Open the scene to choose which version to keep.
          <div className="row" style={{ marginTop: '0.5rem' }}>{w.recoveries.map((r: any) => <button key={r.scene_id} className="btn small" onClick={() => ctx.openScene(r.scene_id)}>Open "{r.title}"</button>)}</div>
        </div>
      )}

      <Pages storeKey={`home:${ctx.projectId}`} label="Where was I" pages={[
        { title: 'Today', filled: true, content: (<>
      <BookLine ctx={ctx} />

      <SeedStart ctx={ctx} onPlanted={() => ctx.go('brain')} />

      <CoachCard ctx={ctx} />

      <DraftingProgress ctx={ctx} />

      {!ctx.project?.profile?.setup?.configured && (
        <div className="notice small" style={{ borderLeftColor: 'var(--struct)' }}>
          Whenever you like: tell the program what kind of story this is and which methods you use, and it will offer the right tools. <button className="btn link small" onClick={() => ctx.go('setup')}>Set up this novel</button>
        </div>
      )}

      {w.lastScene && (
        <section style={{ marginBottom: '2rem' }}>
          <h3>Where you stopped</h3>
          <p className="small muted">{w.lastScene.chapter}, {w.lastScene.title}</p>
          {w.lastScene.tail ? <blockquote className="tail">{w.lastScene.tail}</blockquote> : <p className="muted">This scene is still blank.</p>}
        </section>
      )}

      <LaterList ctx={ctx} limit={8} />

        </>) },
        { title: 'Still open', filled: w.openQuestions.length + w.decisions.length + w.recentCaptures.length + w.openTrail.length > 0, content: (
      <div className="cols where-cols">
        <section aria-labelledby="wq-h">
          <h3 id="wq-h">Questions still open</h3>
          {w.openQuestions.length === 0 ? <p className="muted small">None open.</p> : (
            <ul className="list where-list">{w.openQuestions.map((q: any) => (
              <li key={q.id} className="st" data-s="unanswered">
                <button className="record-link" title={q.body && q.body !== q.title ? q.body : 'Open this question to answer it'} onClick={() => openRecord(q.id)}>{q.title}</button>
              </li>
            ))}</ul>
          )}
        </section>
        <section aria-labelledby="wd-h">
          <h3 id="wd-h">Latest decisions</h3>
          {w.decisions.length === 0 ? <p className="muted small">No decisions recorded yet.</p> : (
            <ul className="list where-list">{w.decisions.map((d: any) => (
              <li key={d.id} className="st" data-s="established">
                <button className="record-link" title={`Open ${d.element_title}`} onClick={() => openRecord(d.element_id)}>{d.element_title}</button>
                <span className="decision-field">{String(d.label ?? d.field)}</span>
                <span className="decision-value">{String(d.value)}</span>
              </li>
            ))}</ul>
          )}
        </section>
        <section aria-labelledby="wt-h">
          <h3 id="wt-h">Thoughts waiting to be sorted</h3>
          {w.recentCaptures.length === 0 ? <p className="muted small">Nothing waiting. Every thought you saved has a home.</p> : (
            <ul className="list where-list">{w.recentCaptures.map((c: any) => <li key={c.id}><button className="record-link" onClick={() => openRecord(c.id)}>{c.title}</button></li>)}</ul>
          )}
          <button className="btn link small" onClick={() => ctx.go('brain')}>All questions and ideas</button>
        </section>
        {w.openTrail.length > 0 && (
          <section aria-labelledby="wdt-h">
            <h3 id="wdt-h">Detours still open</h3>
            <p className="small muted">A detour is a time you left the page. It closes when you return to writing, or when you mark it resolved in the Writing Trail.</p>
            <ul className="list where-list">{w.openTrail.slice(0, 5).map((t: any) => <li key={t.id}>{t.reason || 'Stepped away'}</li>)}</ul>
            <button className="btn link small" onClick={() => ctx.go('trail')}>Writing Trail</button>
          </section>
        )}
      </div>) },
        { title: 'This week', filled: !!week && (week.netWords > 0 || week.decisionsMade > 0 || week.scenesTouched > 0), hidden: !week, content: week ? (

          <section aria-labelledby="ww-h">
            <h3 id="ww-h">This week</h3>
            <ul className="list small">
              <li>{week.netWords.toLocaleString()} new manuscript words</li>
              <li>{week.scenesTouched} scene{week.scenesTouched === 1 ? '' : 's'} worked on</li>
              <li>{week.decisionsMade} decision{week.decisionsMade === 1 ? '' : 's'} made</li>
              <li>{week.ideasCaptured} thought{week.ideasCaptured === 1 ? '' : 's'}, question{week.ideasCaptured === 1 ? '' : 's'} or idea{week.ideasCaptured === 1 ? '' : 's'} saved, sorted or not</li>
              <li title="A connection links two records, such as a character to a scene they appear in.">{week.connectionsMade} connection{week.connectionsMade === 1 ? '' : 's'} made between records</li>
              {week.questionsAnswered > 0 && <li>{week.questionsAnswered} question{week.questionsAnswered === 1 ? '' : 's'} answered</li>}
            </ul>
          </section>
        ) : null },
      ]} />
    </div></div>
  );
}

/** Where this book stands as a whole: its stage and its draft. */
function BookLine({ ctx }: { ctx: Ctx }) {
  const [stages, setStages] = useState<string[]>([]);
  const [draft, setDraft] = useState<string>('');
  useEffect(() => {
    api.get('/api/stages').then(setStages).catch(() => {});
    api.get(`/api/projects/${ctx.projectId}/drafts`).then((d: any[]) => setDraft(d.find((x) => !x.completed_at)?.name ?? '')).catch(() => {});
  }, [ctx.projectId]);
  const stage = ctx.project?.profile?.stage ?? '';
  return (
    <div className="bookline" role="group" aria-label="This book">
      <div className="row small">
        <label className="row">Stage
          <select value={stage} onChange={(e) => void api.put(`/api/projects/${ctx.projectId}/stage`, { stage: e.target.value }).then((s: any) => { setDraft(s.draft.name); return ctx.refreshProject(); })} style={{ width: 'auto' }}>
            <option value="" disabled>Choose a stage</option>
            {[...new Set([...(stage ? [stage] : []), ...stages])].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        {draft && <span className="bookline-draft">Draft: <strong>{draft}</strong></span>}
        <button className="btn link small" onClick={() => ctx.go('drafts')}>Drafts</button>
      </div>
      <p className="small muted bookline-hint">The stage is what you are doing with the book now. The draft is which full pass of the manuscript you are on.</p>
    </div>
  );
}
