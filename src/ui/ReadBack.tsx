import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';
import { currentEditor, onEditorChange, selectRange, textMap } from './flush';
import { echoes, watch, longSentences, DEFAULT_WATCH_WORDS } from '../core/revise';
import { DoorNote } from './Door';

// Read it back: hear the page, and see echoes, watch words and long sentences. It points; it never changes a word.
export function ReadBack({ ctx }: { ctx: Ctx }) {
  const [text, setText] = useState('');
  const [names, setNames] = useState<string[]>([]);
  const [watchList, setWatchList] = useState<string[]>(ctx.settings?.watchWords ?? DEFAULT_WATCH_WORDS);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const cursor = useRef<Record<string, number>>({});

  useEffect(() => {
    let timer = 0;
    let off: (() => void) | null = null;
    const attach = () => {
      off?.();
      const ed = currentEditor();
      if (!ed) return;
      const read = () => setText(textMap(ed).text);
      read();
      const h = () => { window.clearTimeout(timer); timer = window.setTimeout(read, 900); };
      ed.on('update', h);
      off = () => ed.off('update', h);
    };
    attach();
    const un = onEditorChange(attach);
    return () => { un(); off?.(); window.clearTimeout(timer); };
  }, []);
  useEffect(() => { api.get(`/api/projects/${ctx.projectId}/elements`).then((els) => setNames(els.filter((e: any) => ['character', 'location'].includes(e.kind)).flatMap((e: any) => String(e.title).split(/\s+/)))).catch(() => {}); }, [ctx.projectId]);

  const ech = useMemo(() => echoes(text, { ignore: names }).slice(0, 25), [text, names]);
  const watched = useMemo(() => watch(text, watchList), [text, watchList]);
  const long = useMemo(() => longSentences(text), [text]);
  const cycle = (key: string, ranges: [number, number][]) => {
    const i = (cursor.current[key] ?? -1) + 1;
    const r = ranges[i % ranges.length]!;
    cursor.current[key] = i % ranges.length;
    selectRange(r[0], r[1]);
  };
  async function saveWatch() {
    const list = draft.split(/[\n,]+/).map((x) => x.trim()).filter(Boolean);
    try { await api.patch(`/api/projects/${ctx.projectId}/settings`, { watchWords: list }); setWatchList(list); setEditing(false); await ctx.refreshProject(); } catch { /* keep editing */ }
  }

  return (
    <div className="readback">
      <h2 className="small" style={{ marginTop: 0 }}>Read it back</h2>
      <ReadAloud text={text} />
      <DoorNote ctx={ctx} what="echoes, watch words and long sentences">
      <section className="section" aria-label="Echoes">
        <h3 className="small">Echoes</h3>
        <p className="small muted">The same word close together. Sometimes that is rhythm; sometimes it is an echo. Click to step through them.</p>
        {ech.length === 0 ? <p className="small faint">None close together right now.</p> : (
          <div className="row small">{ech.map((e) => <button key={e.key} className="chip" onClick={() => cycle(`e:${e.key}`, e.ranges)} title={e.words.join(', ')}>{e.words[0]} ×{e.count}</button>)}</div>
        )}
      </section>
      <section className="section" aria-label="Your watch words">
        <h3 className="small">Your watch words</h3>
        {editing ? (
          <>
            <textarea rows={4} value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="Watch words, one per line or separated by commas" />
            <div className="row small"><button className="btn small" onClick={() => void saveWatch()}>Save</button><button className="btn link small" onClick={() => setEditing(false)}>Cancel</button></div>
          </>
        ) : (
          <>
            {watched.length === 0 ? <p className="small faint">None of your watch words on this page.</p> : <div className="row small">{watched.map((w) => <button key={w.phrase} className="chip" onClick={() => cycle(`w:${w.phrase}`, w.ranges)}>{w.phrase} ×{w.count}</button>)}</div>}
            <button className="btn link small" onClick={() => { setDraft(watchList.join('\n')); setEditing(true); }}>Change my list</button>
          </>
        )}
      </section>
      <section className="section" aria-label="Long sentences">
        <h3 className="small">Long sentences</h3>
        {long.length === 0 ? <p className="small faint">Nothing over 40 words.</p> : long.map((l, i) => (
          <button key={i} className="btn link small" style={{ display: 'block', textAlign: 'left' }} onClick={() => selectRange(l.range[0], l.range[1])}>{l.words} words: {l.preview}…</button>
        ))}
      </section>
      </DoorNote>
    </div>
  );
}

