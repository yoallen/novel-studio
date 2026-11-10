import { useEffect, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';

// Remind me: the story's memory and the craft, beside the page. It only reads; nothing she writes is touched,
// and she never has to leave the scene. Each answer links to where its full page lives, for when she wants more.

type Topic = 'characters' | 'voice' | 'storylines' | 'knows' | 'decided' | 'promises' | 'next' | 'beat' | 'beats' | 'scene';

const QUESTIONS: Record<Topic, string> = {
  characters: 'Who are my characters?',
  voice: 'Whose voice is this?',
  storylines: 'Where did I leave a storyline?',
  knows: 'What does my viewpoint character know right now?',
  decided: 'What did I decide about…',
  promises: 'What did I promise the reader?',
  next: 'What comes next in my plan?',
  beat: 'What does this beat need?',
  beats: 'Remind me about a beat…',
  scene: 'What makes a scene work?',
};

export function RemindMe({ ctx, sceneId, onShowPlan }: { ctx: Ctx; sceneId: string; onShowPlan: () => void }) {
  const [menu, setMenu] = useState<any>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [beatId, setBeatId] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => { api.get(`/api/scenes/${sceneId}/remind/menu`).then(setMenu).catch((e) => setError(e.message)); }, [sceneId]);
  useEffect(() => {
    setData(null); setError('');
    if (!topic || topic === 'decided') return;
    const url = topic === 'beat' && beatId ? `/api/scenes/${sceneId}/remind/beat?beat=${beatId}` : `/api/scenes/${sceneId}/remind/${topic}`;
    api.get(url).then(setData).catch((e) => setError(e.message));
  }, [topic, beatId, sceneId]);
  // What did I decide about: looks as she types, after a short pause.
  useEffect(() => {
    if (topic !== 'decided') return;
    const t = window.setTimeout(() => {
      if (q.trim().length < 2) { setData(null); return; }
      api.get(`/api/scenes/${sceneId}/remind/decided?q=${encodeURIComponent(q.trim())}`).then(setData).catch((e) => setError(e.message));
    }, 300);
    return () => window.clearTimeout(t);
  }, [q, topic, sceneId]);

  const open = (t: Topic, beat?: string) => { setBeatId(beat ?? null); setTopic(t); };
  const back = () => { setTopic(null); setBeatId(null); setQ(''); };
  const openRecord = (id: string) => { try { sessionStorage.setItem('ns-brain-sel', JSON.stringify({ kind: 'element', id })); } catch { /* ignore */ } ctx.go('brain'); };
  const pov = menu?.povName as string | null | undefined;

  const ask = (t: Topic, title: string, hint?: string | null, beat?: string) => (
    <li><button className="remind-q" onClick={() => open(t, beat)}>{title}</button>{hint && <span className="remind-hint">{hint}</span>}</li>
  );

  return (
    <div className="remind">
      <h2 className="remind-head">Remind me</h2>
      <p className="small muted remind-sub">Your story and your craft, without leaving the page.</p>
      {error && <div className="notice error small">{error}</div>}
      {!topic ? (
        <>
          <p className="remind-group">Your story</p>
          <ul className="remind-list">
            {ask('characters', 'Remind me, who are my characters?')}
            {ask('voice', 'Whose voice is this?', menu?.voice ?? 'No viewpoint set for this scene yet.')}
            {ask('storylines', 'Where did I leave a storyline?')}
            {ask('knows', pov ? `What does ${pov.split(' ')[0]} know right now?` : QUESTIONS.knows, pov ? `${pov} is this scene's viewpoint character.` : null)}
            {ask('decided', QUESTIONS.decided)}
            {ask('promises', QUESTIONS.promises, 'Setups still waiting for their payoff.')}
            {ask('next', QUESTIONS.next)}
          </ul>
          <p className="remind-group">Your craft</p>
          <ul className="remind-list">
            {menu?.beat && ask('beat', `What does this beat need? ${menu.beat.name}`, `This scene is placed on the ${menu.beat.name}${menu.beat.decided ? '' : ', for now'}.`, menu.beat.id)}
            {menu?.hasBeats && ask('beats', QUESTIONS.beats)}
            {ask('scene', QUESTIONS.scene)}
          </ul>
          <p className="small faint remind-keys">Ctrl+Shift+M opens and closes Remind me from the page.</p>
        </>
      ) : (
        <div className="remind-answer">
          <button className="btn link small remind-back" onClick={back}>← All reminders</button>
          {topic === 'characters' && <Characters data={data} openRecord={openRecord} />}
          {topic === 'voice' && <Voice data={data} openRecord={openRecord} onShowPlan={onShowPlan} />}
          {topic === 'storylines' && <Storylines data={data} />}
          {topic === 'knows' && <Knows data={data} />}
          {topic === 'decided' && <Decided q={q} setQ={setQ} data={data} openRecord={openRecord} />}
          {topic === 'promises' && <Promises data={data} />}
          {topic === 'next' && <Next data={data} />}
          {topic === 'beat' && <Beat data={data} showBeat={ctx.showBeat} />}
          {topic === 'beats' && <BeatList data={data} pick={(id) => open('beat', id)} />}
          {topic === 'scene' && <SceneWork data={data} onShowPlan={onShowPlan} />}
        </div>
      )}
    </div>
  );
}

