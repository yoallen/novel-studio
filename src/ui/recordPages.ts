// A record reads like a notebook: numbered pages, each holding things that belong together.
// A page lists field groups (by their stored name) and a few special sections (names starting "@").
// Nothing is ever hidden: a group no page names lands on the last page, and "All pages" shows everything.

export interface PagePlan { title: string; items: string[] }

/** Special sections a page can hold. */
export const SPECIAL = {
  arcs: '@arcs',
  guardrails: '@guardrails',
  acrossTime: '@across-time',
  interview: '@interview',
  connections: '@connections',
  notes: '@notes',
  ownFields: '@own-fields',
} as const;

const NOTES_PAGE: PagePlan = { title: 'Notes and connections', items: [SPECIAL.notes, SPECIAL.connections, 'My fields', 'Other', SPECIAL.ownFields] };

export const PAGE_PLANS: Record<string, PagePlan[]> = {
  character: [
    { title: 'Who they are', items: ['Role in the story'] },
    { title: 'Identity', items: ['Identity', 'Beyond human'] },
    { title: 'Looks and voice', items: ['Appearance', 'Physical', 'Language and voice'] },
    { title: 'Personality', items: ['Personality', 'Traits and flaws', 'Comparisons'] },
    { title: 'Goals, motives and values', items: ['Ingermanson', 'Depth lenses'] },
    { title: 'What opposes them', items: ['Forces of antagonism'] },
    { title: 'Inner life', items: ['Psychological', 'Wound and its fallout', 'Contradiction layers'] },
    { title: 'Arc', items: [SPECIAL.arcs, SPECIAL.acrossTime] },
    { title: 'Their world and their people', items: ['Environmental', SPECIAL.connections] },
    { title: 'Interview', items: [SPECIAL.interview] },
    { title: 'Notes, guardrails and writing aids', items: [SPECIAL.notes, SPECIAL.guardrails, 'Writing aids (private)', 'Other facts', 'My fields', 'Other', SPECIAL.ownFields] },
  ],
  scene_plan: [
    { title: 'The scene', items: ['The scene', 'Around it'] },
    { title: 'When it happens', items: ['Story time', 'Timeline strand'] },
    { title: 'Who tells it', items: ['Who tells it', 'Narrator and truth'] },
    { title: 'Mood and feeling', items: ['Atmosphere', 'Emotion on the page', 'Heat'] },
    { title: 'The reader', items: ['What the reader knows', 'Reader response', 'Callbacks'] },
    { title: 'Scene and sequel', items: ['Scene and sequel'] },
    NOTES_PAGE,
  ],
  storyworld: [
    { title: 'The heart of the book', items: ['The core'] },
    { title: 'What it means', items: ['Moral premise', 'Controlling idea'] },
    { title: 'Time, viewpoint and knowledge', items: ['Time', 'Viewpoint', 'Knowledge'] },
    NOTES_PAGE,
  ],
  event: [
    { title: 'What happens', items: ['What it does', 'How it happens'] },
    { title: 'When, and who knows', items: ['When', 'Truth and knowledge'] },
    NOTES_PAGE,
  ],
};
PAGE_PLANS.reveal = PAGE_PLANS.event!;
PAGE_PLANS.beat = [
  { title: 'In this book', items: ['In this book'] },
  { title: 'Questions for this beat', items: ['On the board'] },
  NOTES_PAGE,
];

/** Kinds without their own plan are short: everything on one page, then notes and connections. */
export function planFor(kind: string, groups: string[], kindLabel = 'record'): PagePlan[] {
  const own = PAGE_PLANS[kind];
  if (own) return own;
  const named = new Set(NOTES_PAGE.items);
  return [{ title: `The ${kindLabel.toLowerCase()}`, items: groups.filter((g) => !named.has(g)) }, NOTES_PAGE];
}

/** The pages this record actually has: empty pages dropped, any group no page names added to the last page. */
export function pagesFor(kind: string, groups: string[], has: (item: string) => boolean, kindLabel: string): PagePlan[] {
  const plan = planFor(kind, groups, kindLabel);
  const named = new Set(plan.flatMap((p) => p.items));
  const stray = groups.filter((g) => !named.has(g));
  const pages = plan.map((p, i) => ({ title: p.title, items: [...p.items.filter(has), ...(i === plan.length - 1 ? stray : [])] }));
  return pages.filter((p) => p.items.length > 0);
}
