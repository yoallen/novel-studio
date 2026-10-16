// Narrative Zoom: move between the whole story, acts, beats, scenes and the page without losing your
// place (vertical), and follow a character, object, storyline or cause across the story (horizontal).
// Requirements: R-C-066 to R-C-073.

import { Store, Row, NotFoundError } from './store.js';
import { Brain } from './brain.js';
import { Manuscript } from './manuscript.js';
import { Structure, WORLDS } from './structure.js';
import { Ripple } from './ripple.js';
import { PLAN_FIELDS } from './writing.js';

const ACTS: Record<string, string> = { I: 'Act One', IIA: 'Act Two, first half', IIB: 'Act Two, second half', III: 'Act Three' };

export type ZoomNode =
  | { level: 'story' }
  | { level: 'act'; key: string; grouping?: 'acts' | 'worlds' }
  | { level: 'beat'; id: string }
  | { level: 'card'; id: string }
  | { level: 'element'; id: string };

export class Zoom {
  constructor(private store: Store, private brain: Brain, private ms: Manuscript, private structure: Structure, private ripple: Ripple) {}

  /** One level of the story, with its breadcrumb, its children and its connections. */
  view(projectId: string, node: ZoomNode) {
    const p = this.brain.project(projectId);
    const beats = this.structure.beats(projectId);
    const lm = this.structure.landmarks(projectId);
    const board = this.structure.board(projectId);
    const story = { label: p.title as string, node: { level: 'story' } as ZoomNode };
    const actOf = (beatId: string) => beats.find((b) => b.element.id === beatId)?.act as string | undefined;
    const crumbAct = (key: string) => ({ label: ACTS[key] ?? key, node: { level: 'act', key } as ZoomNode });

    if (node.level === 'story') {
      const grouping = 'acts';
      return {
        node, breadcrumb: [story],
        title: p.title, grouping,
        children: board.rows.map((r) => ({ node: { level: 'act', key: r.act } as ZoomNode, label: r.name, detail: `${r.beats.length} beats, ${r.beats.reduce((a, b) => a + b.cards.length, 0)} scenes planned` })),
        worlds: Object.entries(WORLDS).map(([k, w]) => ({ key: k, name: w.name, description: w.description, beats: beats.filter((b) => b.group === k && !b.element.parent_id).map((b) => b.element.title) })),
        unplaced: board.unplaced.map((c) => ({ node: { level: 'card', id: c.id } as ZoomNode, label: c.title as string })),
        hasBeats: beats.length > 0,
      };
    }
    if (node.level === 'act') {
      const row = board.rows.find((r) => r.act === node.key);
      if (!row) throw new NotFoundError('act');
      return {
        node, breadcrumb: [story, crumbAct(node.key)], title: row.name,
        children: row.beats.map((b) => {
          const l = lm.beats.find((x) => x.id === b.id);
          return { node: { level: 'beat', id: b.id } as ZoomNode, label: `${b.number ? b.number + '. ' : ''}${b.name}`, detail: l?.at.brody ? `${l.at.brody.percent.join('–')}%` : '', cards: b.cards.map((c) => ({ node: { level: 'card', id: c.id } as ZoomNode, label: c.title as string, drafted: !!c.scene })) };
        }),
      };
    }
    if (node.level === 'beat') {
      const b = beats.find((x) => x.element.id === node.id);
      if (!b) throw new NotFoundError('beat');
      const detail = this.structure.beatDetail(node.id);
      const row = board.rows.flatMap((r) => r.beats).find((x) => x.id === node.id || x.children.some((c) => c.id === node.id));
      const act = b.act as string;
      const parent = b.element.parent_id ? beats.find((x) => x.element.id === b.element.parent_id) : null;
      return {
        node, breadcrumb: [story, crumbAct(act), ...(parent ? [{ label: parent.element.title as string, node: { level: 'beat', id: parent.element.id } as ZoomNode }] : []), { label: b.element.title as string, node }],
        title: b.element.title, def: detail.def, world: detail.world, landmark: lm.beats.find((x) => x.id === node.id), fields: detail.page.fields.filter((f) => f.view.latest || f.view.unanswered.length),
        children: (row?.id === node.id ? row.cards : []).map((c) => ({ node: { level: 'card', id: c.id } as ZoomNode, label: c.title as string, drafted: !!c.scene })),
        candidates: (row?.id === node.id ? row.candidates : []).map((c) => ({ node: { level: 'card', id: c.id } as ZoomNode, label: c.title as string })),
        subBeats: beats.filter((x) => x.element.parent_id === node.id).map((x) => ({ node: { level: 'beat', id: x.element.id } as ZoomNode, label: x.element.title as string })),
      };
    }
    if (node.level === 'card') {
      const card = this.brain.element(node.id, projectId);
      const beatId = this.structure.decidedBeat(node.id);
      const b = beatId ? beats.find((x) => x.element.id === beatId) : null;
      const scene = this.store.db.prepare('SELECT id, title, word_count, status, pov_element_id, text FROM scenes WHERE plan_element_id=? AND deleted_at IS NULL').get(node.id) as Row | undefined;
      const order = this.ripple.order(projectId);
      const idx = order.findIndex((u) => u.planId === node.id);
      const links = this.brain.linksOf(node.id);
      const rel = (r: string, dir: 'in' | 'out') => links.filter((l) => l.relation === r && (dir === 'in' ? l.to_id === node.id : l.from_id === node.id)).map((l) => ({ node: { level: 'element', id: (dir === 'in' ? l.from_id : l.to_id) as string } as ZoomNode, label: (dir === 'in' ? l.from_title : l.to_title) as string }));
      const fields = PLAN_FIELDS.map((f) => ({ ...f, value: this.brain.field(node.id, f.field).latest?.value ?? null })).filter((f) => f.value != null);
      const pov = scene?.pov_element_id ? this.store.get('elements', scene.pov_element_id as string) : null;
      return {
        node, title: card.title,
        breadcrumb: [story, ...(b ? [crumbAct(b.act as string), { label: b.element.title as string, node: { level: 'beat', id: b.element.id } as ZoomNode }] : []), { label: card.title as string, node }],
        scene: scene ? { id: scene.id, title: scene.title, words: scene.word_count, status: scene.status, opening: (scene.text as string).slice(0, 400) } : null,
        pov: pov ? { node: { level: 'element', id: pov.id } as ZoomNode, label: pov.title as string } : null,
        fields,
        placement: (() => { const pl = this.structure.placements(node.id); const name = (id: string) => (this.store.get('elements', id)?.title as string) ?? ''; return { decided: pl.decided ? { ...pl.decided, name: name(pl.decided.beatId) } : null, candidates: pl.candidates.map((c) => ({ ...c, name: name(c.beatId) })) }; })(),
        position: idx >= 0 ? { index: idx + 1, of: order.length } : null,
        previous: idx > 0 && order[idx - 1]!.planId ? { node: { level: 'card', id: order[idx - 1]!.planId } as ZoomNode, label: order[idx - 1]!.title } : null,
        next: idx >= 0 && idx < order.length - 1 && order[idx + 1]!.planId ? { node: { level: 'card', id: order[idx + 1]!.planId } as ZoomNode, label: order[idx + 1]!.title } : null,
        causes: rel('causes', 'in'), consequences: rel('causes', 'out'),
        inScene: links.filter((l) => ['appears_in', 'realizes', 'part_of'].includes(l.relation as string) && l.to_id === node.id).map((l) => ({ node: { level: 'element', id: l.from_id } as ZoomNode, label: l.from_title as string, kind: l.from_kind as string })),
        reveals: rel('reveals', 'out'), plants: rel('plants', 'out'), paysOff: rel('pays_off', 'out'), dependsOn: rel('depends_on', 'out'),
      };
    }
    // Any other element: follow it across the story (horizontal zoom).
    return this.follow(projectId, node.id);
  }