function ReadAloud({ text }: { text: string }) {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voice, setVoice] = useState<string>(() => { try { return localStorage.getItem('ns-voice') ?? ''; } catch { return ''; } });
  const [rate, setRate] = useState<number>(() => { try { return Number(localStorage.getItem('ns-rate') ?? '1') || 1; } catch { return 1; } });
  const [state, setState] = useState<'idle' | 'speaking' | 'paused'>('idle');
  const [follow, setFollow] = useState(true);
  useEffect(() => {
    if (!synth) return;
    const load = () => setVoices(synth.getVoices());
    load(); synth.addEventListener?.('voiceschanged', load);
    return () => { synth.removeEventListener?.('voiceschanged', load); synth.cancel(); };
  }, [synth]);
  useEffect(() => { try { localStorage.setItem('ns-voice', voice); localStorage.setItem('ns-rate', String(rate)); } catch { /* ignore */ } }, [voice, rate]);
  if (!synth) return <p className="small muted">Reading aloud is not available here.</p>;
  function speak(fromCursor: boolean) {
    synth!.cancel();
    const ed = currentEditor();
    let start = 0;
    if (fromCursor && ed) {
      const m = textMap(ed);
      const pos = ed.state.selection.from;
      for (let i = 0; i <= m.text.length; i++) { const p = m.toPos(i); if (p != null && p >= pos) { start = i; break; } }
    }
    const u = new SpeechSynthesisUtterance(text.slice(start));
    const v = voices.find((x) => x.name === voice);
    if (v) u.voice = v;
    u.rate = rate;
    u.onboundary = (e) => {
      if (!follow || e.name !== 'word') return;
      const a = start + e.charIndex;
      const len = e.charLength || (/^[\p{L}\p{N}'’]+/u.exec(text.slice(a))?.[0].length ?? 1);
      selectRange(a, a + len);
    };
    u.onend = () => setState('idle');
    u.onerror = () => setState('idle');
    synth!.speak(u);
    setState('speaking');
  }
  return (
    <section className="section" aria-label="Read aloud">
      <h3 className="small">Hear it</h3>
      <p className="small muted">Your ear catches what your eye skims: rhythm, repetition, a joke's timing, a voice that slips.</p>
      <div className="row small">
        {state === 'idle' && <><button className="btn small" onClick={() => speak(false)}>Read the scene</button><button className="btn link small" onClick={() => speak(true)}>From the cursor</button></>}
        {state === 'speaking' && <><button className="btn small" onClick={() => { synth.pause(); setState('paused'); }}>Pause</button><button className="btn link small" onClick={() => { synth.cancel(); setState('idle'); }}>Stop</button></>}
        {state === 'paused' && <><button className="btn small" onClick={() => { synth.resume(); setState('speaking'); }}>Go on</button><button className="btn link small" onClick={() => { synth.cancel(); setState('idle'); }}>Stop</button></>}
      </div>
      <div className="row small" style={{ marginTop: '0.4rem' }}>
        <select aria-label="Voice" value={voice} onChange={(e) => setVoice(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="">Default voice</option>
          {voices.map((v) => <option key={v.name} value={v.name}>{v.name}</option>)}
        </select>
        <label className="row">Speed <input type="range" min={0.6} max={1.6} step={0.1} value={rate} onChange={(e) => setRate(Number(e.target.value))} aria-label="Speed" style={{ width: 90 }} /></label>
        <label className="row"><input type="checkbox" checked={follow} onChange={(e) => setFollow(e.target.checked)} />Follow along</label>
      </div>
    </section>
  );
}
