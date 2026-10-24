import { rng, stroke } from './penGeometry';
import { Chair } from './Ink';

// The push, on its own: how far she is into the push's word goal, and nothing else. It never names a beat;
// where she is in the story is the book map's job, at the top of Where was I?.

const n = (x: number) => x.toLocaleString();

type Day = { day: string; words: number; future?: boolean; today?: boolean; set?: boolean; goal?: number | null };

/** Where each day ended, as a share of the goal. A day that cut words never walks her backwards. */
function ends(days: Day[], goal: number) {
  let run = 0, far = 0;
  return days.map((d) => { if (!d.future) { run += d.words; far = Math.max(far, run); } return { ...d, t: far / goal }; });
}

/** The ruled line: one pen line from the first word of the push to its goal. Nothing on it is about the story. */
export function PushLine({ r, name, said }: { r: any; name: string; said: (d: any) => string }) {
  const goal: number = r.goal, total = Math.max(0, r.total);
  const W = 700, H = 150, x0 = 28, x1 = 560, y = 84;
  const rr = rng(`${r.start}${name}`);
  const share = total / goal, over = share > 1;
  const xAt = (t: number) => x0 + Math.min(t, 1) * (x1 - x0) + (t > 1 ? Math.min(110, (t - 1) * (x1 - x0)) : 0);
  const pts = (a: number, b: number) => { const out: [number, number][] = []; for (let i = 0; i <= 24; i++) { const t = a + (b - a) * (i / 24); out.push([xAt(t), y + Math.sin(t * 9) * 1.6]); } return out; };
  const e = ends(r.days, goal);
  const ticks = e.filter((d) => !d.future && d.words > 0 && !d.today);
  const chairs = e.filter((d) => !d.future && d.set && d.goal === 0);
  const dayNo = r.days.findIndex((d: any) => d.today) + 1;
  const hx = xAt(share);
  const marks: [number, string][] = [[0.25, 'a quarter'], [0.5, 'halfway'], [0.75, 'three quarters']];
  const hereText = r.status === 'ahead' ? `${name} starts here` : over ? `${n(total)} words, ${n(total - goal)} extra` : r.status === 'ended' ? 'where you finished' : dayNo > 0 ? `you are here, day ${dayNo}` : 'you are here';
  return (
    <svg className="pen-drawing push-line" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${name}: ${n(total)} of ${n(goal)} words${over ? ', past the goal' : ''}.`}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {share < 1 && <path className="pen-pencil" d={stroke(pts(share, 1), rr)} strokeWidth={1.2} strokeDasharray="1 4" />}
        {share > 0 && <path className="pen-ink" d={stroke(pts(0, share), rr)} strokeWidth={1.8} />}
        <path className="pen-ink" d={`M${x0} ${y - 7} L${x0} ${y + 7}`} strokeWidth={1.3} />
        <path className={share >= 1 ? 'pen-ink' : 'pen-pencil'} d={`M${x1} ${y - 9} L${x1} ${y + 9}`} strokeWidth={1.5} />
        {marks.map(([t]) => <path key={t} className={share >= t ? 'pen-ink' : 'pen-pencil'} d={`M${xAt(t)} ${y - 6} L${xAt(t)} ${y + 2}`} strokeWidth={1.1} />)}
        {ticks.map((d) => <g key={d.day}><path className="pen-plum" d={`M${xAt(d.t)} ${y + 5} L${xAt(d.t)} ${y + 11}`} strokeWidth={0.9} /><path d={`M${xAt(d.t)} ${y - 4} L${xAt(d.t)} ${y + 16}`} stroke="transparent" strokeWidth={9}><title>{said(d)}</title></path></g>)}
      </g>
      {marks.map(([t, l]) => <text key={l} className={share >= t ? 'pen-ink-text' : 'pen-pencil-text'} x={xAt(t)} y={y - 14} fontSize={27} textAnchor="middle">{l}</text>)}
      <text className="pen-ink-text" x={x1} y={y - 20} fontSize={32} textAnchor="middle">goal, {n(goal)} words</text>
      {chairs.map((d) => <Chair key={d.day} x={xAt(d.t) - 22} y={y + 50} title={said(d)} />)}
      <circle className="here" cx={hx} cy={y + Math.sin(Math.min(share, 1) * 9) * 1.6} r={5.5} />
      <path className="pen-pink" d={`M${hx + 4} ${y + 14} q8 12 26 16`} fill="none" strokeWidth={1} />
      <text className="here-lbl" x={Math.min(hx + 34, W - hereText.length * 12)} y={y + 40} fontSize={28}>{hereText}</text>
    </svg>
  );
}