  /** Follow one element through the story in story order: where it appears, what it causes, who touches it. */
  follow(projectId: string, elementId: string) {
    const el = this.brain.element(elementId, projectId);
    const { units, where } = this.ripple.placesOf(projectId);
    const links = this.brain.linksOf(elementId);
    const otherOf = (l: Row) => (l.from_id === elementId ? { id: l.to_id as string, title: l.to_title as string, kind: l.to_kind as string, phrase: `${(l.relation as string).replace(/_/g, ' ')} ${l.to_title}` } : { id: l.from_id as string, title: l.from_title as string, kind: l.from_kind as string, phrase: `${l.from_title} ${(l.relation as string).replace(/_/g, ' ')} this` });
    const posOf = (id: string) => { const u = (where.get(id) ?? [])[0]; return u ? units.findIndex((x) => x.key === u.key) + 1 : null; };
    const along = links.map((l) => ({ ...otherOf(l), relation: l.relation as string, at: posOf(otherOf(l).id) }))
      .sort((a, b) => (a.at ?? 1e9) - (b.at ?? 1e9));
    const appearances = (where.get(elementId) ?? []).map((u) => ({ node: u.planId ? ({ level: 'card', id: u.planId } as ZoomNode) : null, label: u.title, at: units.findIndex((x) => x.key === u.key) + 1 }));
    return {
      node: { level: 'element', id: elementId } as ZoomNode,
      breadcrumb: [{ label: this.brain.project(projectId).title as string, node: { level: 'story' } as ZoomNode }, { label: el.title as string, node: { level: 'element', id: elementId } as ZoomNode }],
      title: el.title, kind: el.kind,
      appearances, of: units.length,
      connections: along.map((a) => ({ node: { level: a.kind === 'scene_plan' ? 'card' : 'element', id: a.id } as ZoomNode, label: a.title, kind: a.kind, phrase: a.phrase, at: a.at })),
    };
  }

  /** "Show in Story Map": from a manuscript scene to its place in the structure (R-C-072). */
  locateScene(projectId: string, sceneId: string): ZoomNode {
    const s = this.ms.scene(sceneId);
    if (s.project_id !== projectId) throw new NotFoundError('scene');
    return s.plan_element_id ? { level: 'card', id: s.plan_element_id as string } : { level: 'story' };
  }
}