const Loading = () => <p className="small faint">Looking…</p>;
const H = ({ children }: { children: React.ReactNode }) => <h3 className="remind-title">{children}</h3>;
const Label = ({ children }: { children: React.ReactNode }) => <p className="remind-group">{children}</p>;

function Characters({ data, openRecord }: { data: any[] | null; openRecord: (id: string) => void }) {
  return (<>
    <H>Who are my characters?</H>
    {!data ? <Loading /> : data.length === 0 ? <p className="small muted">No characters yet. Add them in the Story Brain, under Characters, and they show here.</p> : (
      <ul className="remind-people">
        {data.map((c) => (
          <li key={c.id}>
            <div className="remind-name"><b>{c.title}</b>{(c.role || c.importance) && <span className="small muted">{c.role ?? c.importance}</span>}</div>
            {c.essence ? <div className="remind-line">{c.essence}</div> : <div className="small faint">Who they are is still blank.</div>}
            <button className="btn link small" onClick={() => openRecord(c.id)}>Open in the Story Brain</button>
          </li>
        ))}
      </ul>
    )}
    {data && data.length > 0 && <p className="small faint">The line under each name is their Who they are, on the first page of their record.</p>}
  </>);
}

function Voice({ data, openRecord, onShowPlan }: { data: any; openRecord: (id: string) => void; onShowPlan: () => void }) {
  if (!data) return <><H>Whose voice is this?</H><Loading /></>;
  const first = data.pov?.title?.split(' ')[0];
  return (<>
    <H>Whose voice is this?</H>
    <Label>This scene</Label>
    {!data.pov && !data.person && !data.tense ? (
      <p className="small muted">No viewpoint is set for this scene or its chapter yet, so there is nothing to remind you of. It only matters if you work that way. To set it, open the scene plan and turn to its page 2, About it.</p>
    ) : (
      <dl className="remind-facts">
        {data.pov && <><dt>Viewpoint</dt><dd><b>{data.pov.title}</b></dd></>}
        {data.narrator && <><dt>Narrator</dt><dd>{data.narrator.title}</dd></>}
        {data.person && <><dt>Person</dt><dd>{data.person}</dd></>}
        {data.tense && <><dt>Tense</dt><dd>{data.tense}</dd></>}
        {data.distance && <><dt>Distance</dt><dd>{data.distance}</dd></>}
      </dl>
    )}
    {data.from === 'chapter' && <p className="small faint">Set for {data.chapter}, so every scene in it follows unless a scene says otherwise.</p>}
    {data.sounds && (data.sounds.accent || data.sounds.habits.length > 0 || data.sounds.languages.length > 0) && (<>
      <Label>How {first} sounds</Label>
      {data.sounds.accent && <p className="remind-line">{data.sounds.accent}</p>}
      {data.sounds.habits.length > 0 && <ul className="remind-bullets">{data.sounds.habits.map((h: string, i: number) => <li key={i}>{h}</li>)}</ul>}
      {data.sounds.languages.length > 0 && <p className="small muted">Speaks: {data.sounds.languages.join(', ')}</p>}
    </>)}
    {data.pov && data.sounds && !data.sounds.accent && data.sounds.habits.length === 0 && <p className="small faint">{first}'s Language and voice is still blank in the Story Brain.</p>}
    <div className="remind-links">
      {data.pov && <button className="btn link small" onClick={() => openRecord(data.pov.id)}>Open {first}'s record in the Story Brain</button>}
      <button className="btn link small" onClick={onShowPlan}>Open the scene plan</button>
    </div>
  </>);
}

function Storylines({ data }: { data: any[] | null }) {
  return (<>
    <H>Where did I leave a storyline?</H>
    {!data ? <Loading /> : data.length === 0 ? <p className="small muted">No storylines yet. Add them in the Story Brain, under Storylines, and connect the scene cards that move each one (advances).</p> : (
      <ul className="remind-people">
        {data.map((s) => (
          <li key={s.id}>
            <div className="remind-name"><b>{s.letter ? `${s.letter}: ` : ''}{s.title}</b>{s.state && <span className="small muted">{s.state}</span>}</div>
            <div className="remind-line">{s.last ? <>Last moved in <i>{s.last.title}</i>.</> : 'Has not moved yet at this point in the book.'}</div>
            <div className="small muted">{s.next ? <>Next planned: <i>{s.next.title}</i>.</> : s.moves ? 'No later scene is planned to move it yet.' : 'No scene card moves it yet.'}</div>
          </li>
        ))}
      </ul>
    )}
    <p className="small faint">From Narrative Zoom, Continuity checks, Storylines.</p>
  </>);
}

function Knows({ data }: { data: any }) {
  if (!data) return <><H>What does she know right now?</H><Loading /></>;
  if (!data.character) return <><H>What does my viewpoint character know right now?</H><p className="small muted">This scene has no viewpoint character yet, so there is no one to ask about. Set one in the scene plan, on its page 2, About it.</p></>;
  const n = data.character.title.split(' ')[0];
  return (<>
    <H>What does {n} know right now?</H>
    {data.knows.length === 0 ? <p className="small muted">Nothing on record yet that {n} has learned by this scene.</p> : (
      <ul className="remind-bullets">{data.knows.map((k: any, i: number) => <li key={i}><b>{k.how === 'knows' ? 'Knows' : k.how === 'suspects' ? 'Suspects' : 'Believes, wrongly'}:</b> {k.title}{k.since ? <span className="small muted"> (since {k.since})</span> : null}</li>)}</ul>
    )}
    {data.ahead.length > 0 && (<>
      <Label>Not yet. {n} learns these later</Label>
      <ul className="remind-bullets">{data.ahead.map((k: any, i: number) => <li key={i}>{k.title} <span className="small muted">(in {k.at})</span></li>)}</ul>
      <p className="small faint">Careful here: {n} can't act on these yet.</p>
    </>)}
    <p className="small faint">From Narrative Zoom, Continuity checks, Who knows what.</p>
  </>);
}

function Decided({ q, setQ, data, openRecord }: { q: string; setQ: (s: string) => void; data: any[] | null; openRecord: (id: string) => void }) {
  return (<>
    <H>What did I decide about…</H>
    <input type="search" className="remind-search" autoFocus placeholder="A name, a place, a word" aria-label="What did I decide about" value={q} onChange={(e) => setQ(e.target.value)} />
    {q.trim().length >= 2 && (!data ? <Loading /> : data.length === 0 ? <p className="small muted">Nothing Decided mentions "{q.trim()}". It may still be Developing, or not written down yet.</p> : (
      <ul className="remind-people">
        {data.map((d, i) => (
          <li key={i}>
            <div className="remind-name"><b>{d.record}</b><span className="small muted">{d.field}</span></div>
            <div className="remind-line st" data-s="established">{d.value}</div>
            <button className="btn link small" onClick={() => openRecord(d.elementId)}>Open in the Story Brain</button>
          </li>
        ))}
      </ul>
    ))}
    <p className="small faint">Only what you marked Decided, newest first.</p>
  </>);
}

function Promises({ data }: { data: any[] | null }) {
  return (<>
    <H>What did I promise the reader?</H>
    {!data ? <Loading /> : data.length === 0 ? <p className="small muted">No setups planted yet. A clue in the Story Brain, connected to the scene card that plants it, shows here.</p> : (
      <ul className="remind-people">
        {data.map((c) => (
          <li key={c.id}>
            <div className="remind-name"><b>{c.title}</b></div>
            <div className="remind-line">Planted in <i>{c.planted.title}</i>.</div>
            <div className={c.paysOff ? 'small muted' : 'small remind-waiting'}>{c.paysOff ? <>Pays off in <i>{c.paysOff.title}</i>.</> : 'Still waiting for its payoff.'}</div>
          </li>
        ))}
      </ul>
    )}
    <p className="small faint">From Narrative Zoom, Continuity checks, Setups and payoffs.</p>
  </>);
}

function Next({ data }: { data: any }) {
  if (!data) return <><H>What comes next in my plan?</H><Loading /></>;
  return (<>
    <H>What comes next in my plan?</H>
    {data.beat && <p className="remind-line">This scene is on the <b>{data.beat.name}</b>{data.nextBeat ? <>. The next beat is the <b>{data.nextBeat.name}</b>.</> : '.'}</p>}
    {data.cards.length === 0 ? <p className="small muted">No planned scene is waiting after this one. Your plan in Narrative Zoom is where new scene cards go.</p> : (<>
      <Label>Planned, not written yet</Label>
      <ol className="remind-bullets">{data.cards.map((c: any) => <li key={c.id}>{c.title}{c.beat && <span className="small muted"> ({c.decided ? '' : 'might go at '}{c.beat})</span>}</li>)}</ol>
      <p className="small faint">Write any of them from the Binder, under Planned, not written yet.</p>
    </>)}
  </>);
}

function Beat({ data, showBeat }: { data: any; showBeat: (id: string) => void }) {
  if (!data) return <><H>What does this beat need?</H><Loading /></>;
  const b = data.brody;
  return (<>
    <H>What does this beat need? {data.name}</H>
    {b ? (<>
      <p className="small muted">{b.goes}{b.size ? ` ${b.size === 'single' ? 'One scene or one chapter.' : 'Several scenes or chapters.'}` : ''}</p>
      <p className="remind-line">{b.does}</p>
      {b.teach.length > 0 && <ul className="remind-bullets">{b.teach.map((x: string, i: number) => <li key={i}>{x}</li>)}</ul>}
      {b.checklist.length > 0 && (<><Label>Questions to check it</Label><ul className="remind-bullets">{b.checklist.map((x: string, i: number) => <li key={i}>{x}</li>)}</ul></>)}
    </>) : data.description ? <p className="remind-line">{data.description}</p> : <p className="small muted">This beat has no teaching of its own yet. Its page in Narrative Zoom holds what you wrote about it.</p>}
    {data.test && <p className="small"><b>The test:</b> {data.test}</p>}
    <div className="remind-links"><button className="btn link small" onClick={() => showBeat(data.id)}>Open this beat in Narrative Zoom</button></div>
    {b && <p className="small faint">Drawn from Jessica Brody's Save the Cat! Writes a Novel, in Story Canon's own words.</p>}
  </>);
}

function BeatList({ data, pick }: { data: any[] | null; pick: (id: string) => void }) {
  return (<>
    <H>Remind me about a beat…</H>
    {!data ? <Loading /> : (
      <ul className="remind-beats">{data.map((b) => <li key={b.id} className={b.sub ? 'sub' : undefined}><button className="remind-q" onClick={() => pick(b.id)}>{b.name}</button></li>)}</ul>
    )}
  </>);
}

const SCENE_TEACH: [string, string, string][] = [
  ['purpose', 'What this scene must do', 'The job it does for the book. If you cut it, what would the story lose? A scene with no job is the first one an editor cuts.'],
  ['objective', "The viewpoint character's objective", 'What they want in this scene, here and now. A scene where nobody wants anything drifts.'],
  ['conflict', 'The conflict', 'Who or what is in the way, what each side wants, and who wins. Without opposition, nothing is earned.'],
  ['outcome', 'Intended outcome or change', 'How things stand differently when it ends. Something has to be different, or the scene only marks time.'],
  ['value_start', 'Value at the start', 'What is at stake as the scene opens, and whether it stands well (+) or badly (-).'],
  ['value_end', 'Value at the end', 'Every scene turns: a + that ends -, or a - that ends +. A value that ends where it began is a scene where nothing happened.'],
  ['turning_point', 'What turns it', 'The action someone takes, or the revelation someone learns, at the moment the value changes.'],
];

function SceneWork({ data, onShowPlan }: { data: any; onShowPlan: () => void }) {
  return (<>
    <H>What makes a scene work?</H>
    <p className="remind-line">A scene is a stretch of story where someone wants something, meets opposition, and comes out changed. The scene plan asks it in these questions. Under each is what you answered for this scene.</p>
    {!data ? <Loading /> : (
      <ul className="remind-people">
        {SCENE_TEACH.map(([k, label, why]) => (
          <li key={k}>
            <div className="remind-name"><b>{label}</b></div>
            <div className="small muted">{why}</div>
            <div className="remind-line remind-yours">{data.answers[k] ?? <span className="faint">Not answered for this scene yet.</span>}</div>
          </li>
        ))}
      </ul>
    )}
    <div className="remind-links"><button className="btn link small" onClick={onShowPlan}>Open the scene plan</button></div>
  </>);
}
