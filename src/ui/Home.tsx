import { useEffect, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';

// "Where was I?" (R-B-018) with the Next Writing Action as the one thing that stands out (R-B-015).
export function Home({ ctx }: { ctx: Ctx }) {
  const [w, setW] = useState<any>(null);
  const [week, setWeek] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get(`/api/projects/${ctx.projectId}/where-was-i`), api.get(`/api/projects/${ctx.projectId}/this-week`)])
      .then(([a, b]) => { setW(a); setWeek(b); }).catch((e) => setError(e.message));
  }, [ctx.projectId]);

  async function write() {
    if (w?.nextAction?.sceneId) { ctx.openScene(w.nextAction.sceneId); return; }
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

      {w.lastScene && (
        <section style={{ marginBottom: '2rem' }}>
          <h3>Where you stopped</h3>
          <p className="small muted">{w.lastScene.chapter}, {w.lastScene.title}</p>
          {w.lastScene.tail ? <blockquote className="tail">{w.lastScene.tail}</blockquote> : <p className="muted">This scene is still blank.</p>}
        </section>
      )}

      <div className="cols">
        <section>
          <h3>Questions still open</h3>
          {w.openQuestions.length === 0 ? <p className="muted small">None open.</p> : (
            <ul className="list">{w.openQuestions.map((q: any) => <li key={q.id} className="st" data-s="unanswered">{q.title}</li>)}</ul>
          )}
        </section>
        <section>
          <h3>Latest decisions</h3>
          {w.decisions.length === 0 ? <p className="muted small">No decisions recorded yet.</p> : (
            <ul className="list">{w.decisions.map((d: any) => <li key={d.id} className="st" data-s="established"><span className="small muted">{d.element_title}, {d.field.replace(/_/g, ' ')}</span><br />{String(d.value)}</li>)}</ul>
          )}
        </section>
        <section>
          <h3>Thoughts you saved</h3>
          {w.recentCaptures.length === 0 ? <p className="muted small">Nothing waiting.</p> : (
            <ul className="list">{w.recentCaptures.map((c: any) => <li key={c.id}>{c.title}</li>)}</ul>
          )}
          <button className="btn link small" onClick={() => ctx.go('notes')}>All questions and ideas</button>
        </section>
        {w.openTrail.length > 0 && (
          <section>
            <h3>Detours still open</h3>
            <ul className="list">{w.openTrail.slice(0, 5).map((t: any) => <li key={t.id}>{t.reason || 'Stepped away'}</li>)}</ul>
            <button className="btn link small" onClick={() => ctx.go('trail')}>Writing Trail</button>
          </section>
        )}
        {week && (
          <section>
            <h3>This week</h3>
            <ul className="list small">
              <li>{week.netWords.toLocaleString()} new manuscript words</li>
              <li>{week.scenesTouched} scene{week.scenesTouched === 1 ? '' : 's'} worked on</li>
              <li>{week.decisionsMade} decision{week.decisionsMade === 1 ? '' : 's'} made</li>
              <li>{week.ideasCaptured} thought{week.ideasCaptured === 1 ? '' : 's'} captured, {week.connectionsMade} connection{week.connectionsMade === 1 ? '' : 's'} made</li>
              {week.questionsAnswered > 0 && <li>{week.questionsAnswered} question{week.questionsAnswered === 1 ? '' : 's'} answered</li>}
            </ul>
          </section>
        )}
      </div>
    </div></div>
  );
}
