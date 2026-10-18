import { useEffect, useRef, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';

/** Where each kind of capture goes, and how they differ. */
const KIND_HELP: Record<string, string> = {
  thought: 'Anything, unsorted. It waits in Captured thoughts until you file it as a question or an idea, or leave it.',
  question: 'Something you need to find out or decide. It goes to Questions I have, where you can answer it later.',
  idea: 'Something you might use: a scene, a twist, a line. It goes to Things and ideas I am thinking about.',
};

// Capture anything, instantly, exactly as typed or dictated (R-B-041, R-B-044).
// While writing it attaches to the scene and asks only one thing: needed now, or later (R-B-019).
export function CaptureDialog({ ctx, sceneId, onClose }: { ctx: Ctx; sceneId: string | null; onClose: () => void }) {
  const [text, setText] = useState('');
  const [kind, setKind] = useState<'thought' | 'question' | 'idea'>('thought');
  const [urgency, setUrgency] = useState<'later' | 'now'>('later');
  const [attach, setAttach] = useState(!!sceneId);
  const [error, setError] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  async function save() {
    if (!text.trim()) { onClose(); return; }
    try {
      if (attach && sceneId) await api.post(`/api/scenes/${sceneId}/capture`, { text, kind, urgency });
      else await api.post(`/api/projects/${ctx.projectId}/capture`, { text, kind });
      const where = kind === 'question' ? 'Questions' : kind === 'idea' ? 'Ideas' : 'Captured thoughts';
      const message = attach && sceneId ? 'Saved. It is attached to this scene, in the scene plan.' : `Saved. It waits in ${where}, in Story Brain under Questions and ideas.`;
      window.dispatchEvent(new CustomEvent('ns-captured', { detail: { message } }));
      onClose();
    } catch (e) { setError((e as Error).message); }
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="cap-h" onKeyDown={(e) => { if (e.key === 'Escape') onClose(); if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) void save(); }}>
      <div className="dialog">
        <h2 id="cap-h">Capture</h2>
        {error && <div className="notice error">{error}</div>}
        <textarea ref={ref} rows={5} value={text} onChange={(e) => setText(e.target.value)} aria-label="What's on your mind" />
        <div className="row" style={{ margin: '0.75rem 0' }} role="radiogroup" aria-label="Kind">
          {(['thought', 'question', 'idea'] as const).map((k) => (
            <label key={k} className="row small"><input type="radio" name="kind" checked={kind === k} onChange={() => setKind(k)} />{k === 'thought' ? 'Just a thought' : k === 'question' ? 'A question I have' : 'An idea I am thinking about'}</label>
          ))}
        </div>
        <p className="small muted" style={{ margin: '0 0 0.75rem' }}>{KIND_HELP[kind]}{!sceneId ? ' Captured from a scene in the Writing Room, it also asks whether you need it now or later.' : ''}</p>
        {sceneId && (
          <>
            <label className="row small" style={{ marginBottom: '0.5rem' }}><input type="checkbox" checked={attach} onChange={(e) => setAttach(e.target.checked)} />Attach to this scene</label>
            {attach && (
              <div className="row small" role="radiogroup" aria-label="When" style={{ marginBottom: '0.75rem' }}>
                <label className="row"><input type="radio" name="urg" checked={urgency === 'later'} onChange={() => setUrgency('later')} />Resolve later</label>
                <label className="row"><input type="radio" name="urg" checked={urgency === 'now'} onChange={() => setUrgency('now')} />I need this to keep writing</label>
              </div>
            )}
          </>
        )}
        <div className="row"><button className="btn write" onClick={() => void save()}>Save it</button><button className="btn" onClick={onClose}>Cancel</button><span className="faint small">Ctrl+Enter saves. Your words are kept exactly as written.</span></div>
      </div>
    </div>
  );
}
